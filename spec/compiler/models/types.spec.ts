import {Class} from '../../../src/compiler/models/class';
import {Dict} from '../../../src/compiler/models/dict';
import {List} from '../../../src/compiler/models/list';
import {Method} from '../../../src/compiler/models/method';
import {Property} from '../../../src/compiler/models/property';
import {compileTests} from '../../helpers/compile';

describe ('The type models', () => {
    let classType: Class, dictType: Dict, listType: List;

    beforeAll (() => {
        const schemer = compileTests ();
        classType = schemer.structures.get ('tests.ts#A') as Class;
        dictType = schemer.structures.get ('{ [key: string]: A }') as Dict;
        listType = schemer.structures.get ('string[]') as List;
    });

    it ('should return the correct type for classes', () => {
        expect (classType.typeAsString).toBe ('A');
    });

    it ('should return the correct type for dictionaries', () => {
        expect (dictType.typeAsString).toBe ('{ [key: string]: A }');
    });

    it ('should return the correct type for lists', () => {
        expect (listType.typeAsString).toBe ('string[]');
    });

    it ('should return the correct type for variables', () => {
        expect ((classType.properties.get ('str') as Property).type.typeAsString).toBe ('string');
        expect ((classType.properties.get ('num') as Property).type.typeAsString).toBe ('number');
        expect ((classType.properties.get ('bool') as Property).type.typeAsString).toBe ('boolean');
    });
});

describe ('The method models', () => {
    let method: Method;

    beforeAll (() => {
        const schemer = compileTests ();
        const classType = schemer.structures.get ('tests.ts#A') as Class;
        method = classType.properties.get ('method') as Method;
    });

    it ('should extract methods', () => {
        expect (method).toBeDefined ();
    });

    it ('should extract the correct parameters', () => {
        expect (method.parameters.length).toBe (3);
        expect (method.parameters[0].name).toBe ('x');
        expect (method.parameters[1].name).toBe ('y');
        expect (method.parameters[2].name).toBe ('b');
    });

    it ('should extract the correct types for parameters', () => {
        expect (method.parameters[0].type.typeAsString).toBe ('string');
        expect (method.parameters[1].type.typeAsString).toBe ('number');
        expect (method.parameters[2].type.typeAsString).toBe ('B');
    });

    it ('should extract the correct return value', () => {
        expect (method.returnType.typeAsString).toBe ('boolean');
    });
});
