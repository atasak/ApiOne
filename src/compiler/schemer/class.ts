import {ClassDeclaration} from 'ts-simple-ast';
import {Method} from './method';
import {Schemer} from './schemer';
import {Type} from './type';

export class Class {
    id: number;
    name: string;
    fullName: string;
    properties: { [key: string]: Type } = {};
    construct: Method;

    constructor(private schemer: Schemer, classNode: ClassDeclaration) {
        this.extractGenericInfo(classNode);
        this.extractMethods(classNode);
        this.extractProperties(classNode);
    }

    extractMethods(classNode: ClassDeclaration) {
        const instanceMethods = classNode.getInstanceMethods();
        for (const instanceMethod of instanceMethods) {
            const method = new Method(this.schemer, instanceMethod);
            this.properties[method.name] = method;
        }
    }

    extractProperties(classNode: ClassDeclaration) {

    }

    private extractGenericInfo(classNode: ClassDeclaration) {
        this.name = classNode.getSymbol().getName();
        this.fullName = classNode.getSymbol().getFullyQualifiedName();
    }
}
