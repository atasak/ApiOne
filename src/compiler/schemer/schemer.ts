import Ast, {SourceFile} from 'ts-simple-ast';
import {ApiOneConfig} from '../compiler';
import {Class} from './class';

export type Property = Class | Method | Dict | List | Var;

export class Schemer {
    structures: Class[];

    constructor(private config: ApiOneConfig) {
    }

    run() {
        const ast = new Ast();
        ast.addSourceFiles(this.config.sourcePath);
        const sources = ast.getSourceFiles();
        for (const source of sources)
            this.extractStructures(source);
    }

    extractStructures(source: SourceFile) {

    }
}

