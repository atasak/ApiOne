export type Status = 100 | 400 | 403 | 404 | 500;
export const statusText = {
    100: 'OK',
    400: 'Bad request',
    403: 'Forbidden',
    404: 'Not found',
    500: 'Network Error',
};

export class Package {
    oneInterfaceVersion: string;
    oneImplementationVersion: string;
    appInterfaceVersion: string;
    appImplementationVersion: string;

    trace: string[] = [];
    status: Status[] = [];
    statusMap: { [key: string]: { [key: string]: Status } } = {};

    resolve: { [key: string]: string[] } = {};
    follow: { [key: string]: string[] } = {};

    additive: { [key: string]: { [key: string]: any } };
    substractive: { [key: string]: string[] } = {};

    toJson (): string {
        return JSON.stringify(this);
    }
}
