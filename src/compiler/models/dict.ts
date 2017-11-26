import {Type as AstType} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {getTypeInfo, Type} from "./type";

export type IndexType = 'String' | 'Number';

export class Dict {
    indexType: IndexType;
    type: Type;

    constructor(private schemer: Schemer, typeNode: AstType) {
        this.extractTypeInfo(typeNode);
    }

    private async extractTypeInfo(typeNode: AstType) {
        if (typeNode.getStringIndexType() !== undefined)
            this.indexType = 'String';
        if (typeNode.getNumberIndexType() !== undefined)
            this.indexType = 'Number';

        const mapTypeNode = typeNode.getNumberIndexType() || typeNode.getStringIndexType();

        this.type = await getTypeInfo(this.schemer, mapTypeNode);
    }
}
