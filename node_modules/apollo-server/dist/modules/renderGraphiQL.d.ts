export declare type GraphiQLData = {
    endpointURL: string;
    query?: string;
    variables?: Object;
    operationName?: string;
    result?: Object;
    passHeader?: string;
};
export declare function renderGraphiQL(data: GraphiQLData): string;
