import {MethodDeclaration, ParameterDeclaration} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {getRelativeFullName, getTypeInfo, Type} from './type';

export class Method {
    name: string;
    parameters: Parameter[] = [];
    returnType: Type;

    constructor(private schemer: Schemer, private methodNode: MethodDeclaration) {
        this.extractGenericInfo(methodNode);
        this.extractArguments(methodNode);
    }

    private extractGenericInfo(methodNode: MethodDeclaration) {
        this.name = getRelativeFullName(this.schemer, methodNode.getSymbol());
    }

    private extractArguments(methodNode: MethodDeclaration) {
        const parameterNodes = methodNode.getParameters();
        for (const parameterNode of parameterNodes)
            this.parameters.push(new Parameter(this.schemer, parameterNode));
        getTypeInfo(this.schemer, methodNode.getReturnType())
            .then(value => this.returnType = value);
    }
}

export class Parameter {
    type: Type;

    constructor(private schemer: Schemer, parameterNode: ParameterDeclaration) {
        this.getType(parameterNode);
    }

    private getType(parameterNode: ParameterDeclaration) {
        getTypeInfo(this.schemer, parameterNode.getType())
            .then(value => this.type = value);
    }
}
