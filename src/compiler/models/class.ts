import {ClassDeclaration, Node, PropertyDeclaration} from 'ts-simple-ast';
import {enumerate, Printable} from '../../util/printable';
import {Schemer} from '../compiler/schemer';
import {Constructor} from './constructor';
import {Method} from './method';
import {Property} from './property';
import {Type} from './type';

export class Class extends Type implements Printable {
    classNode!: ClassDeclaration;
    name!: string;
    properties: Map<string, Property | Method> = new Map<string, Property | Method>();
    constructr!: Method;
    readonly valueManagerName = 'ClassWrapper';

    private constructor (private schemer: Schemer, private fullName: string) {
        super();
    }

    get file (): string {
        return this.fullName.split('#')[0];
    }

    get typeAsString (): string {
        return this.name;
    }

    static Construct (schemer: Schemer, fullName: string): Class {
        if (!schemer.structures.has(fullName))
            schemer.structures.set(fullName, new Class(schemer, fullName));
        return schemer.structures.get(fullName) as Class;
    }

    asString (): string {
        const constructor = `    constructor: ${this.constructr ? this.constructr.asString() : 'None'}, \n`;
        const properties = enumerate(this.properties, p => `    ${p.asString()}, \n`);
        return constructor + properties;
    }

    isOf (classNode: ClassDeclaration, remember: (...node: Node[]) => void) {
        this.classNode = classNode;
        remember(classNode);
        this.extractGenericInfo(classNode);
        this.extractConstructor(classNode);
        this.extractProperties(classNode);
        this.extractMethods(classNode);
    }

    transform () {
        for (const property of this.properties.values())
            property.transform(this.classNode);
    }

    private extractGenericInfo (classNode: ClassDeclaration) {
        const symbol = classNode.getSymbol();
        if (symbol == null)
        // TODO: Create more specific error when symbol of class cannot be found
            throw new Error();
        this.name = symbol.getName();
    }

    private extractConstructor (classNode: ClassDeclaration) {
        const ctors = classNode.getConstructors();
        if (ctors.length !== 1)
            return;
        this.constructr = new Constructor(this.schemer, ctors[0]);
    }

    private extractProperties (classNode: ClassDeclaration) {
        const instanceProperties = classNode.getInstanceProperties();
        for (const instanceProperty of instanceProperties as PropertyDeclaration[]) {
            const property = new Property(this.schemer, instanceProperty);
            this.properties.set(property.name, property);
        }
    }

    private extractMethods (classNode: ClassDeclaration) {
        const instanceMethods = classNode.getInstanceMethods();
        for (const instanceMethod of instanceMethods) {
            const method = new Method(this.schemer, instanceMethod);
            this.properties.set(method.name, method);
        }
    }
}
