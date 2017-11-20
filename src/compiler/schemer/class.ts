import {ClassDeclaration, PropertyDeclaration} from 'ts-simple-ast';
import {Method} from './method';
import {Schemer} from './schemer';
import {Property} from './property';

export class Class {
    id: number;
    name: string;
    fullName: string;
    properties: { [key: string]: Property } = {};
    constructr: Method;

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
        const instanceProperties = classNode.getInstanceProperties();
        for (const instanceProperty of instanceProperties as PropertyDeclaration[]) {
            const property = Property.MakeProperty(this.schemer, instanceProperty);
            this.properties[property.name] = property;
        }
    }

    private extractGenericInfo(classNode: ClassDeclaration) {
        this.name = classNode.getSymbol().getName();
        this.fullName = classNode.getSymbol().getFullyQualifiedName();
    }
}
