import {ResolvingId} from '../../util';
import {OneMap} from '../../util/onemap';

export type Status = 100 | 400 | 403 | 404 | 500;
export const statusText = {
    100: 'OK',
    400: 'Bad request',
    403: 'Forbidden',
    404: 'Not found',
    500: 'Network Error',
};

export type DataObj = { [key: string]: ResolvingId | Primitive }
export type Primitive = string | number | boolean;

export type Map1<T> = Map<string, T>;
export type Map2<T> = OneMap<string, Map1<T>>;
export type Map3<T> = OneMap<string, Map2<T>>;

export type Obj1<T> = { [key: string]: T };
export type Obj2<T> = { [key: string]: Obj1<T> };
export type Obj3<T> = { [key: string]: Obj2<T> };

export type ResolveObj = Obj1<string[]>;
export type FollowObj = Obj1<string[]>;
export type AdditiveObj = Obj3<Primitive>;
export type SubstractiveObj = Obj2<string[]>;

export type ResolveMap = Map2<string>
export type FollowMap = Map2<string>;
export type AdditiveMap = Map3<Primitive>
export type SubstractiveMap = Map3<string>

export class Package {
    oneInterfaceVersion = '';
    oneImplementationVersion = '';
    appInterfaceVersion = '';
    appImplementationVersion = '';

    trace: string[] = [];
    status: Status[] = [];
    statusMap: { [key: string]: { [key: string]: Status } } = {};

    requestIds = 0;
    requestedIds: string[] = [];

    resolve: ResolveObj = {};
    follow: FollowObj = {};

    additive: AdditiveObj = {};
    substractive: SubstractiveObj = {};
}
