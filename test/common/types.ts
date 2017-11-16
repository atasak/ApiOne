import {ApiMap} from './apimodeltypes';

export interface ApiRoot {
    readonly sources: ApiMap<Source>;
    readonly library: Library;
    readonly player: Player;
}

export interface Source {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly faviconUrl: string;
    readonly status: string;
    readonly availability: string;

    toggle();

    login();
}

export interface Library {
    readonly tracks: ApiMap<Track>;
    readonly albums: ApiMap<Album>;
    readonly artists: ApiMap<Artist>;
    readonly playlists: ApiMap<Playlist>;

    search(searchStr: string);
}

export interface Track {
    readonly id: string;
    title: string;
    album: Album ;
    artist: Artist ;
    length: number;
    readonly played: number;
    like: number;
    readonly instances: ApiMap<Instance>;

    play();

    playnext();

    addqueue(queue: string);

    addtracklist(playlist: string);
}

export interface Instance {
    readonly id: Source ;
    readonly source: Source ;
    readonly ref: string;
}

export interface Album {
    readonly id: string;
    title: string;
    artist: Artist ;
    tracks: ApiMap<Track>;

    play();

    playnext();

    addtoqueue(queue: string);

    addtracklist(playlist: string);
}

export interface Artist {
    readonly id: string;
    name: string;
    albums: ApiMap<Album>;
    tracks: ApiMap<Track>;

    play();

    playnext();

    addqueue(queue: string);

    addtracklist(playlist: string);
}

export interface Playlist {
    readonly id: string;
    name: string;
    trackqueue: Track[];
    tracklist: Track[];
    tracklogic: string;
    readonly source: Source ;
    readonly ref: string;

    play();

    playnext();

    addqueue(queue: string);

    addtracklist(playlist: string);
}

export interface Player {
    readonly playlist: Playlist;
    readonly track: Track;
    progress: number;
    readonly source: Source;

    play();

    pause();

    next();

    previous();
}
