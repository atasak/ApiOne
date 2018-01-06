import {SinonSpy, spy as Spy} from 'sinon';
import {PromiseMap} from './promisemap';

describe('The promisemap', () => {
    let spy: SinonSpy;
    let promiseMap: PromiseMap<string, string>;

    beforeEach(() => {
        spy = Spy();
        promiseMap = new PromiseMap<string, string>();
    });

    it('should handle promises correctly when getting and setting', () => {
        const promise = promiseMap.promise('x');
        promise.then(spy);
        spy.should.not.have.been.called;
        promiseMap.set('x', 'y');
        spy.should.have.been.calledWith('y');
    });

    it('should reject unresolved promises on finalize', () => {
        const promise = promiseMap.promise('x');
        promise.catch(spy);
        spy.should.not.have.been.called;
        promiseMap.finalize();
        spy.should.have.been.called;
    });
});
