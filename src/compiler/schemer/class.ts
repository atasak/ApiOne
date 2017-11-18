import {ClassDeclaration} from 'ts-simple-ast';
import {Method} from './method';
import {Property} from './schemer';

export class Class {
    id: number;
    name: string;
    fullName: string;
    properties: { [key: string]: Property };
    construct: Method;

    constructor(classNode: ClassDeclaration) {

    }
}
