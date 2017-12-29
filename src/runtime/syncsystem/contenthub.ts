import {stub} from '../../util/utils.dev';
import {TContentManager} from './contentmanager';
import {IHubConnection, IHubNode} from './hubconnection';
import {Package} from './package';
import {PackageCollector, PackageType} from './packagecollector';

export class TContentHub<T> extends PackageCollector implements IHubNode {
    server: IHubConnection | null = null;
    peers: IHubConnection[] = [];

    contentManager: TContentManager<T>

    constructor (entry: T) {
        super((pack, packageType, receiver) => this.send(pack, packageType, receiver));
        this.contentManager = new TContentManager<T>(this, entry);
    }

    sync (pack: Package) {
        stub(pack);
    }

    private send (pack: Package, packageType: PackageType, receiver?: string) {
        stub(pack);
        stub(packageType);
        stub(receiver);
    }
}
