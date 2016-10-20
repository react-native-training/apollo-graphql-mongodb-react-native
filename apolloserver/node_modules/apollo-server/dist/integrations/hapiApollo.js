"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Boom = require('boom');
const graphql_1 = require('graphql');
const GraphiQL = require('../modules/renderGraphiQL');
const runQuery_1 = require('../core/runQuery');
const apolloHapi = function (server, options, next) {
    server.method('verifyPayload', verifyPayload);
    server.method('getGraphQLParams', getGraphQLParams);
    server.method('getApolloOptions', getApolloOptions);
    server.method('processQuery', processQuery);
    const config = Object.assign(options.route || {}, {
        plugins: {
            graphql: options.apolloOptions,
        },
        pre: [{
                assign: 'isBatch',
                method: 'verifyPayload(payload)',
            }, {
                assign: 'graphqlParams',
                method: 'getGraphQLParams(payload, pre.isBatch)',
            }, {
                assign: 'apolloOptions',
                method: 'getApolloOptions',
            }, {
                assign: 'graphQL',
                method: 'processQuery(pre.graphqlParams, pre.apolloOptions)',
            }],
    });
    server.route({
        method: 'POST',
        path: options.path || '/graphql',
        config: config,
        handler: function (request, reply) {
            const responses = request.pre.graphQL;
            if (request.pre.isBatch) {
                return reply(responses);
            }
            else {
                const gqlResponse = responses[0];
                if (gqlResponse.errors && typeof gqlResponse.data === 'undefined') {
                    return reply(gqlResponse).code(400);
                }
                else {
                    return reply(gqlResponse);
                }
            }
        },
    });
    return next();
};
exports.apolloHapi = apolloHapi;
apolloHapi.attributes = {
    name: 'graphql',
    version: '0.0.1',
};
function verifyPayload(payload, reply) {
    if (!payload) {
        return reply(createErr(500, 'POST body missing.'));
    }
    reply(payload && Array.isArray(payload));
}
function getGraphQLParams(payload, isBatch, reply) {
    if (!isBatch) {
        payload = [payload];
    }
    const params = [];
    for (let query of payload) {
        let variables = query.variables;
        if (variables && typeof variables === 'string') {
            try {
                variables = JSON.parse(variables);
            }
            catch (error) {
                return reply(createErr(400, 'Variables are invalid JSON.'));
            }
        }
        params.push({
            query: query.query,
            variables: variables,
            operationName: query.operationName,
        });
    }
    reply(params);
}
;
function getApolloOptions(request, reply) {
    return __awaiter(this, void 0, Promise, function* () {
        const options = request.route.settings.plugins['graphql'];
        let optionsObject;
        if (isOptionsFunction(options)) {
            try {
                const opsFunc = options;
                optionsObject = yield opsFunc(request);
            }
            catch (e) {
                return reply(createErr(500, `Invalid options provided to ApolloServer: ${e.message}`));
            }
        }
        else {
            optionsObject = options;
        }
        reply(optionsObject);
    });
}
function processQuery(graphqlParams, optionsObject, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        const formatErrorFn = optionsObject.formatError || graphql_1.formatError;
        let responses = [];
        for (let query of graphqlParams) {
            try {
                let params = {
                    schema: optionsObject.schema,
                    query: query.query,
                    variables: query.variables,
                    rootValue: optionsObject.rootValue,
                    context: optionsObject.context,
                    operationName: query.operationName,
                    logFunction: optionsObject.logFunction,
                    validationRules: optionsObject.validationRules,
                    formatError: formatErrorFn,
                    formatResponse: optionsObject.formatResponse,
                    debug: optionsObject.debug,
                };
                if (optionsObject.formatParams) {
                    params = optionsObject.formatParams(params);
                }
                responses.push(yield runQuery_1.runQuery(params));
            }
            catch (e) {
                responses.push({ errors: [formatErrorFn(e)] });
            }
        }
        return reply(responses);
    });
}
function isOptionsFunction(arg) {
    return typeof arg === 'function';
}
function createErr(code, message) {
    const err = Boom.create(code);
    err.output.payload.message = message;
    return err;
}
const graphiqlHapi = function (server, options, next) {
    server.method('getGraphiQLParams', getGraphiQLParams);
    server.method('renderGraphiQL', renderGraphiQL);
    const config = Object.assign(options.route || {}, {
        plugins: {
            graphiql: options.graphiqlOptions,
        },
        pre: [{
                assign: 'graphiqlParams',
                method: 'getGraphiQLParams',
            }, {
                assign: 'graphiQLString',
                method: 'renderGraphiQL(route, pre.graphiqlParams)',
            }],
    });
    server.route({
        method: 'GET',
        path: options.path || '/graphql',
        config: config,
        handler: (request, reply) => {
            reply(request.pre.graphiQLString).header('Content-Type', 'text/html');
        },
    });
    next();
};
exports.graphiqlHapi = graphiqlHapi;
graphiqlHapi.attributes = {
    name: 'graphiql',
    version: '0.0.1',
};
function getGraphiQLParams(request, reply) {
    const q = request.query || {};
    const query = q.query || '';
    const variables = q.variables || '{}';
    const operationName = q.operationName || '';
    reply({ query: query, variables: variables, operationName: operationName });
}
function renderGraphiQL(route, graphiqlParams, reply) {
    const graphiqlOptions = route.settings.plugins['graphiql'];
    const graphiQLString = GraphiQL.renderGraphiQL({
        endpointURL: graphiqlOptions.endpointURL,
        query: graphiqlParams.query || graphiqlOptions.query,
        variables: JSON.parse(graphiqlParams.variables) || graphiqlOptions.variables,
        operationName: graphiqlParams.operationName || graphiqlOptions.operationName,
    });
    reply(graphiQLString);
}
//# sourceMappingURL=hapiApollo.js.map