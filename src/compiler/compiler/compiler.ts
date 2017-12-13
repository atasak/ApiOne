import {readFileSync} from 'fs';
import {Schemer} from './schemer';

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
        console.log('Compiling as ApiOne with config: ');
        console.log(this.config);
        this.schemer = new Schemer(this.config);
        const classMap = this.schemer.run();
        classMap.log();
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
