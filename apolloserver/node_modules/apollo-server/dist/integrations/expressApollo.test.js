"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const expressApollo_1 = require('./expressApollo');
const integrations_test_1 = require('./integrations.test');
const chai_1 = require('chai');
function createApp(options = {}) {
    const app = express();
    options.apolloOptions = options.apolloOptions || { schema: integrations_test_1.Schema };
    if (!options.excludeParser) {
        app.use('/graphql', bodyParser.json());
    }
    if (options.graphiqlOptions) {
        app.use('/graphiql', expressApollo_1.graphiqlExpress(options.graphiqlOptions));
    }
    app.use('/graphql', expressApollo_1.apolloExpress(options.apolloOptions));
    return app;
}
describe('expressApollo', () => {
    it('throws error if called without schema', function () {
        chai_1.expect(() => expressApollo_1.apolloExpress(undefined)).to.throw('Apollo Server requires options.');
    });
    it('throws an error if called with more than one argument', function () {
        chai_1.expect(() => expressApollo_1.apolloExpress({}, 'x')).to.throw('Apollo Server expects exactly one argument, got 2');
    });
});
describe('integration:Express', () => {
    integrations_test_1.default(createApp);
});
//# sourceMappingURL=expressApollo.test.js.map