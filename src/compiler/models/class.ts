import {ClassDeclaration, PropertyDeclaration} from 'ts-simple-ast';
import {Method} from './method';
import {Property} from './property';
import {Schemer} from '../compiler/schemer';
import {getRelativeFullName} from './type';

export class Class {
    id: number;
    name: string;
    fullName: string;
    properties: { [key: string]: Property | Method } = {};
    constructr: Method;

    constructor(private schemer: Schemer, private classNode: ClassDeclaration) {
        this.extractGenericInfo(classNode);
        this.extractMethods(classNode);
        this.extractProperties(classNode);
    }

    get file(): string {
        return this.fullName.split('#')[0];
    }

    private extractMethods(classNode: ClassDeclaration) {
        const instanceMethods = classNode.getInstanceMethods();
        for (const instanceMethod of instanceMethods) {
            const method = new Method(this.schemer, instanceMethod);
            this.properties[method.name] = method;
        }
    }

    private extractProperties(classNode: ClassDeclaration) {
        const instanceProperties = classNode.getInstanceProperties();
        for (const instanceProperty of instanceProperties as PropertyDeclaration[]) {
            const property = new Property(this.schemer, instanceProperty);
            this.properties[property.name] = property;
        }
    }

    private extractGenericInfo(classNode: ClassDeclaration) {
        this.name = classNode.getSymbol().getName();
        this.fullName = getRelativeFullName(this.schemer, classNode.getSymbol());
    }
}
