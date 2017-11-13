export class ApiIds {
    characters = ['-', '_'];
    ids: { [key: string]: boolean } = {};

    constructor() {
        for (let i = 48; i < 58; i++)
            this.characters.push(String.fromCharCode(i));
        for (let i = 65; i < 91; i++)
            this.characters.push(String.fromCharCode(i));
        for (let i = 97; i < 123; i++)
            this.characters.push(String.fromCharCode(i));
        this.register('00000000');
    }

    id(): string {
        while (true) {
            let id = '';
            for (let i = 0; i < 8; i++)
                id += this.characters[Math.floor(Math.random() * 64)];
            if (!this.ids[id]) {
                this.ids[id] = true;
                return id;
            }
            console.log('Whoa, almost a duplicate id! :)');
        }
    }

    register(ids: string | string[]): boolean {
        if (typeof ids === 'string')
            ids = [ids];
        let good = true;
        for (const id of ids) {
            if (this.ids[id])
                good = false;
            this.ids[id] = true;
        }
        return good;
    }

    registerAll(ids: string) {
        const idBase: string[] = [];
        let wild = -1;
        for (let i = 0; i < 8; i++) {
            if (ids[i] === '*')
                wild = i;
            idBase.push(ids[i]);
        }
        if (wild === -1)
            return this.register(idBase.join(''));
        for (const char of this.characters) {
            idBase[wild] = char;
            this.registerAll(idBase.join(''));
        }
    }
}
