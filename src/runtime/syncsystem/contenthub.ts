import {IHubConnection, IHubNode} from './hubconnection';
import {Package} from './package';
import {ContentManager} from './contentmanager';
import {PackageCollector, PackageType} from './packagecollector';

export class ContentHub<T> extends ContentManager<T> implements IHubNode {
    server: IHubConnection = null;
    peers: IHubConnection[] = [];

    packageCollector = new PackageCollector ((pack, packageType, receiver) =>
        this.broadcast (pack, packageType, receiver));

    constructor () {
        super ();
    }

    resolve (type: string, id: string): boolean {
        if (this.server == null)
            return false;
    }

    additiveBroadcast (type: string, id: string, json: string, channel?: string) {
    }

    substractiveBroadcast (type: string, id: string, channel?: string) {
    }

    sendPackage (channel: string, packageType: PackageType, receiver?: string) {

    }

    sync (pack: Package) {
    }

    private broadcast (pack: Package, packageType: PackageType, receiver: string) {
    }
}
