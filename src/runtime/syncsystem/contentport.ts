import {TContentManager} from './contentmanager';

export class TContentPort<TEntry> {
    constructor (private manager: TContentManager<TEntry>) {
    }

    get entry (): TEntry {
        return this.manager.entry;
    }

    getObjectsByType<T> (type: string): Map<string, T> | undefined {
        return this.manager.getObjectsByType(type);
    }

    getObjectById<T> (type: string, id: string): T | undefined {
        return this.manager.getObjectById(type, id);
    }
}
