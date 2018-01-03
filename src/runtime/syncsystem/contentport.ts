import {TContentManager} from './contentmanager';
import {ContentPort} from './interfaces';

export class TContentPort<TEntry> implements ContentPort<TEntry> {
    constructor (private manager: TContentManager<TEntry>) {
    }

    get entry (): TEntry {
        return this.manager.entry;
    }
}
