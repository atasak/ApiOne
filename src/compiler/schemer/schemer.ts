import Ast, {SourceFile} from 'ts-simple-ast';
import {ApiOneConfig} from '../compiler';
import {Class} from './class';
import {Dict} from './dict';
import {List} from './list';
import {Method} from './method';
import {Var} from './var';

export type Property = Class | Method | Dict | List | Var;

export class Schemer {
    structures: Class[] = [];

    constructor(private config: ApiOneConfig) {
    }

    run(): Schemer {
        const ast = new Ast();
        ast.addSourceFiles(`${this.config.sourcePath}/**/*.ts`);
        const sources = ast.getSourceFiles();
        for (const source of sources)
            this.extractStructures(source);
        return this;
    }

    extractStructures(source: SourceFile) {
        for (const cls of source.getClasses()) {
            this.structures.push(new Class(cls));
        }
    }
}
