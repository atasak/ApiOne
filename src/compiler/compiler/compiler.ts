import {readFileSync} from 'fs';
import {Printable} from '../../util/printable';
import {Type} from '../models/type';
import {Schemer} from './schemer';

export class ApiOneCompiler {
    defaultConfig: ApiOneConfig = {
        tsConfigFilePath: 'tsconfig.apione.json',
        sourcePath: 'common',
        rootType: 'ApiRoot',
        silent: false,
        printDatastructures: false,
        emitTypescript: '',
        emitJavascript: '',
        emitDeclaration: '',
    };

    config: ApiOneConfig;
    schemer!: Schemer;
    classMap!: Map<string, Type>;

    /**
     * Constructor
     *a
     */
    constructor () {
        this.config = {} as ApiOneConfig;
        Object.assign(this.config, this.defaultConfig);
    }

    loadConfigFromFile (file: string) {
        const contents = readFileSync(file, 'utf8');
        const json = JSON.parse(contents);
        this.loadConfig(json);
    }

    loadConfig (config: Partial<ApiOneConfig>) {
        Object.assign(this.config, config);
    }

    async run () {
        if (!this.config.silent)
            console.log('Embedding ApiOne...');
        this.schemer = new Schemer(this.config);
        this.classMap = this.schemer.run();

        let gen = Promise.resolve();
        let emit = Promise.resolve();

        if (this.config.printDatastructures)
            this.print();
        if (this.config.emitTypescript !== '')
            gen = this.schemer.gen();
        if (this.config.emitJavascript !== '' || this.config.emitDeclaration !== '')
            emit = this.schemer.emit();

        await Promise.all([gen, emit]);
        if (!this.config.silent)
            this.schemer.diagnose();
    }

    print () {
        for (const entry of this.classMap.entries()) {
            const key = entry[0] as string;
            const value = entry[1] as Type;
            console.log(`${key}: `);
            console.log((value as any as Printable).asString());
        }
    }
}

export interface ApiOneConfig {
    tsConfigFilePath: string;
    sourcePath: string;
    rootType: string;
    silent: boolean;
    printDatastructures: boolean;
    emitTypescript: string;
    emitJavascript: string;
    emitDeclaration: string;
}
