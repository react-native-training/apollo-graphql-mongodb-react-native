import { GraphQLSchema, GraphQLResult, Document, ValidationRule } from 'graphql';
export interface GqlResponse {
    data?: Object;
    errors?: Array<string>;
}
export declare enum LogAction {
    request = 0,
    parse = 1,
    validation = 2,
    execute = 3,
}
export declare enum LogStep {
    start = 0,
    end = 1,
    status = 2,
}
export interface LogMessage {
    action: LogAction;
    step: LogStep;
    key?: string;
    data?: Object;
}
export interface LogFunction {
    (message: LogMessage): any;
}
export interface QueryOptions {
    schema: GraphQLSchema;
    query: string | Document;
    rootValue?: any;
    context?: any;
    variables?: {
        [key: string]: any;
    };
    operationName?: string;
    logFunction?: LogFunction;
    validationRules?: Array<ValidationRule>;
    formatError?: Function;
    formatResponse?: Function;
    debug?: boolean;
}
declare function runQuery(options: QueryOptions): Promise<GraphQLResult>;
export { runQuery };
