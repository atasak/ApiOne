import {ClassDeclaration, ConstructorDeclaration, MethodDeclaration, ParameterDeclaration} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {getRelativeFullName, getTypeInfo} from './typeutils';
import {enumerate} from '../../util/printable';
import {ClassElement} from './classElement';

export class Method extends ClassElement {
    name: string;
    parameters: Parameter[] = [];
    returnType: Type;

    constructor(protected schemer: Schemer, protected methodNode: MethodDeclaration | ConstructorDeclaration) {
        super();
        this.extractGenericInfo(methodNode);
        this.extractArguments(methodNode);
    }

    asString(): string {
        const params = enumerate(this.parameters, p => `${p.typeAsString()}, `);
        return `(${params}) => ${this.returnType.typeAsString}`;
    }

    transform(classNode: ClassDeclaration) {

    }

    private extractGenericInfo(methodNode: MethodDeclaration | ConstructorDeclaration) {
        this.name = getRelativeFullName(this.schemer, methodNode.getSymbol());
    }

    private extractArguments(methodNode: MethodDeclaration | ConstructorDeclaration) {
        const parameterNodes = methodNode.getParameters();
        for (const parameterNode of parameterNodes)
            this.parameters.push(new Parameter(this.schemer, parameterNode));
        this.returnType = getTypeInfo(this.schemer, methodNode.getReturnType());
    }
}

export class Parameter {
    type: Type;

    constructor(private schemer: Schemer, parameterNode: ParameterDeclaration) {
        this.getType(parameterNode);
    }

    typeAsString(): string {
        return this.type.typeAsString;
    }

    private getType(parameterNode: ParameterDeclaration) {
        this.type = getTypeInfo(this.schemer, parameterNode.getType());
    }
}
