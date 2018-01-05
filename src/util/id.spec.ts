import {expect} from 'chai';
import {IdFactory} from './id';

describe('The Id module', () => {
    const testMask = '0+$$';

    let idFactory: IdFactory;

    beforeEach(() => {
        idFactory = new IdFactory(testMask);
    });

    it('should ')

    it('should create an id according to a mask', () => {
        for (let i = 0; i < 1000; i++) {
            const id = idFactory.id();
            expect(id[0]).to.equal('0');
            expect(id[1]).not.to.equal('0');
            expect(id.length).to.equal(4);
        }
    });
});
