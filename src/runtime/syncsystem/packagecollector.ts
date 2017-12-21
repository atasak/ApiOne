import {OneMap} from '../../util/onemap';
import {Package} from './package';
import Timer = NodeJS.Timer;

export type PackageType = 'resolve' | 'broadcast';
export type PackageOp = 'resolve' | 'additive' | 'substractive';

export class PackageCollector {
    private resolvePackage = new CollectingPackage ();
    private broadcastPackage = new CollectingPackage ();
    private channels = new OneMap<string, CollectingPackage> (() => new CollectingPackage ());
    private timeout: Timer | null = null;

    constructor (private callback: (pack: Package, type: PackageType, receiver?: string) => void) {
    }

    resolve (type: string, id: string, channel?: string) {
        this.broadcast ('resolve', 'resolve', type, id, '', channel);
    }


    additiveBroadcast (type: string, id: string, json: string, channel?: string) {
        this.broadcast ('broadcast', 'additive', type, id, json, channel);
    }

    substractiveBroadcast (type: string, id: string, channel?: string) {
        this.broadcast ('broadcast', 'substractive', type, id, '', channel);
    }

    sendPackage (channel: string, packageType: PackageType, receiver?: string) {
        const channelCollector = this.channels.get (channel);
        if (channelCollector != null && !channelCollector.empty ()) {
            this.callback (channelCollector.toPackage (), packageType, receiver);
            this.channels.delete (channel);
        }
    }

    private getCollector (pack: PackageType, channel?: string): CollectingPackage {
        let collect: CollectingPackage;
        if (channel != null)
            collect = this.channels.getOrCreate (channel);
        else
            collect = {
                resolve: this.resolvePackage,
                broadcast: this.broadcastPackage,
            }[pack];
        return collect;
    }

    private broadcast (pack: PackageType, op: PackageOp, type: string, id: string, json: string, channel?: string) {
        const collect = this.getCollector (pack, channel);

        collect[op].getOrCreate (type).set (id, json);

        if (channel == null && this.timeout == null)
            this.setTimeout ();
    }

    private setTimeout () {
        this.timeout = setTimeout (() => {
            if (!this.resolvePackage.empty ())
                this.callback (this.resolvePackage.toPackage (), 'resolve');
            if (!this.broadcastPackage.empty ())
                this.callback (this.broadcastPackage.toPackage (), 'broadcast');
            this.resolvePackage = new CollectingPackage ();
            this.broadcastPackage = new CollectingPackage ();
        }, 0);
    }
}

function mapCreator (): Map<string, string> {
    return new Map<string, string> ();
}

class CollectingPackage {
    resolve = new OneMap<string, Map<string, string>> (mapCreator);

    additive = new OneMap<string, Map<string, string>> (mapCreator);
    substractive = new OneMap<string, Map<string, string>> (mapCreator);

    toPackage (): Package {
        const pack = new Package ();
        pack.resolve = this.flatten (this.resolve);
        pack.additive = this.unMap (this.additive);
        pack.substractive = this.flatten (this.substractive);
        return pack;
    }

    flatten (map: Map<string, Map<string, string>>): { [key: string]: string[] } {
        const newMap: { [key: string]: string[] } = {};
        map.forEach ((instances, type) => {
            const array: string[] = [];
            instances.forEach ((_, instanceId) =>
                array.push (instanceId));
            newMap[type] = array;
        });
        return newMap;
    }

    unMap (map: Map<string, Map<string, string>>): { [key: string]: { [key: string]: string } } {
        const newMap: { [key: string]: { [key: string]: string } } = {};
        map.forEach ((instances, type) => {
            const subMap: { [key: string]: string } = {};
            instances.forEach ((instance, instanceId) =>
                subMap[instanceId] = instance);
            newMap[type] = subMap;
        });
        return newMap;
    }

    empty (): boolean {
        return this.resolve.size + this.additive.size + this.substractive.size === 0;
    }
}
