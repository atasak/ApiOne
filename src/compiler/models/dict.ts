import {Type as AstType} from 'ts-simple-ast';
import {Printable} from '../../util/printable';
import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {getTypeInfo} from './typeutils';

export type IndexType = 'String' | 'Number';

export class Dict extends Type implements Printable {
    readonly valueManagerName = 'DictWrapper';

    private constructor (private indexType: IndexType, private type: Type) {
        super();
    }

    get typeAsString (): string {
        return Dict.TypeAsString(this.indexType, this.type);
    }

    static Construct (schemer: Schemer, typeNode: AstType): Dict {
        const indexType = Dict.IndexTypeOf(typeNode);
        const type = Dict.TypeOf(schemer, typeNode);
        const mapType = Dict.TypeAsString(indexType, type);

        if (!schemer.structures.has(mapType))
            schemer.structures.set(mapType, new Dict(indexType, type));
        return schemer.structures.get(mapType) as Dict;
    }

    private static TypeAsString (indexType: string, type: Type): string {
        return `{ [key: ${indexType.toLowerCase()}]: ${type.typeAsString} }`;
    }

    private static IndexTypeOf (typeNode: AstType): IndexType {
        if (typeNode.getStringIndexType() !== undefined)
            return 'String';
        if (typeNode.getNumberIndexType() !== undefined)
            return 'Number';
        return 'String';
    }

    private static TypeOf (schemer: Schemer, typeNode: AstType) {
        const mapTypeNode = typeNode.getNumberIndexType() || typeNode.getStringIndexType();
        if (mapTypeNode == null)
        // TODO: Create more specific error when numberIndexType or stringIndexType does not exist on Map
            throw new Error();
        return getTypeInfo(schemer, mapTypeNode);
    }

    asString (): string {
        return `    ${this.typeAsString}`;
    }
}
