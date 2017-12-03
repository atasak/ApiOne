import {Type as AstType} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {getTypeInfo, Type} from './type';

export class List {
    type: Type;

    constructor(private schemer: Schemer, private typeNode: AstType) {
        this.extractTypeInfo(typeNode.getArrayType());
    }

    private async extractTypeInfo(propertyNode: AstType) {
        this.type = await getTypeInfo(this.schemer, propertyNode);
    }
}
