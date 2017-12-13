import {ApiOneCompiler} from './compiler/compiler';

const compiler = new ApiOneCompiler();
compiler.loadConfigFromFile('apioneconfig.json');
compiler.run();
compiler.print();
compiler.write();
