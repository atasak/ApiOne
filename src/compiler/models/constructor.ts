import {Method} from './method';
import {ConstructorDeclaration} from 'ts-simple-ast';
import {Schemer} from '../compiler/schemer';

export class Constructor extends Method {
    constructor(schemer: Schemer, methodNode: ConstructorDeclaration) {
        super(schemer, methodNode);
    }
}
