export function stub (...useLater: any[]): void {
    let x;
    for (const u of useLater)
        x = u;

    console.log('A parameter has been stubbed!!!');
    return x;
}
