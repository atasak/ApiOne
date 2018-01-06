import {SinonSpy, spy as Spy} from 'sinon';
import {PackageCollector} from './packagecollector';

describe('The packagecollector', () => {
    let spy: SinonSpy;
    let packageCollector: PackageCollector;

    beforeEach(() => {
        spy = Spy();
        packageCollector = new PackageCollector(spy);
    });

    it('should collect and eventually send resolve requests', (done) => {
        packageCollector.resolve('A', '11111111');
        const resolveTypes = (packageCollector as any).resolvePackage.resolve;
        resolveTypes.has('A').should.be.true;
        resolveTypes.get('A').has('11111111').should.be.true;
        spy.should.not.have.been.called;
        setTimeout(() => {
            spy.should.have.been.called;
            done();
        }, 0);
    });

    it('should collect and eventually send additive broadcast requests by object', (done) => {
        packageCollector.addObj('A', '11111111');
        const resolveTypes = (packageCollector as any).resolvePackage.resolve;
        resolveTypes.has('A').should.be.true;
        resolveTypes.get('A').has('11111111').should.be.true;
        spy.should.not.have.been.called;
        setTimeout(() => {
            spy.should.have.been.called;
            done();
        }, 0);
 0);
    });

    it('should collect and eventually send substractive broadcast requests', (done) => {
        packageCollector.substractiveBroadcast('A', '11111111');
        const substractiveTypes = (packageCollector as any).broadcastPackage.substractive;
        expect(substractiveTypes.has('A')).toBeTruthy();
        expect(substractiveTypes.get('A').has('11111111')).toBeTruthy();
        expect(spy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(spy).toHaveBeenCalledTimes(1);
            done();
        }, 0);
    });

    it('should collect channeled requests and send them when requested', (done) => {
        packageCollector.resolve('A', '11111111', 'A');
        const resolveTypes = (packageCollector as any).channels.get('A').resolve;
        expect(resolveTypes.has('A')).toBeTruthy();
        expect(resolveTypes.get('A').has('11111111')).toBeTruthy();
        expect(spy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(spy).not.toHaveBeenCalled();
            packageCollector.sendPackage('A', 'broadcast');
            expect(spy).toHaveBeenCalledTimes(1);
            done();
        }, 0);
    });

    it('should collect subsequent request and send them all together', (done) => {
        packageCollector.resolve('A', '11111111');
        packageCollector.resolve('A', '11111112');
        packageCollector.resolve('B', '11111113');
        expect(spy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(spy).toHaveBeenCalledTimes(1);
            done();
        }, 0);
    });

    it('should collect and send broadcast requests separate from resolve requests', (done) => {
        packageCollector.substractiveBroadcast('A', '11111112');
        packageCollector.resolve('B', '11111113');
        expect(spy).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(spy).toHaveBeenCalledTimes(2);
            done();
        }, 0);
    });
});
