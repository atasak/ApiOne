import {ApiOneCompiler} from './compiler/compiler';

const compiler = new ApiOneCompiler();
compiler.loadConfigFromFile('apioneconfig.json');
compiler.run();
