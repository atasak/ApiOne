import {SinonSpy, spy as Spy} from 'sinon';
import {Iterate, ResolvingId} from '../../util';
import {Package} from './package';
import {PackageCollector} from './packagecollector';

describe('The packagecollector', () => {
    let spy: SinonSpy;
    let packageCollector: PackageCollector;
    let id: ResolvingId;
    let ids: ResolvingId[] = [];
    let obj: Object;
    const foo = 'foo';
    const bar = 'bar';
    const type = 'A';

    async function checkAndPack (spy: SinonSpy, promise: Promise<void>): Promise<Package> {
        spy.should.not.have.been.called;
        await promise;
        spy.should.have.been.called;
        return spy.firstCall.args[0];
    }

    beforeEach(() => {
        spy = Spy();
        packageCollector = new PackageCollector(spy);
        Iterate.range(3).forEach(i => {
            ids.push(new ResolvingId('0000000' + i.toString()));
        });
        id = ids[0];
        obj = {foo: 'bar'};
    });

    it('should collect and eventually send resolve requests', async () => {
        const promise = packageCollector.resolve(type, id);
        const pack = await checkAndPack(spy, promise);
        const A = pack.resolve[type];
        A[0].should.be.equal(id.id);
    });

    it('should collect and eventually send additive broadcast requests by object', async () => {
        const promise = packageCollector.addObj(type, id, obj);
        const pack = await checkAndPack(spy, promise);
        const A = pack.additive[type];
        const i = A[id.id];
        const hello = i[foo];
        hello.should.equal(bar);
    });

    it('should collect and eventually send additive broadcast requests by field', async () => {
        const promise = packageCollector.addField(type, id, foo, bar);
        const pack = await checkAndPack(spy, promise);
        const A = pack.additive[type];
        const i = A[id.id];
        const hello = i[foo];
        hello.should.equal(bar);
    });

    it('should collect and eventually send substractive broadcast requests', async () => {
        const promise = packageCollector.deleteKey(type, id, foo);
        const pack = await checkAndPack(spy, promise);
        const A = pack.substractive[type];
        const i = A[id.id];
        const field = i[0];
        field.should.equal(foo);
    });

    it('should collect and eventually send id requests', async () => {
        const promise = packageCollector.requestIds(4);
        const pack = await checkAndPack(spy, promise);
        pack.requestIds.should.equal(4);
    });
});
