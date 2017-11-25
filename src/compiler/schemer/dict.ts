import {Type as AstType} from 'ts-simple-ast';
import {Schemer} from './schemer';

export class Dict {
    constructor(private schemer: Schemer, typeNode: AstType) {
    }
}
