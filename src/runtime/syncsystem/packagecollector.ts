import {Package} from './package';

export type PackageType = 'resolve' | 'broadcast';
export type PackageOp = 'resolve' | 'additive' | 'substractive';

export class PackageCollector {
    private resolvePackage = new CollectingPackage ();
    private broadcastPackage = new CollectingPackage ();
    private channels = new Map<string, CollectingPackage> ();
    private timeout = null;

    constructor (private callback: (Package, PackageType, string?) => void) {
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
        this.callback (this.channels[channel].toPackage (), packageType, receiver);
    }

    private broadcast (pack: PackageType, op: PackageOp, type: string, id: string, json: string, channel?: string) {
        if (channel != null && this.channels[channel] == null)
            this.channels[channel] = new CollectingPackage ();

        const collect = channel == null ? this[pack + 'Package'] : this.channels[channel];
        if (!collect[op].has (type))
            collect[op].set (type, new Map<string, string> ());
        collect[op][type].set (id, json);

        if (channel == null && this.timeout == null)
            this.setTimeout ();
    }

    private setTimeout () {
        this.timeout = setTimeout (() => {
            this.callback (this.resolvePackage.toPackage (), 'resolve');
            this.callback (this.broadcastPackage.toPackage (), 'broadcast');
        }, 0);
    }
}

class CollectingPackage {
    resolve = new Map<string, Map<string, string>> ();

    additive = new Map<string, Map<string, string>> ();
    substractive = new Map<string, Map<string, string>> ();

    toPackage (): Package {
        const pack = new Package ();
        pack.resolve = this.flatten (this.resolve);
        pack.additive = this.unMap (this.additive);
        pack.substractive = this.flatten (this.substractive);
        return pack;
    }

    flatten (map: Map<string, Map<string, string>>): { [key: string]: string[] } {
        const newMap = {};
        map.forEach ((instances, type) => {
            const array = [];
            instances.forEach ((_, instanceId) =>
                array.push (instanceId));
            newMap[type] = array;
        });
        return newMap;
    }

    unMap (map: Map<string, Map<string, string>>): { [key: string]: { [key: string]: string } } {
        const newMap = {};
        map.forEach ((instances, type) => {
            const subMap = {};
            instances.forEach ((instance, instanceId) =>
                subMap[instanceId] = instance);
            newMap[type] = subMap;
        });
        return newMap;
    }
}
