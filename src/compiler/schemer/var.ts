import {Schemer} from './schemer';

export type BaseType = 'string' | 'number' | 'boolean';

export class Var {
    constructor(private schemer: Schemer, public type: BaseType) {
    }
}
