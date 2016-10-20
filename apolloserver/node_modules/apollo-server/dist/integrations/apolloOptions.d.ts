import { GraphQLSchema, ValidationRule } from 'graphql';
import { LogFunction } from '../core/runQuery';
interface ApolloOptions {
    schema: GraphQLSchema;
    formatError?: Function;
    rootValue?: any;
    context?: any;
    logFunction?: LogFunction;
    formatParams?: Function;
    validationRules?: Array<ValidationRule>;
    formatResponse?: Function;
    debug?: boolean;
}
export default ApolloOptions;
