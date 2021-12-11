"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisResourceLocker = void 0;
const console_1 = require("console");
const redis_1 = require("redis");
const redlock_1 = __importDefault(require("redlock"));
const LogUtil_1 = require("../../logging/LogUtil");
const InternalServerError_1 = require("../errors/InternalServerError");
// The ttl set on a lock, not really important cause redlock wil not handle expiration
const ttl = 10000;
// The default redlock config
const defaultRedlockConfig = {
    // The expected clock drift; for more details
    // see http://redis.io/topics/distlock
    // Multiplied by lock ttl to determine drift time
    driftFactor: 0.01,
    // The max number of times Redlock will attempt
    // to lock a resource before erroring
    retryCount: 1000000,
    // The time in ms between attempts
    retryDelay: 200,
    // The max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200,
};
/**
 * A locking system that uses a Redis server or any number of
 * Redis nodes / clusters
 * This solution has issues though:
 *  - Redlock wants to handle expiration itself, this is against the design of a ResourceLocker.
 *    The workaround for this is to extend an active lock indefinitely.
 *  - This solution is not multithreaded! If threadA locks a resource, only threadA can unlock this resource.
 *    If threadB wont be able to lock a resource if threadA already acquired that lock,
 *    in that sense it is kind of multithreaded.
 *  - Redlock does not provide the ability to see which locks have expired
 */
class RedisResourceLocker {
    constructor(redisClients, redlockOptions) {
        this.logger = LogUtil_1.getLoggerFor(this);
        this.lockMap = new Map();
        const clients = this.createRedisClients(redisClients);
        if (clients.length === 0) {
            throw new Error('At least 1 client should be provided');
        }
        this.redlock = this.createRedlock(clients, redlockOptions);
        this.redlock.on('clientError', (err) => {
            this.logger.error(`Redis/Redlock error: ${err}`);
        });
    }
    /**
     * Generate and return a list of RedisClients based on the provided strings
     * @param redisClientsStrings - a list of strings that contain either a host address and a
     * port number like '127.0.0.1:6379' or just a port number like '6379'
     */
    createRedisClients(redisClientsStrings) {
        const result = [];
        if (redisClientsStrings && redisClientsStrings.length > 0) {
            for (const client of redisClientsStrings) {
                // Check if port number or ip with port number
                // Definitely not perfect, but configuring this is only for experienced users
                const match = new RegExp(/^(?:([^:]+):)?(\d{4,5})$/u, 'u').exec(client);
                if (!match || !match[2]) {
                    // At least a port number should be provided
                    throw new Error(`Invalid data provided to create a Redis client: ${client}\n
            Please provide a port number like '6379' or a host address and a port number like '127.0.0.1:6379'`);
                }
                const port = Number(match[2]);
                const host = match[1];
                const redisclient = redis_1.createClient(port, host);
                result.push(redisclient);
            }
        }
        return result;
    }
    /**
     * Generate and return a Redlock instance
     * @param clients - a list of RedisClients you want to use for the redlock instance
     * @param redlockOptions - extra redlock options to overwrite the default config
     */
    createRedlock(clients, redlockOptions = {}) {
        try {
            return new redlock_1.default(clients, { ...defaultRedlockConfig, ...redlockOptions });
        }
        catch (error) {
            throw new InternalServerError_1.InternalServerError(`Error initializing Redlock: ${error}`, { cause: error });
        }
    }
    async finalize() {
        // This for loop is an extra failsafe,
        // this extra code won't slow down anything, this function will only be called to shut down in peace
        try {
            for (const [, { lock }] of this.lockMap.entries()) {
                await this.release({ path: lock.resource });
            }
        }
        finally {
            await this.redlock.quit();
        }
    }
    async acquire(identifier) {
        const resource = identifier.path;
        let lock;
        try {
            lock = await this.redlock.lock(resource, ttl);
            console_1.assert(lock);
        }
        catch (error) {
            this.logger.debug(`Unable to acquire lock for ${resource}`);
            throw new InternalServerError_1.InternalServerError(`Unable to acquire lock for ${resource} (${error})`, { cause: error });
        }
        if (this.lockMap.get(resource)) {
            throw new InternalServerError_1.InternalServerError(`Acquired duplicate lock on ${resource}`);
        }
        // Lock acquired
        this.logger.debug(`Acquired lock for resource: ${resource}!`);
        const interval = this.extendLockIndefinitely(resource);
        this.lockMap.set(resource, { lock, interval });
    }
    async release(identifier) {
        const resource = identifier.path;
        const entry = this.lockMap.get(resource);
        if (!entry) {
            // Lock is invalid
            this.logger.warn(`Unexpected release request for non-existent lock on ${resource}`);
            throw new InternalServerError_1.InternalServerError(`Trying to unlock resource that is not locked: ${resource}`);
        }
        try {
            await this.redlock.unlock(entry.lock);
            clearInterval(entry.interval);
            this.lockMap.delete(resource);
            // Successfully released lock
            this.logger.debug(`Released lock for ${resource}, ${this.getLockCount()} active locks remaining!`);
        }
        catch (error) {
            this.logger.error(`Error releasing lock for ${resource} (${error})`);
            throw new InternalServerError_1.InternalServerError(`Unable to release lock for: ${resource}, ${error}`, { cause: error });
        }
    }
    /**
     * Counts the number of active locks.
     */
    getLockCount() {
        return this.lockMap.size;
    }
    /**
     * This function is internally used to keep an acquired lock active, a wrapper class will handle expiration
     * @param identifier - Identifier of the lock to be extended
     */
    extendLockIndefinitely(identifier) {
        return setInterval(async () => {
            const entry = this.lockMap.get(identifier);
            try {
                const newLock = await this.redlock.extend(entry.lock, ttl);
                this.lockMap.set(identifier, { lock: newLock, interval: entry.interval });
                this.logger.debug(`Extended (Redis)lock for resource: ${identifier}`);
            }
            catch (error) {
                // No error should be re-thrown because this means the lock has simply been released
                this.logger.error(`Failed to extend this (Redis)lock for resource: ${identifier}, ${error}`);
                clearInterval(entry.interval);
                this.lockMap.delete(identifier);
            }
        }, ttl / 2);
    }
}
exports.RedisResourceLocker = RedisResourceLocker;
//# sourceMappingURL=RedisResourceLocker.js.map