import {Type as AstType} from 'ts-simple-ast';
import {Printable} from '../../util/printable';
import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {getTypeInfo} from './typeutils';

export class List extends Type implements Printable {
    readonly valueManagerName = 'ListWrapper';

    private constructor (private type: Type) {
        super();
    }

    get typeAsString (): string {
        return List.TypeAsString(this.type);
    }

    static Construct (schemer: Schemer, typeNode: AstType): List {
        const arrayType = typeNode.getArrayType();
        if (arrayType == null)
        // TODO: Create more specific error when arrayType does not exist on array
            throw new Error();
        const type = getTypeInfo(schemer, arrayType);
        const mapType = List.TypeAsString(type);

        if (!schemer.structures.has(mapType))
            schemer.structures.set(mapType, new List(type));
        return schemer.structures.get(mapType) as List;
    }

    private static TypeAsString (type: Type): string {
        return `${type.typeAsString}[]`;
    }

    asString (): string {
        return `    ${this.typeAsString}`;
    }
}
