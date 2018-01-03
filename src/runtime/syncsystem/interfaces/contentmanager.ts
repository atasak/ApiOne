export interface ContentManager<TEntry> {
    getNewContentPort(): ContentPort<TEntry>;
}

export interface ContentPort<TEntry> {
    readonly entry: TEntry;
}

