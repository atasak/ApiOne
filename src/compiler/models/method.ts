import {ClassDeclaration, ConstructorDeclaration, MethodDeclaration, ParameterDeclaration} from 'ts-simple-ast';
import {enumerate} from '../../util/printable';
import {stub} from '../../util/utils.dev';
import {Schemer} from '../compiler/schemer';
import {ClassElement} from './classElement';
import {Type} from './type';
import {getTypeInfo} from './typeutils';

export class Method extends ClassElement {
    name: string;
    parameters: Parameter[] = [];
    returnType: Type;

    constructor (protected schemer: Schemer, methodNode: MethodDeclaration | ConstructorDeclaration) {
        super ();
        this.extractGenericInfo (methodNode);
        this.extractArguments (methodNode);
    }

    asString (): string {
        const params = enumerate (this.parameters, p => `${p.typeAsString ()}, `);
        return `${this.name}: (${params}) => ${this.returnType.typeAsString}`;
    }

    transform (classNode: ClassDeclaration) {
        stub (classNode);
    }

    private extractGenericInfo (methodNode: MethodDeclaration | ConstructorDeclaration) {
        const symbol = methodNode.getSymbol ();
        if (symbol == null)
            throw new Error ();
        this.name = symbol.getName ();
    }

    private extractArguments (methodNode: MethodDeclaration | ConstructorDeclaration) {
        const parameterNodes = methodNode.getParameters ();
        for (const parameterNode of parameterNodes)
            this.parameters.push (new Parameter (this.schemer, parameterNode));
        this.returnType = getTypeInfo (this.schemer, methodNode.getReturnType ());
    }
}

export class Parameter {
    name: string;
    type: Type;

    constructor (private schemer: Schemer, parameterNode: ParameterDeclaration) {
        this.getNameAndType (parameterNode);
    }

    typeAsString (): string {
        return this.type.typeAsString;
    }

    private getNameAndType (parameterNode: ParameterDeclaration) {
        const symbol = parameterNode.getSymbol ();
        if (symbol == null)
            throw new Error ();
        this.name = symbol.getName ();
        this.type = getTypeInfo (this.schemer, parameterNode.getType ());
    }
}
