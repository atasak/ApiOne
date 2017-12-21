import Ast, {SourceFile} from 'ts-simple-ast';
import {ApiOneConfig} from './compiler';
import {Class} from '../models/class';
import {Type} from '../models/type';
import {getRelativeFullName} from '../models/typeutils';
import * as path from 'path';

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
        this.ast.addExistingSourceFiles(`${this.config.sourcePath}/**/*.ts`);
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
        this.addImports();
    }

    addImports() {
        const mask = path.join(process.cwd(), this.config.sourcePath, '**/*.ts');
        for (const source of this.ast.getSourceFiles(mask))
            source.addImport({
                namedImports: [
                    {name: 'ClassWrapper'},
                    {name: 'DictWrapper'},
                    {name: 'ListWrapper'},
                    {name: 'VarWrapper'},
                ],
                moduleSpecifier: '../../src/runtime/contentwrappers/classwrapper',
            });
    }

    write() {
        this.ast.forgetNodesCreatedInBlock(_ => {
            console.log('Emitting generated code...');
            const diag = this.ast.emit().getDiagnostics();
            for (const d of diag)
                console.log(`${d.getSourceFile().getFilePath()}.${d.getStart()}: ${d.getMessageText()}`);
            if (diag.length === 0)
                console.log('No errors!');
        });
    }
}
