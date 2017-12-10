import Ast, {SourceFile} from 'ts-simple-ast';
import {PromiseMap} from '../../util/promisemap';
import {ApiOneConfig} from './compiler';
import {Class} from '../models/class';

export class Schemer {
    structures: PromiseMap<Class> = new PromiseMap<Class>();

    constructor(public config: ApiOneConfig) {
    }

    run(): PromiseMap<Class> {
        const sources = this.getSources();
        this.extractSources(sources);
        this.structures.finalize();
        return this.structures;
    }

    getSources(): SourceFile[] {
        const ast = new Ast();
        ast.addSourceFiles(`${this.config.sourcePath}/**/*.ts`);
        return ast.getSourceFiles();
    }

    extractSources(sources: SourceFile[]) {
        for (const source of sources)
            this.extractStructures(source);
    }

    extractStructures(source: SourceFile) {
        for (const classNode of source.getClasses()) {
            const clazz = new Class(this, classNode);
            this.structures.insert(clazz.fullName, clazz);
        }
    }

    getTypeByFullName(name: string): Promise<Class> {
        return this.structures.get(name);
    }
}
