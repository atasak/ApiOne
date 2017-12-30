import {TContentManager} from './contentmanager';

export interface ContentPort<TEntry> {
    readonly entry: TEntry;
}

export class TContentPort<TEntry> implements ContentPort<TEntry> {
    constructor (private manager: TContentManager<TEntry>) {
    }

    get entry (): TEntry {
        return this.manager.entry;
    }
}
