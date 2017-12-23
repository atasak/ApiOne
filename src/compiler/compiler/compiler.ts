import {readFileSync} from 'fs';
import {Printable} from '../../util/printable';
import {Type} from '../models/type';
import {Schemer} from './schemer';

export class ApiOneCompiler {
    defaultConfig: ApiOneConfig = {
        tsConfigFilePath: 'tsconfig.apione.json',
        sourcePath: 'common',
        rootType: 'ApiRoot',
        emit: true,
        silent: false,
        printDatastructures: false,
    };

    config: ApiOneConfig;
    schemer: Schemer;
    classMap: Map<string, Type>;

    /**
     * Constructor
     *a
     */
    constructor () {
        this.config = {} as ApiOneConfig;
        Object.assign (this.config, this.defaultConfig);
    }

    loadConfigFromFile (file: string) {
        const contents = readFileSync (file, 'utf8');
        const json = JSON.parse (contents);
        this.loadConfig (json);
    }

    loadConfig (config: Partial<ApiOneConfig>) {
        Object.assign (this.config, config);
    }

    run () {
        if (!this.config.silent)
            console.log ('Embedding ApiOne...');
        this.schemer = new Schemer (this.config);
        this.classMap = this.schemer.run ();
        if (this.config.printDatastructures)
            this.print ();
        if (this.config.emit)
            this.write ();
    }

    print () {
        for (const entry of this.classMap.entries ()) {
            const key = entry[0] as string;
            const value = entry[1] as Type;
            console.log (`${key}: `);
            console.log ((value as any as Printable).asString ());
        }
    }

    write () {
        this.schemer.write ();
    }
}

export class ApiOneConfig {
    tsConfigFilePath: string;
    sourcePath: string;
    rootType: string;
    emit: boolean;
    silent: boolean;
    printDatastructures: boolean;
}
