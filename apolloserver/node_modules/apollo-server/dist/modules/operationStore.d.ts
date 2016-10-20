import { Document, GraphQLSchema } from 'graphql';
export declare class OperationStore {
    private storedOperations;
    private schema;
    constructor(schema: GraphQLSchema);
    put(operation: string | Document): void;
    get(operationName: string): Document;
    delete(operationName: string): boolean;
    getMap(): Map<string, Document>;
}
