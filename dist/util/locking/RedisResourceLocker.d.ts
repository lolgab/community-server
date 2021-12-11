import type { ResourceIdentifier } from '../../http/representation/ResourceIdentifier';
import type { Finalizable } from '../../init/final/Finalizable';
import type { ResourceLocker } from './ResourceLocker';
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
export declare class RedisResourceLocker implements ResourceLocker, Finalizable {
    protected readonly logger: import("../..").Logger;
    private readonly redlock;
    private readonly lockMap;
    constructor(redisClients: string[], redlockOptions?: Record<string, number>);
    /**
     * Generate and return a list of RedisClients based on the provided strings
     * @param redisClientsStrings - a list of strings that contain either a host address and a
     * port number like '127.0.0.1:6379' or just a port number like '6379'
     */
    private createRedisClients;
    /**
     * Generate and return a Redlock instance
     * @param clients - a list of RedisClients you want to use for the redlock instance
     * @param redlockOptions - extra redlock options to overwrite the default config
     */
    private createRedlock;
    finalize(): Promise<void>;
    acquire(identifier: ResourceIdentifier): Promise<void>;
    release(identifier: ResourceIdentifier): Promise<void>;
    /**
     * Counts the number of active locks.
     */
    private getLockCount;
    /**
     * This function is internally used to keep an acquired lock active, a wrapper class will handle expiration
     * @param identifier - Identifier of the lock to be extended
     */
    private extendLockIndefinitely;
}
