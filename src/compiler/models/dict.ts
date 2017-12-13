import {Type as AstType} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {getTypeInfo} from './typeutils';

export type IndexType = 'String' | 'Number';

export class Dict extends Type {
    indexType: IndexType;
    type: Type;

    constructor(private schemer: Schemer, private typeNode: AstType) {
        super();
        this.extractTypeInfo(typeNode);
    }

    typeAsString(): string {
        return `< [key: ${this.indexType}]: ${this.type.typeAsString()}`;
    }

    private extractTypeInfo(typeNode: AstType) {
        if (typeNode.getStringIndexType() !== undefined)
            this.indexType = 'String';
        if (typeNode.getNumberIndexType() !== undefined)
            this.indexType = 'Number';

        const mapTypeNode = typeNode.getNumberIndexType() || typeNode.getStringIndexType();

        getTypeInfo(this.schemer, mapTypeNode)
            .then(value => this.type = value);
    }
}
