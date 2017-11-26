import {Package} from "./package";

export interface IHubNode {
    sync (pack: Package);
}

export interface IHubConnection {
    sync (pack: Package);
    onsync (node: IHubNode);
    need (objects: {[key: string]: string[]});
}
