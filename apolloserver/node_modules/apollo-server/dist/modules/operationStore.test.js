"use strict";
const chai_1 = require('chai');
const graphql_1 = require('graphql');
const operationStore_1 = require('./operationStore');
const QueryType = new graphql_1.GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: graphql_1.GraphQLString,
        },
        testRootValue: {
            type: graphql_1.GraphQLString,
        },
        testContextValue: {
            type: graphql_1.GraphQLString,
        },
        testArgumentValue: {
            type: graphql_1.GraphQLInt,
            args: {
                base: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
            },
        },
    },
});
const Schema = new graphql_1.GraphQLSchema({
    query: QueryType,
});
describe('operationStore', () => {
    it('can store a query and return its ast', () => {
        const query = `query testquery{ testString }`;
        const expected = `query testquery {\n  testString\n}\n`;
        const store = new operationStore_1.OperationStore(Schema);
        store.put(query);
        return chai_1.expect(graphql_1.print(store.get('testquery'))).to.deep.equal(expected);
    });
    it('can store a Document and return its ast', () => {
        const query = `query testquery{ testString }`;
        const expected = `query testquery {\n  testString\n}\n`;
        const store = new operationStore_1.OperationStore(Schema);
        store.put(graphql_1.parse(query));
        return chai_1.expect(graphql_1.print(store.get('testquery'))).to.deep.equal(expected);
    });
    it('can store queries and return them with getMap', () => {
        const query = `query testquery{ testString }`;
        const query2 = `query testquery2{ testRootValue }`;
        const store = new operationStore_1.OperationStore(Schema);
        store.put(query);
        store.put(query2);
        return chai_1.expect(store.getMap().size).to.equal(2);
    });
    it('throws a parse error if the query is invalid', () => {
        const query = `query testquery{ testString`;
        const store = new operationStore_1.OperationStore(Schema);
        return chai_1.expect(() => store.put(query)).to.throw(/Syntax Error GraphQL/);
    });
    it('throws a validation error if the query is invalid', () => {
        const query = `query testquery { testStrin }`;
        const store = new operationStore_1.OperationStore(Schema);
        return chai_1.expect(() => store.put(query)).to.throw(/Cannot query field/);
    });
    it('throws an error if there is more than one query or mutation', () => {
        const query = `
        query Q1{ testString }
        query Q2{ t2: testString }
      `;
        const store = new operationStore_1.OperationStore(Schema);
        return chai_1.expect(() => store.put(query)).to.throw(/operationDefinition must contain only one definition/);
    });
    it('throws an error if there is no operationDefinition found', () => {
        const query = `
        schema {
            query: Q
        }
      `;
        const store = new operationStore_1.OperationStore(Schema);
        return chai_1.expect(() => store.put(query)).to.throw(/must contain at least/);
    });
    it('can delete stored operations', () => {
        const query = `query testquery{ testString }`;
        const store = new operationStore_1.OperationStore(Schema);
        store.put(query);
        store.delete('testquery');
        return chai_1.expect(store.get('testquery')).to.be.undefined;
    });
});
//# sourceMappingURL=operationStore.test.js.map