import {SinonSpy, spy as Spy} from 'sinon';
import {SyncPromise} from './syncpromise';
import {stub} from './utils.dev';

describe('Synchronous promises', () => {
    let spy1: SinonSpy;
    let spy2: SinonSpy;

    beforeEach(() => {
        spy1 = Spy();
        spy2 = Spy();
    });

    it('should resolve before AND after completion', () => {
        let resolve: (x: string) => void = x => stub(x);
        new SyncPromise<string>(r => resolve = r).then(spy1);
        spy1.should.not.have.been.called;
        resolve('x');
        spy1.should.have.been.calledWith('x');
        SyncPromise.Resolve<string>('y').then(spy2);
        spy2.should.have.been.calledWith('y');
    });

    it('should only accept a resolve once', () => {
        spy1 = Spy((resolve: (x: string) => void) => {
            resolve('x');
            resolve('x');
        });
        try {
            new SyncPromise<string>(spy1);
        } catch (e) {
        }
        spy1.should.have.thrown;
    });

    it('should chain then\'s correctly', () => {
        SyncPromise.Resolve('x').then(x => x + 'y').then(spy1);
        spy1.should.have.been.calledWith('xy');
    });

    /*it('should handle rejects', () => {
        new SyncPromise((_, reject) => reject()).then(spy1).catch(spy2);
        spy1.should.not.have.been.called;
        spy2.should.have.been.called;
    });*/
});
