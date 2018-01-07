import {doAsync, flatten, ID, Iterate, mapToObj, OneMap, ResolvingId} from '../../util';
import {
    AdditiveMap, DataObj, FollowMap, Map1, Map2, Map3, Obj1, Obj2, Obj3, Package, Primitive, ResolveMap,
    SubstractiveMap,
} from './package';

export type PackageType = 'resolve' | 'broadcast';

async function toPrimitive (x: ResolvingId | Primitive): Promise<Primitive> {
    if (x instanceof ResolvingId)
        return (await x.promise)[1];
    return x;
}

export class PackageCollector {
    private resolvePackage = new CollectingPackage();
    private broadcastPackage = new CollectingPackage();
    private channels = new OneMap<string, CollectingPackage>(() => new CollectingPackage());
    private timeout: Promise<void> | null;

    constructor (private callback: (pack: Package, type: PackageType, receiver?: string) => void) {
    }

    async resolve (type: string, id: ResolvingId, follow: string[] = []) {
        this.getCollector('resolve')
            .resolve
            .getOrCreate(type)
            .set((await id.promise)[1], (await id.promise)[1]);

        for (const f of follow)
            this.getCollector('resolve')
                .follow
                .getOrCreate(type)
                .set(f, '');

        await this.setTimeout();
    }

    async addObj (type: string, id: ResolvingId, data: DataObj) {
        const map = this.getCollector('broadcast')
            .additive
            .getOrCreate(type)
            .getOrCreate((await id.promise)[1]);
        Iterate.object(data).forEach(async ([key, value]) => map.set(key, await toPrimitive(value)));

        await this.setTimeout();
    }

    async addField (type: string, id: ResolvingId, field: string, data: ResolvingId | Primitive) {
        this.getCollector('broadcast')
            .additive
            .getOrCreate(type)
            .getOrCreate((await id.promise)[1])
            .set(field, await toPrimitive(data));

        await this.setTimeout();
    }

    async deleteKey (type: string, id: ResolvingId, field: string) {
        this.getCollector('broadcast')
            .substractive
            .getOrCreate(type)
            .getOrCreate((await id.promise)[1])
            .set(field, field);

        await this.setTimeout();
    }

    async requestIds (ids: number) {
        this.getCollector('resolve').requestIds += ids;

        await this.setTimeout();
    }

    sendPackage (channel: string, packageType: PackageType, receiver?: string) {
        const channelCollector = this.channels.get(channel);
        if (channelCollector != null && !channelCollector.empty()) {
            this.callback(channelCollector.toPackage(), packageType, receiver);
            this.channels.delete(channel);
        }

        this.setTimeout();
    }

    private getCollector (pack: PackageType): CollectingPackage {
        if (pack === 'resolve')
            return this.resolvePackage;
        return this.broadcastPackage;
    }

    private async setTimeout () {
        if (this.timeout == null)
            this.timeout = doAsync(() => {
                if (!this.resolvePackage.empty())
                    this.callback(this.resolvePackage.toPackage(), 'resolve');
                if (!this.broadcastPackage.empty())
                    this.callback(this.broadcastPackage.toPackage(), 'broadcast');
                this.resolvePackage = new CollectingPackage();
                this.broadcastPackage = new CollectingPackage();
                this.timeout = null;
            });
        await this.timeout;
    }
}

function mapCreator (): Map<string, string> {
    return new Map<string, string>();
}

function doubleMapCreator (): OneMap<string, Map<string, string>> {
    return new OneMap<string, Map<string, string>>(mapCreator);
}

class CollectingPackage {
    resolve: ResolveMap = new OneMap<string, Map<string, string>>(mapCreator);
    follow: FollowMap = new OneMap<string, Map<string, string>>(mapCreator);

    additive: AdditiveMap = new OneMap<string, OneMap<string, Map<string, string | boolean | number>>>(doubleMapCreator);
    substractive: SubstractiveMap = new OneMap<string, OneMap<string, Map<string, string>>>(doubleMapCreator);

    requestIds = 0;

    toPackage (): Package {
        const pack = new Package();
        pack.resolve = this.unmapResolveFollow(this.resolve);
        pack.follow = this.unmapResolveFollow(this.follow);
        pack.additive = this.unmapAdditive(this.additive);
        pack.substractive = this.unmapSubstractive(this.substractive);
        pack.requestIds = this.requestIds;
        return pack;
    }

    unmapResolveFollow (map2: Map2<string>): Obj1<string[]> {
        return mapToObj<Map1<string>, string[]>(map2, (map1: Map1<string>) =>
            flatten<string, string>(map1, ID));
    }

    unmapAdditive (map3: Map3<Primitive>): Obj3<Primitive> {
        return mapToObj<Map2<Primitive>, Obj2<Primitive>>(map3, (map2: Map2<Primitive>) =>
            mapToObj<Map1<Primitive>, Obj1<Primitive>>(map2, (map1: Map1<Primitive>) =>
                mapToObj<Primitive, Primitive>(map1, ID)));
    }

    unmapSubstractive (map3: Map3<string>): Obj2<string[]> {
        return mapToObj<Map2<string>, Obj1<string[]>>(map3, (map2: Map2<string>) =>
            mapToObj<Map1<string>, string[]>(map2, (map1: Map1<string>) =>
                flatten<string, string>(map1, ID)));
    }

    empty (): boolean {
        return this.resolve.size + this.additive.size + this.substractive.size + this.requestIds === 0;
    }
}
