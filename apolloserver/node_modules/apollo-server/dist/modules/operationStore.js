"use strict";
const graphql_1 = require('graphql');
const OPERATION_DEFINITION = 'OperationDefinition';
class OperationStore {
    constructor(schema) {
        this.schema = schema;
        this.storedOperations = new Map();
    }
    put(operation) {
        function isOperationDefinition(definition) {
            return definition.kind === OPERATION_DEFINITION;
        }
        function isString(definition) {
            return typeof definition === 'string';
        }
        const ast = isString(operation) ? graphql_1.parse(operation) : operation;
        const definitions = ast.definitions.filter(isOperationDefinition);
        if (definitions.length === 0) {
            throw new Error('operationDefinition must contain at least one definition');
        }
        if (definitions.length > 1) {
            throw new Error('operationDefinition must contain only one definition');
        }
        const validationErrors = graphql_1.validate(this.schema, ast);
        if (validationErrors.length > 0) {
            const messages = validationErrors.map((e) => e.message);
            const e = new Error(`Validation Errors:\n${messages.join('\n')}`);
            e['originalErrors'] = validationErrors;
            throw e;
        }
        this.storedOperations.set(definitions[0].name.value, ast);
    }
    get(operationName) {
        return this.storedOperations.get(operationName);
    }
    delete(operationName) {
        return this.storedOperations.delete(operationName);
    }
    getMap() {
        return this.storedOperations;
    }
}
exports.OperationStore = OperationStore;
//# sourceMappingURL=operationStore.js.map