import {ResolvableId, ResolvableIdFactory} from '../../util/id';
import {IContentManager} from './contentmanager';

export class ContentTransformer {
    constructor (private manager: IContentManager, private idFactory: ResolvableIdFactory) {
    }

    transform (type: string, data: any): ResolvableId[] {
    }
}
