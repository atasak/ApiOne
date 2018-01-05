import Ast, {Directory, Node, SourceFile} from 'ts-simple-ast';
import {Class} from '../models/class';
import {Type} from '../models/type';
import {getRelativeFullName} from '../models/typeutils';
import {ApiOneConfig} from './compiler';

interface EmitConfig {
    declarationDir?: string;
    outDir?: string;
}

export class Schemer {
    structures: Map<string, Type> = new Map<string, Type>();
    ast: Ast;
    genDir: Directory;

    constructor (public config: ApiOneConfig) {
    }

    run (): Map<string, Type> {
        this.extractSources();
        this.transformSources();
        // console.log (sources[0].getFullText ());
        return this.structures;
    }

    extractSources () {
        this.ast = new Ast({tsConfigFilePath: this.config.tsConfigFilePath});
        this.ast.forgetNodesCreatedInBlock(remember => {
            this.ast.addExistingSourceFiles(`${this.config.sourcePath}/**/*.ts`);
            const dir = this.ast.getDirectoryOrThrow(this.config.sourcePath);
            this.genDir = dir.copy(this.config.emitTypescript || '.', {overwrite: true});
            const sources = this.genDir.getSourceFiles();
            for (const source of sources)
                this.extractStructures(source, remember);
        });
    }

    extractStructures (source: SourceFile, remember: (...node: Node[]) => void) {
        for (const classNode of source.getClasses()) {
            const symbol = classNode.getSymbol();
            if (symbol == null)
            // TODO: Create more specific error when symbol of class does not exist
                throw new Error();

            const fullName = getRelativeFullName(this, symbol);
            const clazz = Class.Construct(this, fullName);
            clazz.isOf(classNode, remember);
        }
    }

    transformSources () {
        for (const structure of this.structures.values()) {
            if (structure instanceof Class)
                structure.transform();
        }
        this.addImports();
    }

    addImports () {
        for (const source of this.genDir.getSourceFiles())
            source.addImportDeclaration({
                namedImports: [
                    {name: 'ClassWrapper'},
                    {name: 'ListWrapper'},
                    {name: 'DictWrapper'},
                    {name: 'VarWrapper'},
                ],
                moduleSpecifier: 'apiwrapper',
            });
    }

    diagnose () {
        this.ast.forgetNodesCreatedInBlock(() => {
            const diag = this.ast.getDiagnostics();
            for (const d of diag) {
                const sourceFile = d.getSourceFile();
                if (sourceFile != null)
                    console.log(`${sourceFile.getFilePath()}.${d.getStart()}: ${d.getMessageText()}`);
            }
            if (diag.length === 0)
                console.log('No errors!');
        });
    }

    async emit () {
        await this.ast.forgetNodesCreatedInBlock(async () => {
            if (!this.config.silent)
                console.log('Emitting generated code...');
            await this.genDir.emit(this.getEmitConfig());
        });
    }

    async gen () {
        await this.ast.forgetNodesCreatedInBlock(async () => {
            await this.genDir.saveUnsavedSourceFiles();
        });
    }

    private getEmitConfig (): EmitConfig {
        const config: EmitConfig = {};
        if (this.config.emitJavascript !== '')
            config.outDir = this.config.emitJavascript;
        if (this.config.emitDeclaration !== '')
            config.declarationDir = this.config.emitDeclaration;
        return config;
    }
}
