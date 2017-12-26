import {flatten, OneMap, unMap} from '../../util/onemap';
import {id} from '../../util/utils';
import {
    AdditiveMap, FollowMap, JSONValType, Map1, Map2, Map3, Obj1, Obj2, Obj3, Package, ResolveMap,
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

    resolve (type: string, id: string, channel?: string, follow: string[] = []) {
        this.getCollector('resolve', channel)
            .resolve
            .getOrCreate(type)
            .set(id, '');

        for (const f of follow)
            this.getCollector('resolve', channel)
                .follow
                .getOrCreate(type)
                .set(f, '');

        this.setTimeout(channel);
    }

    addObj (type: string, id: string, data: Map1<JSONValType>, channel?: string) {
        this.getCollector('broadcast', channel)
            .additive
            .getOrCreate(type)
            .set(id, data);

        this.setTimeout(channel);
    }

    addField (type: string, id: string, field: string, data: JSONValType, channel?: string) {
        this.getCollector('broadcast', channel)
            .additive
            .getOrCreate(type)
            .getOrCreate(id)
            .set(field, data);

        this.setTimeout(channel);
    }

    deleteKey (type: string, id: string, field: string, channel?: string) {
        this.getCollector('broadcast', channel)
            .substractive
            .getOrCreate(type)
            .getOrCreate(id)
            .set(field, '');

        this.setTimeout(channel);
    }

    sendPackage (channel: string, packageType: PackageType, receiver?: string) {
        const channelCollector = this.channels.get(channel);
        if (channelCollector != null && !channelCollector.empty()) {
            this.callback(channelCollector.toPackage(), packageType, receiver);
            this.channels.delete(channel);
        }
    }

    private getCollector (pack: PackageType, channel?: string): CollectingPackage {
        let collect: CollectingPackage;
        if (channel != null)
            collect = this.channels.getOrCreate(channel);
        else
            collect = {
                resolve: this.resolvePackage,
                broadcast: this.broadcastPackage,
            }[pack];
        return collect;
    }

    private setTimeout (channel?: string) {
        if (channel == null && this.timeout == null)
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

    toPackage (): Package {
        const pack = new Package();
        pack.resolve = this.unmapResolveFollow(this.resolve);
        pack.follow = this.unmapResolveFollow(this.follow);
        pack.additive = this.unmapAdditive(this.additive);
        pack.substractive = this.unmapSubstractive(this.substractive);
        return pack;
    }

    unmapResolveFollow (map2: Map2<string>): Obj1<string[]> {
        return unMap<Map1<string>, string[]>(map2, (map1: Map1<string>) =>
            flatten<string, string>(map1, id));
    }

    unmapAdditive (map3: Map3<JSONValType>): Obj3<JSONValType> {
        return unMap<Map2<JSONValType>, Obj2<JSONValType>>(map3, (map2: Map2<JSONValType>) =>
            unMap<Map1<JSONValType>, Obj1<JSONValType>>(map2, (map1: Map1<JSONValType>) =>
                unMap<JSONValType, JSONValType>(map1, id)));
    }

    unmapSubstractive (map3: Map3<string>): Obj2<string[]> {
        return unMap<Map2<string>, Obj1<string[]>>(map3, (map2: Map2<string>) =>
            unMap<Map1<string>, string[]>(map2, (map1: Map1<string>) =>
                flatten<string, string>(map1, id)));
    }


    empty (): boolean {
        return this.resolve.size + this.additive.size + this.substractive.size === 0;
    }
}
