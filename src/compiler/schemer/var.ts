import {Schemer} from './schemer';
import {PropertyDeclaration} from 'ts-simple-ast';

export type BaseType = 'string' | 'number' | 'boolean';

export class Var {
    constructor(private schemer: Schemer, public type: BaseType) {
    }
}
