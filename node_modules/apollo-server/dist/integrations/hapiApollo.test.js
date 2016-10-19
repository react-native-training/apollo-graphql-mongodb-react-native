"use strict";
const hapi = require('hapi');
const hapiApollo_1 = require('./hapiApollo');
const integrations_test_1 = require('./integrations.test');
function createApp(createOptions) {
    const server = new hapi.Server();
    server.connection({
        host: 'localhost',
        port: 8000,
    });
    server.register({
        register: hapiApollo_1.apolloHapi,
        options: {
            apolloOptions: createOptions ? createOptions.apolloOptions : { schema: integrations_test_1.Schema },
            path: '/graphql',
        },
    });
    server.register({
        register: hapiApollo_1.graphiqlHapi,
        options: {
            path: '/graphiql',
            graphiqlOptions: {
                endpointURL: '/graphql',
            },
        },
    });
    return server.listener;
}
describe('integration:Hapi', () => {
    integrations_test_1.default(createApp);
});
//# sourceMappingURL=hapiApollo.test.js.map