import {ApiOneCompiler} from '../src/compiler/compiler/compiler';
import {Schemer} from '../src/compiler/compiler/schemer';

export function compileTests (): Schemer {
    const compiler = new ApiOneCompiler();
    compiler.loadConfigFromFile('apioneconfig.json');
    compiler.loadConfig({
        silent: true,
        printDatastructures: false,
    });
    compiler.run();
    return compiler.schemer;
}
