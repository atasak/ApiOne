import {Type as AstType} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {getTypeInfo} from './typeutils';

export class List extends Type {
    type: Type;

    constructor(private schemer: Schemer, private typeNode: AstType) {
        super();
        this.extractTypeInfo(typeNode.getArrayType());
    }

    typeAsString(): string {
        return `${this.type.typeAsString()}[]`;
    }

    private extractTypeInfo(propertyNode: AstType) {
        getTypeInfo(this.schemer, propertyNode)
            .then(value => this.type = value);
    }
}
