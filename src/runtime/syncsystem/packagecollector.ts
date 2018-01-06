import {objToMap, ResolvableId} from '../../util';
import {flatten, mapToObj, OneMap} from '../../util/onemap';
import {ID} from '../../util/utils';
import {
    AdditiveMap, DataObj, FollowMap, Map1, Map2, Map3, Obj1, Obj2, Obj3, Package, Primitive, ResolveMap,
    SubstractiveMap,
} from './package';
import Timer = NodeJS.Timer;

export type PackageType = 'resolve' | 'broadcast';

export class PackageCollector {
    private resolvePackage = new CollectingPackage();
    private broadcastPackage = new CollectingPackage();
    private channels = new OneMap<string, CollectingPackage>(() => new CollectingPackage());
    private timeout: Timer | null = null;

    constructor (private callback: (pack: Package, type: PackageType, receiver?: string) => void) {
    }

    resolve (type: string, id: string, follow: string[] = []) {
        this.getCollector('resolve')
            .resolve
            .getOrCreate(type)
            .set(id, '');

        for (const f of follow)
            this.getCollector('resolve')
                .follow
                .getOrCreate(type)
                .set(f, '');

        this.setTimeout();
    }

    addObj (type: string, id: string, data: DataObj) {
        this.getCollector('broadcast')
            .additive
            .getOrCreate(type)
            .set(id, objToMap(data,));

        this.setTimeout();
    }

    addField (type: string, id: string, field: string, data: ResolvableId | Primitive) {
        this.getCollector('broadcast')
            .additive
            .getOrCreate(type)
            .getOrCreate(id)
            .set(field, data);

        this.setTimeout();
    }

    deleteKey (type: string, id: string, field: string) {
        this.getCollector('broadcast')
            .substractive
            .getOrCreate(type)
            .getOrCreate(id)
            .set(field, '');

        this.setTimeout();
    }

    sendPackage (channel: string, packageType: PackageType, receiver?: string) {
        const channelCollector = this.channels.get(channel);
        if (channelCollector != null && !channelCollector.empty()) {
            this.callback(channelCollector.toPackage(), packageType, receiver);
            this.channels.delete(channel);
        }
    }

    requestIds (ids: number) {
        this.getCollector('resolve').requestIds += ids;
    }

    private getCollector (pack: PackageType): CollectingPackage {
        if (pack === 'resolve')
            return this.resolvePackage;
        return this.broadcastPackage;
    }

    private setTimeout () {
        if (this.timeout == null)
            this.timeout = setTimeout(() => {
                if (!this.resolvePackage.empty())
                    this.callback(this.resolvePackage.toPackage(), 'resolve');
                if (!this.broadcastPackage.empty())
                    this.callback(this.broadcastPackage.toPackage(), 'broadcast');
                this.resolvePackage = new CollectingPackage();
                this.broadcastPackage = new CollectingPackage();
            }, 0);
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
        return this.resolve.size + this.additive.size + this.substractive.size === 0;
    }
}
