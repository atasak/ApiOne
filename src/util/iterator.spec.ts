import {SinonSpy, spy as Spy} from 'sinon';
import {Iterate} from './iterator';

describe('Iterator mapping and combining', () => {
    const array1 = [3, 6, 8];
    const array2 = [3, 7];

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

    it('should combine the array iterators without nulls', () => {
        for (const [i, j] of Iterate.from(array1).combine$(array2))
            spy(i, j);
        spy.firstCall.should.have.been.calledWith(3, 3);
        spy.secondCall.should.have.been.calledWith(6, 7);
        spy.callCount.should.have.been.equal(2);
    });

    it('should combine the array iterators with nulls', () => {
        for (const [i, j] of Iterate.from(array1).combine(array2))
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
});
