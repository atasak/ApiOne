import Ast, {SourceFile} from 'ts-simple-ast';
import {PromiseMap} from '../../util/promisemap';
import {ApiOneConfig} from '../compiler';
import {Class} from './class';

export class Schemer {
    structures: PromiseMap<Class> = new PromiseMap<Class>();

    constructor(public config: ApiOneConfig) {
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
        for (const classNode of source.getClasses()) {
            const clazz = new Class(this, classNode);
            this.structures.insert(clazz.fullName, clazz);
            console.log(clazz.fullName);
        }
        this.structures.finalize();
        console.log(this.structures);
    }

    getTypeByFullName(name: string): Promise<Class> {
        return this.structures.get(name);
    }
}
