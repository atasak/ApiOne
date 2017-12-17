import Ast, {SourceFile} from 'ts-simple-ast';
import {ApiOneConfig} from './compiler';
import {Class} from '../models/class';
import {Type} from '../models/type';
import {getRelativeFullName} from '../models/typeutils';

export class Schemer {
    structures: Map<string, Type> = new Map<string, Type>();
    ast: Ast;

    constructor(public config: ApiOneConfig) {
    }

    run(): Map<string, Type> {
        const sources = this.getSources();
        this.extractSources(sources);
        this.transformSources();
        return this.structures;
    }

    getSources(): SourceFile[] {
        this.ast = new Ast({tsConfigFilePath: 'tsconfig.apione.json'});
        this.ast.addSourceFiles(`${this.config.sourcePath}/**/*.ts`);
        return this.ast.getSourceFiles();
    }

    extractSources(sources: SourceFile[]) {
        for (const source of sources)
            this.extractStructures(source);
    }

    extractStructures(source: SourceFile) {
        for (const classNode of source.getClasses()) {
            const fullName = getRelativeFullName(this, classNode.getSymbol());
            const clazz = Class.Construct(this, fullName);
            clazz.isOf(classNode);
        }
    }

    transformSources() {
        for (const structure of this.structures.values()) {
            if (structure instanceof Class)
                structure.transform();
        }
    }

    write() {
        console.log('Emitting generated code...');
        console.log(this.ast.emit().getDiagnostics());
    }
}
