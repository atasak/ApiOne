import * as path from 'path';
import {Symbol, Type as AstType} from 'ts-simple-ast';
import {Class} from './class';
import {Dict} from './dict';
import {List} from './list';
import {Method} from './method';
import {Schemer} from './schemer';
import {BaseType, Var} from './var';


export type Type = Class | Method | Dict | List | Var;

export async function getTypeInfo(schemer: Schemer, typeNode: AstType): Promise<Type> {
    typeNode = typeNode.getApparentType();
    const typetext = typeNode.getText();
    if ({'string': true, 'number': true, 'boolean': true}[typetext] !== undefined)
        return new Var(schemer, typetext as BaseType);
    if (typeNode.isArrayType())
        return new List(schemer, typeNode.getArrayType());
    return schemer.getTypeByFullName(getRelativeFullName(schemer, typeNode.getSymbol()));
}

export function getRelativeFullName(schemer: Schemer, symbol: Symbol): string {
    const apidir = path.join(process.cwd(), schemer.config.sourcePath);
    var filepath = symbol.getDeclarations()[0].getSourceFile().getFilePath();
    filepath = filepath.slice(apidir.length + 1);
    return `${filepath}#${symbol.getName()}`;
}
