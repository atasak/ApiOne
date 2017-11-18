import {ApiOneCompiler} from './compiler';

const compiler = new ApiOneCompiler();
compiler.loadConfigFromFile('apioneconfig.json');
compiler.run();
