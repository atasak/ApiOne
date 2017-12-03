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

    private extractGenericInfo(propertyNode: PropertyDeclaration) {
        this.name = propertyNode.getSymbol().getName();
    }

    private async extractTypeInfo(propertyNode: PropertyDeclaration) {
        this.type = await getTypeInfo(this.schemer, propertyNode.getType());
    }

    private extractDefaultValue(propertyNode: PropertyDeclaration) {
        this.defaultValue = propertyNode.getInitializer().getText();
    }
}
