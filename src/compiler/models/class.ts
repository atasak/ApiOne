import {ClassDeclaration, PropertyDeclaration} from 'ts-simple-ast';
import {Method} from './method';
import {Property} from './property';
import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {getRelativeFullName} from './typeutils';
import {enumerate, Printable} from '../../util/printable';
import {Constructor} from './constructor';

export class Class extends Type implements Printable {
    id: number;
    name: string;
    fullName: string;
    properties: { [key: string]: Property | Method } = {};
    constructr: Method;

    constructor(private schemer: Schemer, private classNode: ClassDeclaration) {
        super();
        this.extractGenericInfo(classNode);
        this.extractConstructor(classNode);
        this.extractMethods(classNode);
        this.extractProperties(classNode);
    }

    get file(): string {
        return this.fullName.split('#')[0];
    }

    asString(): string {
        const constructor = `    constructor: ${this.constructr ? this.constructr.asString() : 'None'}, \n`;
        const properties = enumerate(this.properties, p => `    ${p.asString()}, \n`);
        return constructor + properties;
    }

    typeAsString(): string {
        return this.fullName;
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

    private extractConstructor(classNode: ClassDeclaration) {
        const ctors = classNode.getConstructors();
        if (ctors.length !== 1)
            return;
        this.constructr = new Constructor(this.schemer, ctors[0]);
    }
}
