import {SinonSpy, spy as Spy} from 'sinon';
import {IdFactory, idMatchesMask, ResolvableIdFactory} from './id';
import {Iterate} from './iterate';
import {doAsync} from './utils';

// tslint:disable:no-unused-expression

describe('The id factory', () => {
    const testMask = '0+$$';
    let idFactory: IdFactory;

    beforeEach(() => {
        idFactory = new IdFactory(testMask);
    });

    it('should create an id according to a mask', () => {
        for (let i = 0; i < 100; i++) {
            const id = idFactory.id();
            id[0].should.equal('0');
            id[1].should.not.equal('0');
            id.length.should.equal(4);
        }
    });

    it('should recognize an id by it\'s mask', () => {
        for (const mask of ['$$$$', '+45+', '$94$', '00$$', '++++']) {
            idFactory = new IdFactory(mask);
            Iterate.range(100).forEach(() => {
                const id = idFactory.id();
                idMatchesMask(id, mask).should.be.true;
            });
        }
        idMatchesMask('5678', '4$$$').should.not.be.true;
        idMatchesMask('3456', '$$$').should.not.be.true;
        idMatchesMask('+456', '0345').should.not.be.true;
    });
});

describe('The resolvable id factory', () => {
    const testMask = '0+$$';
    let idFactory: ResolvableIdFactory;
    let spy: SinonSpy;

    beforeEach(() => {
        idFactory = new ResolvableIdFactory(testMask);
        spy = Spy();
    });

    it('should resolve an id after it\'s creation', done => {
        const id = idFactory.id();
        const oldId = id.id;
        id.promise.then(spy);
        idFactory.resolveIds(['1111', '2222']);
        doAsync(() => {
            spy.should.have.been.calledWith([oldId, '1111']);
            spy.should.have.been.calledOnce;
            done();
        });
    });
});
