import {Schemer} from '../compiler/schemer';
import {Type} from './type';
import {BaseType, Var} from './var';
import {List} from './list';
import {Dict} from './dict';
import {Symbol, Type as AstType} from 'ts-simple-ast';
import * as path from 'path';
import {Class} from './class';

export function getTypeInfo(schemer: Schemer, typeNode: AstType): Type {
    typeNode = typeNode.getApparentType();
    const typetext = typeNode.getText();
    if ({'String': true, 'Number': true, 'Boolean': true}[typetext] !== undefined)
        return new Var(schemer, typetext as BaseType);
    if (typeNode.isArrayType())
        return List.Construct(schemer, typeNode);
    if (typeNode.getStringIndexType() || typeNode.getNumberIndexType())
        return Dict.Construct(schemer, typeNode);
    return Class.Construct(schemer, getRelativeFullName(schemer, typeNode.getSymbol()));
}

export function getRelativeFullName(schemer: Schemer, symbol: Symbol): string {
    const apidir = path.join(process.cwd(), schemer.config.sourcePath);
    let filepath = symbol.getDeclarations()[0].getSourceFile().getFilePath();
    filepath = filepath.slice(apidir.length + 1);
    return `${filepath}#${symbol.getName()}`;
}
