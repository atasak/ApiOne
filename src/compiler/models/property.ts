import {ClassDeclaration, PropertyDeclaration} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {getTypeInfo} from './typeutils';

export class Property {
    name: string;
    defaultValue = '';
    type: Type;

    constructor(protected schemer: Schemer, private propertyNode: PropertyDeclaration) {
        this.extractGenericInfo();
        this.extractTypeInfo();
        this.extractDefaultValue();
    }

    get oneName(): string {
        return `_one_${this.name}`;
    }

    get $name(): string {
        return `$${this.name}`;
    }

    get _name(): string {
        return `_${this.name}`;
    }

    asString(): string {
        return `${this.name}: ${this.type.typeAsString()} = ${this.defaultValue}`;
    }

    private extractGenericInfo() {
        this.name = this.propertyNode.getSymbol().getName();
    }

    private extractTypeInfo() {
        getTypeInfo(this.schemer, this.propertyNode.getType())
            .then(value => this.type = value);
    }

    private extractDefaultValue() {
        const initializer = this.propertyNode.getInitializer();
        if (initializer)
            this.defaultValue = initializer.getText();
    }

    transformIntoClass(classNode: ClassDeclaration) {
    }
}
