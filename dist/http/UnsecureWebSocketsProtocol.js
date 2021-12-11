"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsecureWebSocketsProtocol = void 0;
const events_1 = require("events");
const LogUtil_1 = require("../logging/LogUtil");
const WebSocketHandler_1 = require("../server/WebSocketHandler");
const HeaderUtil_1 = require("../util/HeaderUtil");
const VERSION = 'solid-0.1';
/**
 * Implementation of Solid WebSockets API Spec solid-0.1
 * at https://github.com/solid/solid-spec/blob/master/api-websockets.md
 */
class WebSocketListener extends events_1.EventEmitter {
    constructor(socket) {
        super();
        this.host = '';
        this.protocol = '';
        this.subscribedPaths = new Set();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.socket = socket;
        socket.addListener('error', () => this.stop());
        socket.addListener('close', () => this.stop());
        socket.addListener('message', (message) => this.onMessage(message));
    }
    start({ headers, socket }) {
        var _a, _b;
        // Greet the client
        this.sendMessage('protocol', VERSION);
        // Verify the WebSocket protocol version
        const protocolHeader = headers['sec-websocket-protocol'];
        if (!protocolHeader) {
            this.sendMessage('warning', `Missing Sec-WebSocket-Protocol header, expected value '${VERSION}'`);
        }
        else {
            const supportedProtocols = protocolHeader.split(/\s*,\s*/u);
            if (!supportedProtocols.includes(VERSION)) {
                this.sendMessage('error', `Client does not support protocol ${VERSION}`);
                this.stop();
            }
        }
        // Store the HTTP host and protocol
        const forwarded = HeaderUtil_1.parseForwarded(headers);
        this.host = (_b = (_a = forwarded.host) !== null && _a !== void 0 ? _a : headers.host) !== null && _b !== void 0 ? _b : 'localhost';
        this.protocol = forwarded.proto === 'https' || socket.secure ? 'https:' : 'http:';
    }
    stop() {
        try {
            this.socket.close();
        }
        catch {
            // Ignore
        }
        this.subscribedPaths.clear();
        this.socket.removeAllListeners();
        this.emit('closed');
    }
    onResourceChanged(modifiedResources) {
        modifiedResources.forEach((modified) => {
            const resourcePath = modified.resource.path;
            if (this.subscribedPaths.has(resourcePath)) {
                this.sendMessage('pub', resourcePath);
            }
        });
    }
    onMessage(message) {
        // Parse the message
        const match = /^(\w+)\s+(.+)$/u.exec(message);
        if (!match) {
            this.sendMessage('warning', `Unrecognized message format: ${message}`);
            return;
        }
        // Process the message
        const [, type, value] = match;
        switch (type) {
            case 'sub':
                this.subscribe(value);
                break;
            default:
                this.sendMessage('warning', `Unrecognized message type: ${type}`);
        }
    }
    subscribe(path) {
        try {
            // Resolve and verify the URL
            const resolved = new URL(path, `${this.protocol}${this.host}`);
            if (resolved.host !== this.host) {
                throw new Error(`Mismatched host: ${resolved.host} instead of ${this.host}`);
            }
            if (resolved.protocol !== this.protocol) {
                throw new Error(`Mismatched protocol: ${resolved.protocol} instead of ${this.protocol}`);
            }
            // Subscribe to the URL
            const url = resolved.href;
            this.subscribedPaths.add(url);
            this.sendMessage('ack', url);
            this.logger.debug(`WebSocket subscribed to changes on ${url}`);
        }
        catch (error) {
            // Report errors to the socket
            const errorText = error.message;
            this.sendMessage('error', errorText);
            this.logger.warn(`WebSocket could not subscribe to ${path}: ${errorText}`);
        }
    }
    sendMessage(type, value) {
        this.socket.send(`${type} ${value}`);
    }
}
/**
 * Provides live update functionality following
 * the Solid WebSockets API Spec solid-0.1
 */
class UnsecureWebSocketsProtocol extends WebSocketHandler_1.WebSocketHandler {
    constructor(source) {
        super();
        this.logger = LogUtil_1.getLoggerFor(this);
        this.listeners = new Set();
        source.on('changed', (modified) => this.onResourceChanged(modified));
    }
    async handle(input) {
        const listener = new WebSocketListener(input.webSocket);
        this.listeners.add(listener);
        this.logger.info(`New WebSocket added, ${this.listeners.size} in total`);
        listener.on('closed', () => {
            this.listeners.delete(listener);
            this.logger.info(`WebSocket closed, ${this.listeners.size} remaining`);
        });
        listener.start(input.upgradeRequest);
    }
    onResourceChanged(modified) {
        for (const listener of this.listeners) {
            listener.onResourceChanged(modified);
        }
    }
}
exports.UnsecureWebSocketsProtocol = UnsecureWebSocketsProtocol;
//# sourceMappingURL=UnsecureWebSocketsProtocol.js.map