import {ApiOneCompiler} from '../src/compiler/compiler/compiler';

describe('The type models', () => {
    it('should load the config file', () => {
        const compiler = new ApiOneCompiler();
        compiler.loadConfigFromFile('apioneconfig.json');
        compiler.run();
    });
});
