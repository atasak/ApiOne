import {readFileSync} from 'fs';
import {Schemer} from './schemer/schemer';

export class ApiOneCompiler {
    defaultConfig: ApiOneConfig = {
        sourcePath: 'common',
        rootTypeName: 'ApiRoot',
        exportPaths: ['common/lib'],
    };

    config: ApiOneConfig;

    loadConfigFromFile(file: string) {
        const contents = readFileSync(file, 'utf8');
        const json = JSON.parse(contents);
    }

    loadConfig(config: any) {
        this.config = {} as ApiOneConfig;
        Object.assign(this.config, this.defaultConfig);
        Object.assign(this.config, config);
    }

    run() {
        const schemer = new Schemer(this.config).run();
    }
}

export class ApiOneConfig {
    sourcePath: string;
    rootTypeName: string;
    exportPaths: string[];
}
