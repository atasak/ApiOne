import {compileTests} from '../../../spec/compile';
import {Class} from './class';
import {Dict} from './dict';
import {List} from './list';
import {Method} from './method';
import {Property} from './property';

describe('The type models', () => {
    let classType: Class;
    let dictType: Dict;
    let listType: List;

    before(() => {
        const schemer = compileTests();
        classType = schemer.structures.get('tests.ts#A') as Class;
        dictType = schemer.structures.get('{ [key: string]: A }') as Dict;
        listType = schemer.structures.get('string[]') as List;
    });

    it('should return the correct type for classes', () => {
        classType.typeAsString.should.equal('A');
    });

    it('should return the correct type for dictionaries', () => {
        dictType.typeAsString.should.equal('{ [key: string]: A }');
    });

    it('should return the correct type for lists', () => {
        listType.typeAsString.should.equal('string[]');
    });

    it('should return the correct type for variables', () => {
        (classType.properties.get('str') as Property).type.typeAsString.should.equal('string');
        (classType.properties.get('num') as Property).type.typeAsString.should.equal('number');
        (classType.properties.get('bool') as Property).type.typeAsString.should.equal('boolean');
    });
});

describe('The method models', () => {
    let method: Method;

    before(() => {
        const schemer = compileTests();
        const classType = schemer.structures.get('tests.ts#A') as Class;
        method = classType.properties.get('method') as Method;
    });

    it('should extract the correct parameters', () => {
        method.parameters.length.should.equal(3);
        method.parameters[0].name.should.equal('x');
        method.parameters[1].name.should.equal('y');
        method.parameters[2].name.should.equal('b');
    });

    it('should extract the correct types for parameters', () => {
        method.parameters[0].type.typeAsString.should.equal('string');
        method.parameters[1].type.typeAsString.should.equal('number');
        method.parameters[2].type.typeAsString.should.equal('B');
    });

    it('should extract the correct return value', () => {
        method.returnType.typeAsString.should.equal('boolean');
    });
});
