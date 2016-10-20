import { Server, Request } from 'hapi';
import * as GraphiQL from '../modules/renderGraphiQL';
import ApolloOptions from './apolloOptions';
export interface IRegister {
    (server: Server, options: any, next: any): void;
    attributes?: any;
}
export interface HapiOptionsFunction {
    (req?: Request): ApolloOptions | Promise<ApolloOptions>;
}
export interface HapiPluginOptions {
    path: string;
    route?: any;
    apolloOptions: ApolloOptions | HapiOptionsFunction;
}
declare const apolloHapi: IRegister;
export interface GraphiQLPluginOptions {
    path: string;
    route?: any;
    graphiqlOptions: GraphiQL.GraphiQLData;
}
declare const graphiqlHapi: IRegister;
export { apolloHapi, graphiqlHapi };
