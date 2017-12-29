import {TContentManager} from './contentmanager';

export class TContentPort<TEntry> {
    constructor(private manager: TContentManager<TEntry>) {
    }

    get entry(): TEntry {
        return this.manager.entry;
    }
}
