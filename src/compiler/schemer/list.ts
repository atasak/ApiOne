import {Type as AstType} from 'ts-simple-ast';
import {Schemer} from './schemer';

export class List {
    constructor(private schemer: Schemer, typeNode: AstType) {
    }
}
