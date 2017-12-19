import {Type as AstType} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {getTypeInfo} from './typeutils';
import {Printable} from '../../util/printable';

export class List extends Type implements Printable {
    readonly valueManagerName = 'ListManager';

    private constructor(private schemer: Schemer,
                        private typeNode: AstType,
                        private type: Type) {
        super();
    }

    get typeAsString(): string {
        return List.TypeAsString(this.type);
    }

    static Construct(schemer: Schemer, typeNode: AstType): List {
        const type = getTypeInfo(schemer, typeNode.getArrayType());
        const mapType = List.TypeAsString(type);

        if (!schemer.structures.has(mapType))
            schemer.structures.set(mapType, new List(schemer, typeNode, type));
        return schemer.structures.get(mapType) as List;
    }

    private static TypeAsString(type: Type): string {
        return `${type.typeAsString}[]`;
    }

    asString(): string {
        return `    ${this.typeAsString}`;
    }
}
