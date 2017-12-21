import {readFileSync} from 'fs';
import {Schemer} from './schemer';
import {Type} from '../models/type';
import {Printable} from '../../util/printable';

export class ApiOneCompiler {
    defaultConfig: ApiOneConfig = {
        sourcePath: 'common',
        rootTypeName: 'ApiRoot',
        exportPath: 'common/lib',
        index: 'apione',
        indexAsPath: false,
    };

    config: ApiOneConfig;
    schemer: Schemer;
    classMap: Map<string, Type>;

    loadConfigFromFile(file: string) {
        const contents = readFileSync(file, 'utf8');
        const json = JSON.parse(contents);
        this.loadConfig(json);
    }

    loadConfig(config: any) {
        this.config = {} as ApiOneConfig;
        Object.assign(this.config, this.defaultConfig);
        Object.assign(this.config, config);
    }

    run() {
        console.log('Embedding ApiOne...');
        this.schemer = new Schemer(this.config);
        this.classMap = this.schemer.run();
    }

    print() {
        for (const entry of this.classMap.entries()) {
            const key = entry[0] as string;
            const value = entry[1] as Type;
            console.log(`${key}: `);
            console.log((value as any as Printable).asString());
        }
    }

    write() {
        this.schemer.write();
    }
}

export class ApiOneConfig {
    sourcePath: string;
    rootTypeName: string;
    exportPath: string;
    index: string;
    indexAsPath: boolean;
}
