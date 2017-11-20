import {Type} from './type';
import {Schemer} from './schemer';
import {MethodDeclaration, PropertyDeclaration} from 'ts-simple-ast';

export class Property {
    name: string;
    defaultValue: any = null;
    type: Type;

    constructor(protected schemer: Schemer, propertyNode: PropertyDeclaration) {
        this.extractGenericInfo(propertyNode)
        this.extractTypeInfo(propertyNode);
        this.extractDefaultValue(propertyNode);
    }

    private extractGenericInfo(propertyNode: PropertyDeclaration) {
        this.name = propertyNode.getSymbol().getName();
    }

    private extractTypeInfo(propertyNode: PropertyDeclaration) {

    }

    private extractDefaultValue(propertyNode: MethodDeclaration | PropertyDeclaration) {

    }
}