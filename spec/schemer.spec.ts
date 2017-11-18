import {ApiOneCompiler} from '../src/compiler/compiler';

describe('The type schemer', () => {
    it('should load the config file', () => {
        const compiler = new ApiOneCompiler();
        compiler.loadConfigFromFile('apioneconfig.json');
        compiler.run();
    });
});
