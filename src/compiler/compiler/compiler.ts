import {readFileSync} from 'fs';
import {Schemer} from './schemer';
import {PromiseMap} from '../../util/promisemap';
import {Class} from '../models/class';

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
    classMap: PromiseMap<Class>;

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
        this.classMap.log();
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
