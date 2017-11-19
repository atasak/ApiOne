import {Type as AstType} from 'ts-simple-ast';
import {Class} from './class';
import {Dict} from './dict';
import {List} from './list';
import {Method} from './method';
import {Schemer} from './schemer';
import {BaseType, Var} from './var';

export type Type = Class | Method | Dict | List | Var;

export async function getTypeInfo(schemer: Schemer, typeNode: AstType): Promise<Type> {
    const typetext = typeNode.getText();
    if ({'string': true, 'number': true, 'boolean': true}[typetext] !== undefined)
        return new Var(typetext as BaseType);
    return schemer.getTypeByFullName(typeNode.getSymbol().getFullyQualifiedName());
}
