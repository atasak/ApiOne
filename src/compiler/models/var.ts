import {Schemer} from '../compiler/schemer';

export type BaseType = 'String' | 'Number' | 'Boolean';

export class Var {
    constructor(private schemer: Schemer, public type: BaseType) {
    }
}
