"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAccountStore = void 0;
const assert_1 = __importDefault(require("assert"));
const bcrypt_1 = require("bcrypt");
const uuid_1 = require("uuid");
/**
 * A EmailPasswordStore that uses a KeyValueStorage
 * to persist its information.
 */
class BaseAccountStore {
    constructor(storage, saltRounds) {
        this.storage = storage;
        this.saltRounds = saltRounds;
    }
    /**
     * Generates a ResourceIdentifier to store data for the given email.
     */
    getAccountResourceIdentifier(email) {
        return `account/${encodeURIComponent(email)}`;
    }
    /**
     * Generates a ResourceIdentifier to store data for the given recordId.
     */
    getForgotPasswordRecordResourceIdentifier(recordId) {
        return `forgot-password-resource-identifier/${encodeURIComponent(recordId)}`;
    }
    async getAccountPayload(email, checkExistence) {
        const key = this.getAccountResourceIdentifier(email);
        const account = await this.storage.get(key);
        assert_1.default(!checkExistence || account, 'Account does not exist');
        return { key, account };
    }
    /* eslint-enable lines-between-class-members */
    async authenticate(email, password) {
        const { account } = await this.getAccountPayload(email, true);
        assert_1.default(account.verified, 'Account still needs to be verified');
        assert_1.default(await bcrypt_1.compare(password, account.password), 'Incorrect password');
        return account.webId;
    }
    async create(email, webId, password, settings) {
        const { key, account } = await this.getAccountPayload(email, false);
        assert_1.default(!account, 'Account already exists');
        // Make sure there is no other account for this WebID
        const storedSettings = await this.storage.get(webId);
        assert_1.default(!storedSettings, 'There already is an account for this WebID');
        const payload = {
            email,
            password: await bcrypt_1.hash(password, this.saltRounds),
            verified: false,
            webId,
        };
        await this.storage.set(key, payload);
        await this.storage.set(webId, settings);
    }
    async verify(email) {
        const { key, account } = await this.getAccountPayload(email, true);
        account.verified = true;
        await this.storage.set(key, account);
    }
    async changePassword(email, password) {
        const { key, account } = await this.getAccountPayload(email, true);
        account.password = await bcrypt_1.hash(password, this.saltRounds);
        await this.storage.set(key, account);
    }
    async getSettings(webId) {
        const settings = await this.storage.get(webId);
        assert_1.default(settings, 'Account does not exist');
        return settings;
    }
    async updateSettings(webId, settings) {
        const oldSettings = await this.storage.get(webId);
        assert_1.default(oldSettings, 'Account does not exist');
        await this.storage.set(webId, settings);
    }
    async deleteAccount(email) {
        const { key, account } = await this.getAccountPayload(email, false);
        if (account) {
            await this.storage.delete(key);
            await this.storage.delete(account.webId);
        }
    }
    async generateForgotPasswordRecord(email) {
        const recordId = uuid_1.v4();
        await this.getAccountPayload(email, true);
        await this.storage.set(this.getForgotPasswordRecordResourceIdentifier(recordId), { recordId, email });
        return recordId;
    }
    async getForgotPasswordRecord(recordId) {
        const identifier = this.getForgotPasswordRecordResourceIdentifier(recordId);
        const forgotPasswordRecord = await this.storage.get(identifier);
        return forgotPasswordRecord === null || forgotPasswordRecord === void 0 ? void 0 : forgotPasswordRecord.email;
    }
    async deleteForgotPasswordRecord(recordId) {
        await this.storage.delete(this.getForgotPasswordRecordResourceIdentifier(recordId));
    }
}
exports.BaseAccountStore = BaseAccountStore;
//# sourceMappingURL=BaseAccountStore.js.map