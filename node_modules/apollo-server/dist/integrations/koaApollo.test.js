"use strict";
const koa = require('koa');
const koaRouter = require('koa-router');
const koaBody = require('koa-bodyparser');
const koaApollo_1 = require('./koaApollo');
const chai_1 = require('chai');
const http = require('http');
const integrations_test_1 = require('./integrations.test');
function createApp(options = {}) {
    const app = new koa();
    const router = new koaRouter();
    options.apolloOptions = options.apolloOptions || { schema: integrations_test_1.Schema };
    if (!options.excludeParser) {
        app.use(koaBody());
    }
    if (options.graphiqlOptions) {
        router.get('/graphiql', koaApollo_1.graphiqlKoa(options.graphiqlOptions));
    }
    router.post('/graphql', koaApollo_1.apolloKoa(options.apolloOptions));
    app.use(router.routes());
    app.use(router.allowedMethods());
    return http.createServer(app.callback());
}
function destroyApp(app) {
    app.close();
}
describe('koaApollo', () => {
    it('throws error if called without schema', function () {
        chai_1.expect(() => koaApollo_1.apolloKoa(undefined)).to.throw('Apollo Server requires options.');
    });
    it('throws an error if called with more than one argument', function () {
        chai_1.expect(() => koaApollo_1.apolloKoa({}, 'x')).to.throw('Apollo Server expects exactly one argument, got 2');
    });
});
describe('integration:Koa', () => {
    integrations_test_1.default(createApp, destroyApp);
});
//# sourceMappingURL=koaApollo.test.js.map