import {Schemer} from '../compiler/schemer';
import {Type} from './type';

export type BaseType = 'String' | 'Number' | 'Boolean';

export class Var extends Type {
    readonly valueManagerName = 'VarManager';

    constructor(private schemer: Schemer, public type: BaseType) {
        super();
    }

    get typeAsString(): string {
        return this.type.toLowerCase();
    }
}
