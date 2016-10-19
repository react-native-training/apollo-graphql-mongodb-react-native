"use strict";
const connect = require('connect');
const bodyParser = require('body-parser');
const connectApollo_1 = require('./connectApollo');
const integrations_test_1 = require('./integrations.test');
function createConnectApp(options = {}) {
    const app = connect();
    options.apolloOptions = options.apolloOptions || { schema: integrations_test_1.Schema };
    if (!options.excludeParser) {
        app.use('/graphql', bodyParser.json());
    }
    if (options.graphiqlOptions) {
        app.use('/graphiql', connectApollo_1.graphiqlConnect(options.graphiqlOptions));
    }
    app.use('/graphql', connectApollo_1.apolloConnect(options.apolloOptions));
    return app;
}
describe('integration:Connect', () => {
    integrations_test_1.default(createConnectApp);
});
//# sourceMappingURL=connectApollo.test.js.map