import {Schemer} from '../compiler/schemer';
import {Type} from './type';

export type BaseType = 'String' | 'Number' | 'Boolean';

export class Var extends Type {
    constructor(private schemer: Schemer, public type: BaseType) {
        super();
    }

    typeAsString(): string{
        return this.type;
    }
}
