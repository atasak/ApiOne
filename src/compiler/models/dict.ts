import {Type as AstType} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {getTypeInfo, Type} from './type';

export type IndexType = 'String' | 'Number';

export class Dict {
    indexType: IndexType;
    type: Type;

    constructor(private schemer: Schemer, private typeNode: AstType) {
        this.extractTypeInfo(typeNode);
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
