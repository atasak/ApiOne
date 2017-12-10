import * as path from 'path';
import {Symbol, Type as AstType} from 'ts-simple-ast';
import {Class} from './class';
import {Dict} from './dict';
import {List} from './list';
import {Method} from './method';
import {Schemer} from '../compiler/schemer';
import {BaseType, Var} from './var';
import {SyncPromise} from '../../util/syncpromise';


export type Type = Class | Method | Dict | List | Var;

export function getTypeInfo(schemer: Schemer, typeNode: AstType): Promise<Type> {
    typeNode = typeNode.getApparentType();
    const typetext = typeNode.getText();
    if ({'String': true, 'Number': true, 'Boolean': true}[typetext] !== undefined)
        return SyncPromise.Resolve(new Var(schemer, typetext as BaseType));
    if (typeNode.isArrayType())
        return SyncPromise.Resolve(new List(schemer, typeNode));
    if (typeNode.getStringIndexType())
        return SyncPromise.Resolve(new Dict(schemer, typeNode));
    if (typeNode.getNumberIndexType())
        return SyncPromise.Resolve(new Dict(schemer, typeNode));
    return schemer.getTypeByFullName(getRelativeFullName(schemer, typeNode.getSymbol()));
}

export function getRelativeFullName(schemer: Schemer, symbol: Symbol): string {
    const apidir = path.join(process.cwd(), schemer.config.sourcePath);
    let filepath = symbol.getDeclarations()[0].getSourceFile().getFilePath();
    filepath = filepath.slice(apidir.length + 1);
    return `${filepath}#${symbol.getName()}`;
}
