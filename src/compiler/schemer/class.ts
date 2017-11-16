import {Property} from './schemer';

export class Class {
    id: number;
    name: string;
    fullName: string;
    properties: { [key: string]: Property };
}
