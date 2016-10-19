import { GraphQLSchema } from 'graphql';
import ApolloOptions from './apolloOptions';
import * as GraphiQL from '../modules/renderGraphiQL';
export declare const Schema: GraphQLSchema;
export interface CreateAppOptions {
    excludeParser?: boolean;
    apolloOptions?: ApolloOptions | {
        (): ApolloOptions | Promise<{}>;
    };
    graphiqlOptions?: GraphiQL.GraphiQLData;
}
export interface CreateAppFunc {
    (options?: CreateAppOptions): void;
}
export interface DestroyAppFunc {
    (app: any): void;
}
declare var _default: (createApp: CreateAppFunc, destroyApp?: DestroyAppFunc) => void;
export default _default;
