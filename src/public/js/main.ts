/// <reference path="typings.d.ts" />

function main() {
    let params = parse(document.location.search);
    location.href = `http://127.0.0.1:7144/pls/${params.get('id') }?tip=${params.get('tip') }`;
}

function parse(search: string) {
    let params = new Map<string, string>();
    search.slice(1)
        .split('&')
        .map(x => x.split('='))
        .forEach(x => {
            params.set(decodeURIComponent(x[0]), decodeURIComponent(x[1]));
        });
    return params;
}

main();
