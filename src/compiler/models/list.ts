import {Type as AstType} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {getTypeInfo, Type} from './type';

export class List {
    type: Type;

    constructor(private schemer: Schemer, private typeNode: AstType) {
        this.extractTypeInfo(typeNode.getArrayType());
    }

    private extractTypeInfo(propertyNode: AstType) {
        getTypeInfo(this.schemer, propertyNode)
            .then(value => this.type = value);
    }
}
