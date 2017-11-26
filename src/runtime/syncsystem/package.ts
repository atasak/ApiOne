export type Status = 100 | 400 | 403 | 404 | 500;
export const statusText = {
    100: 'OK',
    400: 'Bad request',
    403: 'Forbidden',
    404: 'Not found',
    500: 'Error'
};

export class Package {
    trace: string[];
    status: Status[];
    statusMap: {[key: number]: string[]};

    resolve: string[];

    additive: { [key: string]: any[] };
    substractive: { [key: string]: string[] };
}
