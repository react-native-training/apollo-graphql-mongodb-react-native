import * as express from 'express';
import ApolloOptions from './apolloOptions';
import * as GraphiQL from '../modules/renderGraphiQL';
export interface ExpressApolloOptionsFunction {
    (req?: express.Request, res?: express.Response): ApolloOptions | Promise<ApolloOptions>;
}
export interface ExpressHandler {
    (req: express.Request, res: express.Response, next: any): void;
}
export declare function apolloExpress(options: ApolloOptions | ExpressApolloOptionsFunction): ExpressHandler;
export declare function graphiqlExpress(options: GraphiQL.GraphiQLData): (req: express.Request, res: express.Response, next: any) => void;
