"use strict";
const chai_1 = require('chai');
const sinon_1 = require('sinon');
const graphql_1 = require('graphql');
const request = require('supertest-as-promised');
const operationStore_1 = require('../modules/operationStore');
const QueryType = new graphql_1.GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: graphql_1.GraphQLString,
            resolve() {
                return 'it works';
            },
        },
        testContext: {
            type: graphql_1.GraphQLString,
            resolve(_, args, context) {
                return context;
            },
        },
        testRootValue: {
            type: graphql_1.GraphQLString,
            resolve(rootValue) {
                return rootValue;
            },
        },
        testArgument: {
            type: graphql_1.GraphQLString,
            args: { echo: { type: graphql_1.GraphQLString } },
            resolve(root, { echo }) {
                return `hello ${echo}`;
            },
        },
        testError: {
            type: graphql_1.GraphQLString,
            resolve() {
                throw new Error('Secret error message');
            },
        },
    },
});
const MutationType = new graphql_1.GraphQLObjectType({
    name: 'MutationType',
    fields: {
        testMutation: {
            type: graphql_1.GraphQLString,
            args: { echo: { type: graphql_1.GraphQLString } },
            resolve(root, { echo }) {
                return `not really a mutation, but who cares: ${echo}`;
            },
        },
    },
});
exports.Schema = new graphql_1.GraphQLSchema({
    query: QueryType,
    mutation: MutationType,
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (createApp, destroyApp) => {
    describe('apolloServer', () => {
        let app;
        afterEach(() => {
            if (app) {
                if (destroyApp) {
                    destroyApp(app);
                }
                else {
                    app = null;
                }
            }
        });
        describe('graphqlHTTP', () => {
            it('can be called with an options function', () => {
                app = createApp({ apolloOptions: () => ({ schema: exports.Schema }) });
                const expected = {
                    testString: 'it works',
                };
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testString }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data).to.deep.equal(expected);
                });
            });
            it('can be called with an options function that returns a promise', () => {
                app = createApp({ apolloOptions: () => {
                        return new Promise(resolve => {
                            resolve({ schema: exports.Schema });
                        });
                    } });
                const expected = {
                    testString: 'it works',
                };
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testString }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data).to.deep.equal(expected);
                });
            });
            it('throws an error if options promise is rejected', () => {
                app = createApp({ apolloOptions: () => {
                        return Promise.reject({});
                    } });
                const expected = 'Invalid options';
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testString }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(500);
                    return chai_1.expect(res.error.text).to.contain(expected);
                });
            });
            it('rejects the request if the method is not POST', () => {
                app = createApp({ excludeParser: true });
                const req = request(app)
                    .get('/graphql')
                    .send();
                return req.then((res) => {
                    chai_1.expect(res.status).to.be.oneOf([404, 405]);
                });
            });
            it('throws an error if POST body is missing', () => {
                app = createApp({ excludeParser: true });
                const req = request(app)
                    .post('/graphql')
                    .send();
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(500);
                    return chai_1.expect(res.error.text).to.contain('POST body missing.');
                });
            });
            it('can handle a basic request', () => {
                app = createApp();
                const expected = {
                    testString: 'it works',
                };
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testString }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data).to.deep.equal(expected);
                });
            });
            it('can handle a request with variables', () => {
                app = createApp();
                const expected = {
                    testArgument: 'hello world',
                };
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test($echo: String){ testArgument(echo: $echo) }',
                    variables: { echo: 'world' },
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data).to.deep.equal(expected);
                });
            });
            it('can handle a request with variables as string', () => {
                app = createApp();
                const expected = {
                    testArgument: 'hello world',
                };
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test($echo: String!){ testArgument(echo: $echo) }',
                    variables: '{ "echo": "world" }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data).to.deep.equal(expected);
                });
            });
            it('can handle a request with variables as an invalid string', () => {
                app = createApp();
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test($echo: String!){ testArgument(echo: $echo) }',
                    variables: '{ echo: "world" }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(400);
                    return chai_1.expect(res.error.text).to.contain('Variables are invalid JSON.');
                });
            });
            it('can handle a request with operationName', () => {
                app = createApp();
                const expected = {
                    testString: 'it works',
                };
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
                    variables: { echo: 'world' },
                    operationName: 'test2',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data).to.deep.equal(expected);
                });
            });
            it('can handle batch requests', () => {
                app = createApp();
                const expected = [
                    {
                        data: {
                            testString: 'it works',
                        },
                    },
                    {
                        data: {
                            testArgument: 'hello yellow',
                        },
                    },
                ];
                const req = request(app)
                    .post('/graphql')
                    .send([{
                        query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
                        variables: { echo: 'world' },
                        operationName: 'test2',
                    },
                    {
                        query: `
                      query testX($echo: String){ testArgument(echo: $echo) }`,
                        variables: { echo: 'yellow' },
                        operationName: 'testX',
                    }]);
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body).to.deep.equal(expected);
                });
            });
            it('can handle batch requests', () => {
                app = createApp();
                const expected = [
                    {
                        data: {
                            testString: 'it works',
                        },
                    },
                ];
                const req = request(app)
                    .post('/graphql')
                    .send([{
                        query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
                        variables: { echo: 'world' },
                        operationName: 'test2',
                    }]);
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body).to.deep.equal(expected);
                });
            });
            it('can handle a request with a mutation', () => {
                app = createApp();
                const expected = {
                    testMutation: 'not really a mutation, but who cares: world',
                };
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
                    variables: { echo: 'world' },
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data).to.deep.equal(expected);
                });
            });
            it('applies the formatResponse function', () => {
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                        formatResponse(response) {
                            response['extensions'] = { it: 'works' };
                            return response;
                        },
                    } });
                const expected = { it: 'works' };
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
                    variables: { echo: 'world' },
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.extensions).to.deep.equal(expected);
                });
            });
            it('passes the context to the resolver', () => {
                const expected = 'context works';
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                        context: expected,
                    } });
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testContext }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data.testContext).to.equal(expected);
                });
            });
            it('passes the rootValue to the resolver', () => {
                const expected = 'it passes rootValue';
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                        rootValue: expected,
                    } });
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testRootValue }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data.testRootValue).to.equal(expected);
                });
            });
            it('returns errors', () => {
                const expected = 'Secret error message';
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                    } });
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testError }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.errors[0].message).to.equal(expected);
                });
            });
            it('applies formatError if provided', () => {
                const expected = '--blank--';
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                        formatError: (err) => ({ message: expected }),
                    } });
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testError }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.errors[0].message).to.equal(expected);
                });
            });
            it('sends stack trace to error if debug mode is set', () => {
                const expected = /at resolveOrError/;
                const stackTrace = [];
                const origError = console.error;
                console.error = (...args) => stackTrace.push(args);
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                        debug: true,
                    } });
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testError }',
                });
                return req.then((res) => {
                    console.error = origError;
                    return chai_1.expect(stackTrace[0][0]).to.match(expected);
                });
            });
            it('sends stack trace to error log if debug mode is set', () => {
                const logStub = sinon_1.stub(console, 'error');
                const expected = /at resolveOrError/;
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                        debug: true,
                    } });
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testError }',
                });
                return req.then((res) => {
                    logStub.restore();
                    chai_1.expect(logStub.callCount).to.equal(1);
                    return chai_1.expect(logStub.getCall(0).args[0]).to.match(expected);
                });
            });
            it('applies additional validationRules', () => {
                const expected = 'AlwaysInvalidRule was really invalid!';
                const AlwaysInvalidRule = function (context) {
                    return {
                        enter() {
                            context.reportError(new graphql_1.GraphQLError(expected));
                            return graphql_1.BREAK;
                        },
                    };
                };
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                        validationRules: [AlwaysInvalidRule],
                    } });
                const req = request(app)
                    .post('/graphql')
                    .send({
                    query: 'query test{ testString }',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(400);
                    return chai_1.expect(res.body.errors[0].message).to.equal(expected);
                });
            });
        });
        describe('renderGraphiQL', () => {
            it('presents GraphiQL when accepting HTML', () => {
                app = createApp({ graphiqlOptions: {
                        endpointURL: '/graphql',
                    } });
                const req = request(app)
                    .get('/graphiql?query={test}')
                    .set('Accept', 'text/html');
                return req.then((response) => {
                    chai_1.expect(response.status).to.equal(200);
                    chai_1.expect(response.type).to.equal('text/html');
                    chai_1.expect(response.text).to.include('{test}');
                    chai_1.expect(response.text).to.include('/graphql');
                    chai_1.expect(response.text).to.include('graphiql.min.js');
                });
            });
        });
        describe('stored queries', () => {
            it('works with formatParams', () => {
                const store = new operationStore_1.OperationStore(exports.Schema);
                store.put('query testquery{ testString }');
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                        formatParams(params) {
                            params['query'] = store.get(params.operationName);
                            return params;
                        },
                    } });
                const expected = { testString: 'it works' };
                const req = request(app)
                    .post('/graphql')
                    .send({
                    operationName: 'testquery',
                });
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body.data).to.deep.equal(expected);
                });
            });
            it('can reject non-whitelisted queries', () => {
                const store = new operationStore_1.OperationStore(exports.Schema);
                store.put('query testquery{ testString }');
                app = createApp({ apolloOptions: {
                        schema: exports.Schema,
                        formatParams(params) {
                            if (params.query) {
                                throw new Error('Must not provide query, only operationName');
                            }
                            params['query'] = store.get(params.operationName);
                            return params;
                        },
                    } });
                const expected = [{
                        data: {
                            testString: 'it works',
                        },
                    }, {
                        errors: [{
                                message: 'Must not provide query, only operationName',
                            }],
                    }];
                const req = request(app)
                    .post('/graphql')
                    .send([{
                        operationName: 'testquery',
                    }, {
                        query: '{ testString }',
                    }]);
                return req.then((res) => {
                    chai_1.expect(res.status).to.equal(200);
                    return chai_1.expect(res.body).to.deep.equal(expected);
                });
            });
        });
    });
};
//# sourceMappingURL=integrations.test.js.map