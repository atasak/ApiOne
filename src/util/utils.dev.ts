export function stub(useLater: any): void {
    const x = useLater;
    useLater = x;
}