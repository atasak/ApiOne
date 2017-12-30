export class ApiIds {
    private characters = ['-', '_'];
    private ids: { [key: string]: boolean } = {
        '00000000': true,
        '00000001': true,
    };

    constructor (private mask: string, initial?: string[]) {
        this.fillCharArray();
        if (initial != null)
            this.registerIds(initial);
    }

    id (): string {
        while (true) {
            let id = '';
            for (const m of this.mask)
                id += this.getIdChar(m);

            if (this.ids[id])
                continue;

            this.ids[id] = true;
            return id;
        }
    }

    private registerIds (ids: string[]) {
        for (const id of ids)
            this.ids[id] = true;
    }

    private fillCharArray () {
        for (let i = 48; i < 58; i++)
            this.characters.push(String.fromCharCode(i));
        for (let i = 65; i < 91; i++)
            this.characters.push(String.fromCharCode(i));
        for (let i = 97; i < 123; i++)
            this.characters.push(String.fromCharCode(i));
    }

    private getIdChar (mask: string) {
        if (mask === '$')
            return this.characters[Math.floor(Math.random() * 64)];
        if (mask === '+')
            return this.characters[Math.floor(Math.random() * 63 + 1)];
        return mask;
    }
}
