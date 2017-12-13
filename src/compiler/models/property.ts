import {PropertyDeclaration} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {getTypeInfo, Type} from './type';

export class Property {
    name: string;
    defaultValue = '';
    type: Type;

    constructor(protected schemer: Schemer, private propertyNode: PropertyDeclaration) {
        this.extractGenericInfo(propertyNode);
        this.extractTypeInfo(propertyNode);
        this.extractDefaultValue(propertyNode);
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

    private extractGenericInfo(propertyNode: PropertyDeclaration) {
        this.name = propertyNode.getSymbol().getName();
    }

    private extractTypeInfo(propertyNode: PropertyDeclaration) {
        getTypeInfo(this.schemer, propertyNode.getType())
            .then(value => this.type = value);
    }

    private extractDefaultValue(propertyNode: PropertyDeclaration) {
        const initializer = propertyNode.getInitializer();
        if (initializer)
            this.defaultValue = initializer.getText();
    }
}
