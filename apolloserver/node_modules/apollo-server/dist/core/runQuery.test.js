"use strict";
const chai_1 = require('chai');
const sinon_1 = require('sinon');
const graphql_1 = require('graphql');
const runQuery_1 = require('./runQuery');
const meteor_promise_1 = require('meteor-promise');
const Fiber = require('fibers');
meteor_promise_1.makeCompatible(Promise, Fiber);
const QueryType = new graphql_1.GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: graphql_1.GraphQLString,
            resolve() {
                return 'it works';
            },
        },
        testRootValue: {
            type: graphql_1.GraphQLString,
            resolve(root) {
                return root + ' works';
            },
        },
        testContextValue: {
            type: graphql_1.GraphQLString,
            resolve(root, args, context) {
                return context + ' works';
            },
        },
        testArgumentValue: {
            type: graphql_1.GraphQLInt,
            resolve(root, args, context) {
                return args['base'] + 5;
            },
            args: {
                base: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
            },
        },
        testAwaitedValue: {
            type: graphql_1.GraphQLString,
            resolve(root) {
                return 'it ' + Promise.await('works');
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
const Schema = new graphql_1.GraphQLSchema({
    query: QueryType,
});
describe('runQuery', () => {
    it('returns the right result when query is a string', () => {
        const query = `{ testString }`;
        const expected = { testString: 'it works' };
        return runQuery_1.runQuery({ schema: Schema, query: query })
            .then((res) => {
            return chai_1.expect(res.data).to.deep.equal(expected);
        });
    });
    it('returns the right result when query is a document', () => {
        const query = graphql_1.parse(`{ testString }`);
        const expected = { testString: 'it works' };
        return runQuery_1.runQuery({ schema: Schema, query: query })
            .then((res) => {
            return chai_1.expect(res.data).to.deep.equal(expected);
        });
    });
    it('returns a syntax error if the query string contains one', () => {
        const query = `query { test `;
        const expected = /Syntax Error GraphQL/;
        return runQuery_1.runQuery({
            schema: Schema,
            query: query,
            variables: { base: 1 },
        }).then((res) => {
            chai_1.expect(res.data).to.be.undefined;
            chai_1.expect(res.errors.length).to.equal(1);
            return chai_1.expect(res.errors[0].message).to.match(expected);
        });
    });
    it('sends stack trace to error if in an error occurs and debug mode is set', () => {
        const query = `query { testError }`;
        const expected = /at resolveOrError/;
        const logStub = sinon_1.stub(console, 'error');
        return runQuery_1.runQuery({
            schema: Schema,
            query: query,
            debug: true,
        }).then((res) => {
            logStub.restore();
            chai_1.expect(logStub.callCount).to.equal(1);
            return chai_1.expect(logStub.getCall(0).args[0]).to.match(expected);
        });
    });
    it('does not send stack trace if in an error occurs and not in debug mode', () => {
        const query = `query { testError }`;
        const logStub = sinon_1.stub(console, 'error');
        return runQuery_1.runQuery({
            schema: Schema,
            query: query,
            debug: false,
        }).then((res) => {
            logStub.restore();
            return chai_1.expect(logStub.callCount).to.equal(0);
        });
    });
    it('returns a validation error if the query string does not pass validation', () => {
        const query = `query TestVar($base: String){ testArgumentValue(base: $base) }`;
        const expected = 'Variable "$base" of type "String" used in position expecting type "Int!".';
        return runQuery_1.runQuery({
            schema: Schema,
            query: query,
            variables: { base: 1 },
        }).then((res) => {
            chai_1.expect(res.data).to.be.undefined;
            chai_1.expect(res.errors.length).to.equal(1);
            return chai_1.expect(res.errors[0].message).to.deep.equal(expected);
        });
    });
    it('does not run validation if the query is a document', () => {
        const query = graphql_1.parse(`query TestVar($base: String){ testArgumentValue(base: $base) }`);
        const expected = { testArgumentValue: 15 };
        return runQuery_1.runQuery({
            schema: Schema,
            query: query,
            variables: { base: 1 },
        }).then((res) => {
            return chai_1.expect(res.data).to.deep.equal(expected);
        });
    });
    it('correctly passes in the rootValue', () => {
        const query = `{ testRootValue }`;
        const expected = { testRootValue: 'it also works' };
        return runQuery_1.runQuery({ schema: Schema, query: query, rootValue: 'it also' })
            .then((res) => {
            return chai_1.expect(res.data).to.deep.equal(expected);
        });
    });
    it('correctly passes in the context', () => {
        const query = `{ testContextValue }`;
        const expected = { testContextValue: 'it still works' };
        return runQuery_1.runQuery({ schema: Schema, query: query, context: 'it still' })
            .then((res) => {
            return chai_1.expect(res.data).to.deep.equal(expected);
        });
    });
    it('passes the options to formatResponse', () => {
        const query = `{ testContextValue }`;
        const expected = { testContextValue: 'it still works' };
        return runQuery_1.runQuery({
            schema: Schema,
            query: query,
            context: 'it still',
            formatResponse: (response, { context }) => {
                response['extensions'] = context;
                return response;
            },
        })
            .then((res) => {
            chai_1.expect(res.data).to.deep.equal(expected);
            return chai_1.expect(res['extensions']).to.equal('it still');
        });
    });
    it('correctly passes in variables (and arguments)', () => {
        const query = `query TestVar($base: Int!){ testArgumentValue(base: $base) }`;
        const expected = { testArgumentValue: 6 };
        return runQuery_1.runQuery({
            schema: Schema,
            query: query,
            variables: { base: 1 },
        }).then((res) => {
            return chai_1.expect(res.data).to.deep.equal(expected);
        });
    });
    it('throws an error if there are missing variables', () => {
        const query = `query TestVar($base: Int!){ testArgumentValue(base: $base) }`;
        const expected = 'Variable "$base" of required type "Int!" was not provided.';
        return runQuery_1.runQuery({
            schema: Schema,
            query: query,
        }).then((res) => {
            return chai_1.expect(res.errors[0].message).to.deep.equal(expected);
        });
    });
    it('supports yielding resolver functions', () => {
        return runQuery_1.runQuery({
            schema: Schema,
            query: `{ testAwaitedValue }`,
        }).then((res) => {
            chai_1.expect(res.data).to.deep.equal({
                testAwaitedValue: 'it works',
            });
        });
    });
    it('runs the correct operation when operationName is specified', () => {
        const query = `
        query Q1 {
            testString
        }
        query Q2 {
            testRootValue
        }`;
        const expected = {
            testString: 'it works',
        };
        return runQuery_1.runQuery({ schema: Schema, query: query, operationName: 'Q1' })
            .then((res) => {
            return chai_1.expect(res.data).to.deep.equal(expected);
        });
    });
    it('calls logFunction', () => {
        const query = `
        query Q1 {
            testString
        }`;
        const logs = [];
        const logFn = (obj) => logs.push(obj);
        const expected = {
            testString: 'it works',
        };
        return runQuery_1.runQuery({
            schema: Schema,
            query: query,
            operationName: 'Q1',
            variables: { test: 123 },
            logFunction: logFn,
        })
            .then((res) => {
            chai_1.expect(res.data).to.deep.equal(expected);
            chai_1.expect(logs.length).to.equals(11);
            chai_1.expect(logs[0]).to.deep.equals({ action: runQuery_1.LogAction.request, step: runQuery_1.LogStep.start });
            chai_1.expect(logs[1]).to.deep.equals({ action: runQuery_1.LogAction.request, step: runQuery_1.LogStep.status, key: 'query', data: query });
            chai_1.expect(logs[2]).to.deep.equals({ action: runQuery_1.LogAction.request, step: runQuery_1.LogStep.status, key: 'variables', data: { test: 123 } });
            chai_1.expect(logs[3]).to.deep.equals({ action: runQuery_1.LogAction.request, step: runQuery_1.LogStep.status, key: 'operationName', data: 'Q1' });
            chai_1.expect(logs[10]).to.deep.equals({ action: runQuery_1.LogAction.request, step: runQuery_1.LogStep.end });
        });
    });
});
//# sourceMappingURL=runQuery.test.js.map