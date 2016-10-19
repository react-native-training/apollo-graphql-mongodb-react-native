"use strict";
const graphql_1 = require('graphql');
(function (LogAction) {
    LogAction[LogAction["request"] = 0] = "request";
    LogAction[LogAction["parse"] = 1] = "parse";
    LogAction[LogAction["validation"] = 2] = "validation";
    LogAction[LogAction["execute"] = 3] = "execute";
})(exports.LogAction || (exports.LogAction = {}));
var LogAction = exports.LogAction;
(function (LogStep) {
    LogStep[LogStep["start"] = 0] = "start";
    LogStep[LogStep["end"] = 1] = "end";
    LogStep[LogStep["status"] = 2] = "status";
})(exports.LogStep || (exports.LogStep = {}));
var LogStep = exports.LogStep;
const resolvedPromise = Promise.resolve();
function runQuery(options) {
    return resolvedPromise.then(() => doRunQuery(options));
}
exports.runQuery = runQuery;
function doRunQuery(options) {
    let documentAST;
    const logFunction = options.logFunction || function () { return null; };
    const debugDefault = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
    const debug = typeof options.debug !== 'undefined' ? options.debug : debugDefault;
    logFunction({ action: LogAction.request, step: LogStep.start });
    function format(errors) {
        return errors.map(options.formatError || graphql_1.formatError);
    }
    function printStackTrace(error) {
        console.error(error.stack);
    }
    const qry = typeof options.query === 'string' ? options.query : graphql_1.print(options.query);
    logFunction({ action: LogAction.request, step: LogStep.status, key: 'query', data: qry });
    logFunction({ action: LogAction.request, step: LogStep.status, key: 'variables', data: options.variables });
    logFunction({ action: LogAction.request, step: LogStep.status, key: 'operationName', data: options.operationName });
    if (typeof options.query === 'string') {
        try {
            logFunction({ action: LogAction.parse, step: LogStep.start });
            documentAST = graphql_1.parse(options.query);
            logFunction({ action: LogAction.parse, step: LogStep.end });
        }
        catch (syntaxError) {
            logFunction({ action: LogAction.parse, step: LogStep.end });
            return Promise.resolve({ errors: format([syntaxError]) });
        }
        let rules = graphql_1.specifiedRules;
        if (options.validationRules) {
            rules = rules.concat(options.validationRules);
        }
        logFunction({ action: LogAction.validation, step: LogStep.start });
        const validationErrors = graphql_1.validate(options.schema, documentAST, rules);
        logFunction({ action: LogAction.validation, step: LogStep.end });
        if (validationErrors.length) {
            return Promise.resolve({ errors: format(validationErrors) });
        }
    }
    else {
        documentAST = options.query;
    }
    try {
        logFunction({ action: LogAction.execute, step: LogStep.start });
        return graphql_1.execute(options.schema, documentAST, options.rootValue, options.context, options.variables, options.operationName).then(gqlResponse => {
            logFunction({ action: LogAction.execute, step: LogStep.end });
            logFunction({ action: LogAction.request, step: LogStep.end });
            let response = {
                data: gqlResponse.data,
            };
            if (gqlResponse.errors) {
                response['errors'] = format(gqlResponse.errors);
                if (debug) {
                    gqlResponse.errors.map(printStackTrace);
                }
            }
            if (options.formatResponse) {
                response = options.formatResponse(response, options);
            }
            return response;
        });
    }
    catch (executionError) {
        logFunction({ action: LogAction.execute, step: LogStep.end });
        logFunction({ action: LogAction.request, step: LogStep.end });
        return Promise.resolve({ errors: format([executionError]) });
    }
}
//# sourceMappingURL=runQuery.js.map