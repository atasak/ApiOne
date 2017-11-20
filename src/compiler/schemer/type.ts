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
    const typetext = typeNode.getText();
    if ({'string': true, 'number': true, 'boolean': true}[typetext] !== undefined)
        return new Var(typetext as BaseType);
    return schemer.getTypeByFullName(getRelativeFullName(schemer, typeNode.getSymbol()));
}

export function getRelativeFullName(schemer: Schemer, symbol: Symbol): string {
    const apidir = path.join(process.cwd(), schemer.config.sourcePath);
    var filepath = symbol.getDeclarations()[0].getSourceFile().getFilePath();
    filepath = filepath.slice(apidir.length + 1);
    filepath = filepath.replace('/', '.');
    return `${filepath}.${symbol.getName()}`;
}
