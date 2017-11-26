import {MethodDeclaration, ParameterDeclaration} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {getTypeInfo, Type} from './type';

export class Method {
    name: string;
    parameters: Parameter[] = [];
    returnType: Type;

    constructor(private schemer: Schemer, methodNode: MethodDeclaration) {
        this.extractGenericInfo(methodNode);
        this.extractArguments(methodNode);
    }

    private extractGenericInfo(methodNode: MethodDeclaration) {
        this.name = methodNode.getSymbol().getName();
    }

    private extractArguments(methodNode: MethodDeclaration) {
        const parameterNodes = methodNode.getParameters();
        for (const parameterNode of parameterNodes)
            this.parameters.push(new Parameter(this.schemer, parameterNode));
        //this.returnType = methodNode.getReturnType().getSymbol().getFullyQualifiedName();
        //console.log(this.returnType);
    }
}

export class Parameter {
    type: Type;

    constructor(private schemer: Schemer, parameterNode: ParameterDeclaration) {
        this.getType(parameterNode);
    }

    private async getType(parameterNode: ParameterDeclaration) {
        this.type = await getTypeInfo(this.schemer, parameterNode.getType());
    }
}
