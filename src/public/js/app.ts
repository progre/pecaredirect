/// <reference path="typings.d.ts" />

interface Channel {
    id: string;
    tip: string;
}

interface Cookie {
    ip: string;
    port: number;
    latest: Latest;
}

interface Latest extends Channel {
    date: number
}

function main() {
    let params = <Channel>parse(document.location.search);
    if (params.id == null || params.tip == null) {
        creator();
        return;
    }
    let cookie = getCookie();
    if (cookie.ip == null || cookie.port == null) {
        setting(params);
        return;
    }
    let latest = cookie.latest;
    if (latest != null
        && latest.id === params.id
        && latest.tip === params.tip
        && latest.date > Date.now() - 15 * 1000 // 同じチャンネルに再アクセスした時は設定をやり直す
        ) {
        setting(params);
        return;
    }
    everyTime(cookie, params);
}

function creator() {
    $('#loading').hide();
    $('#creator').show();
}

function setting(params: Channel) {
    $('#loading').hide();
    $('#setting').show();
    $('#button').click(function() {
        let ip = $('#ip').val();
        let port = Number.parseInt($('#port').val());
        Cookies.set('ip', ip);
        Cookies.set('port', port);
        redirect(ip, port, params.id, params.tip);
    });
}

function everyTime(cookie: Cookie, params: Channel) {
    redirect(cookie.ip, cookie.port, params.id, params.tip);
}

function redirect(ip: string, port: number, id: string, tip: string) {
    Cookies.set('latest', JSON.stringify({ id: id, tip: tip, date: Date.now() }));
    location.href = `http://${ip}:${port}/pls/${id}?tip=${tip}`;
}

function parse(search: string) {
    let params: any = {};
    search.slice(1)
        .split('&')
        .map(x => x.split('='))
        .forEach(x => {
            params[decodeURIComponent(x[0])] = decodeURIComponent(x[1]);
        });
    return params;
}

function getCookie() {
    return <Cookie>{
        ip: Cookies.get('ip'),
        port: Number.parseInt(Cookies.get('port')),
        latest: parseLatest(Cookies.get('latest'))
    };
}

function parseLatest(latest: string) {
    try {
        return <Latest>JSON.parse(latest);
    } catch (e) {
        return null;
    }
}

main();
