"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateWellKnownBuilder = void 0;
class AggregateWellKnownBuilder {
    constructor(wellKnownBuilders) {
        this.wellKnownBuilders = wellKnownBuilders;
    }
    async getWellKnownSegment() {
        const wellKnowns = [];
        await Promise.all(this.wellKnownBuilders.map(async (builder) => {
            wellKnowns.push(await builder.getWellKnownSegment());
        }));
        const wellKnown = wellKnowns.reduce((aggWellKnown, newWellKnown) => ({
            ...aggWellKnown,
            ...newWellKnown,
        }), {});
        return wellKnown;
    }
}
exports.AggregateWellKnownBuilder = AggregateWellKnownBuilder;
//# sourceMappingURL=AggregateWellKnownBuilder.js.map