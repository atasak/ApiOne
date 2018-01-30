import {SinonSpy, spy as Spy} from 'sinon';
import {Iterate} from './iterate';

describe('Iterator mapping and combining', () => {
    const array1 = [3, 6, 8];
    const array2 = [3, 7];
    const obj = {
        a: 1,
        b: 2,
        c: 3,
    };

    let spy: SinonSpy;

    beforeEach(() => {
        spy = Spy();
    });

    it('should create an iterator from normal iterator', () => {
        for (const i of Iterate.from(array1))
            spy(i);
        spy.firstCall.should.have.been.calledWith(3);
        spy.secondCall.should.have.been.calledWith(6);
        spy.thirdCall.should.have.been.calledWith(8);
    });

    it('should zip the array iterators without nulls', () => {
        for (const [i, j] of Iterate.from(array1).zip$(array2))
            spy(i, j);
        spy.firstCall.should.have.been.calledWith(3, 3);
        spy.secondCall.should.have.been.calledWith(6, 7);
        spy.callCount.should.have.been.equal(2);
    });

    it('should zip the array iterators with nulls', () => {
        for (const [i, j] of Iterate.from(array1).zip(array2))
            spy(i, j);
        spy.firstCall.should.have.been.calledWith(3, 3);
        spy.secondCall.should.have.been.calledWith(6, 7);
        spy.thirdCall.should.have.been.calledWith(8, null);
    });

    it('should map the iterator', () => {
        for (const i of Iterate.from(array1).map(x => x + 1))
            spy(i);
        spy.firstCall.should.have.been.calledWith(4);
        spy.secondCall.should.have.been.calledWith(7);
        spy.thirdCall.should.have.been.calledWith(9);
    });

    it('should create a valid range iterator', () => {
        for (const _ of Iterate.range(4))
            spy();
        spy.should.have.callCount(4);
    });

    it('should create a valid object iterator', () => {
        for (const i of Iterate.object(obj))
            spy(i);
        spy.firstCall.should.have.been.calledWith(['a', 1]);
        spy.secondCall.should.have.been.calledWith(['b', 2]);
        spy.thirdCall.should.have.been.calledWith(['c', 3]);
    });
});
