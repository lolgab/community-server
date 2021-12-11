"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseHttpClient = void 0;
const http_1 = require("http");
class BaseHttpClient {
    call(target, options, data, callback) {
        const req = http_1.request(target, options, callback);
        req.write(data);
        req.end();
    }
}
exports.BaseHttpClient = BaseHttpClient;
//# sourceMappingURL=BaseHttpClient.js.map