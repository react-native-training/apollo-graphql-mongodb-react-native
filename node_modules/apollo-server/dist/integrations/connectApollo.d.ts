import { apolloExpress, graphiqlExpress } from './expressApollo';
declare const apolloConnect: typeof apolloExpress;
declare const graphiqlConnect: typeof graphiqlExpress;
export { apolloConnect, graphiqlConnect };
