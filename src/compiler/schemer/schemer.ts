import Ast, {SourceFile} from 'ts-simple-ast';
import {PromiseMap} from '../../util/promisemap';
import {ApiOneConfig} from '../compiler';
import {Class} from './class';

export class Schemer {
    structures: PromiseMap<Class> = new PromiseMap<Class>();

    constructor(public config: ApiOneConfig) {
    }

    async run(): Promise<Schemer> {
        const sources = this.getSources();
        await this.extractSources(sources)
        await this.structures.finalize()
        console.log(this.structures)
        return this;
    }

    getSources(): SourceFile[] {
        const ast = new Ast();
        ast.addSourceFiles(`${this.config.sourcePath}/**/*.ts`);
        return ast.getSourceFiles();
    }

    async extractSources(sources: SourceFile[]) {
        for (const source of sources)
            await this.extractStructures(source);
    }

    async extractStructures(source: SourceFile) {
        for (const classNode of source.getClasses()) {
            const clazz = new Class(this, classNode);
            this.structures.insert(clazz.fullName, clazz);
        }
    }

    getTypeByFullName(name: string): Promise<Class> {
        return this.structures.get(name);
    }
}
