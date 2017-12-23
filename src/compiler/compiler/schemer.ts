import * as path from 'path';
import Ast, {Node, SourceFile} from 'ts-simple-ast';
import {noop} from '../../util/utils';
import {Class} from '../models/class';
import {Type} from '../models/type';
import {getRelativeFullName} from '../models/typeutils';
import {ApiOneConfig} from './compiler';

export class Schemer {
    structures: Map<string, Type> = new Map<string, Type> ();
    ast: Ast;

    constructor (public config: ApiOneConfig) {
    }

    run (): Map<string, Type> {
        this.extractSources ();
        this.transformSources ();
        // console.log (sources[0].getFullText ());
        return this.structures;
    }

    extractSources () {
        this.ast = new Ast ({tsConfigFilePath: this.config.tsConfigFilePath});
        const sources = this.ast.addExistingSourceFiles (`${this.config.sourcePath}/**/*.ts`);
        // this.ast.forgetNodesCreatedInBlock (remember => {
        const remember = noop;
        for (const source of sources)
            this.extractStructures (source, remember);
        // });
    }

    extractStructures (source: SourceFile, remember: (...node: Node[]) => void) {
        for (const classNode of source.getClasses ()) {
            const symbol = classNode.getSymbol ();
            if (symbol == null)
                throw new Error ();

            const fullName = getRelativeFullName (this, symbol);
            const clazz = Class.Construct (this, fullName);
            clazz.isOf (classNode, remember);
        }
    }

    transformSources () {
        for (const structure of this.structures.values ()) {
            if (structure instanceof Class)
                structure.transform ();
        }
        this.addImports ();
    }

    addImports () {
        const mask = path.join (process.cwd (), this.config.sourcePath, '**/*.ts');
        for (const source of this.ast.getSourceFiles (mask))
            source.addImport ({
                namedImports: [
                    {name: 'ClassWrapper'},
                    {name: 'ListWrapper'},
                    {name: 'DictWrapper'},
                    {name: 'VarWrapper'},
                ],
                moduleSpecifier: 'apiwrapper',
            });
    }

    write () {
        this.ast.forgetNodesCreatedInBlock (() => {
            if (!this.config.silent)
                console.log ('Emitting generated code...');
            let diag = this.ast.emit ().getDiagnostics ();
            diag = diag.concat (this.ast.getDiagnostics ());
            for (const d of diag) {
                const sourceFile = d.getSourceFile ();
                if (sourceFile == null)
                    throw new Error ();
                console.log (`${sourceFile.getFilePath ()}.${d.getStart ()}: ${d.getMessageText ()}`);
            }
            if (diag.length === 0 && !this.config.silent)
                console.log ('No errors!');
        });
    }
}
