import {ConstructorDeclaration, MethodDeclaration, ParameterDeclaration} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {getRelativeFullName, getTypeInfo} from './typeutils';
import {enumerate} from '../../util/printable';

export class Method {
    name: string;
    parameters: Parameter[] = [];
    returnType: Type;

    constructor(protected schemer: Schemer, protected methodNode: MethodDeclaration | ConstructorDeclaration) {
        this.extractGenericInfo(methodNode);
        this.extractArguments(methodNode);
    }

    asString(): string {
        const params = enumerate(this.parameters, p => `${p.typeAsString()}, `);
        return `(${params}) => ${this.returnType.typeAsString()}`;
    }

    private extractGenericInfo(methodNode: MethodDeclaration | ConstructorDeclaration) {
        this.name = getRelativeFullName(this.schemer, methodNode.getSymbol());
    }

    private extractArguments(methodNode: MethodDeclaration | ConstructorDeclaration) {
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

    typeAsString(): string {
        return this.type.typeAsString();
    }

    private getType(parameterNode: ParameterDeclaration) {
        getTypeInfo(this.schemer, parameterNode.getType())
            .then(value => this.type = value);
    }
}
