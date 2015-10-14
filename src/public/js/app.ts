/// <reference path="typings.d.ts" />
declare function getIPs(callback: (ip: string) => void): void;

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
        $('#loading').hide();
        creator.show();
        return;
    }
    let cookie = getCookie();
    if (cookie.ip == null || cookie.port == null) {
        $('#loading').hide();
        setting.show(params);
        return;
    }
    let latest = cookie.latest;
    if (latest != null
        && latest.id === params.id
        && latest.tip === params.tip
        && latest.date > Date.now() - 15 * 1000 // 同じチャンネルに再アクセスした時は設定をやり直す
    ) {
        $('#loading').hide();
        setting.show(params);
        return;
    }
    everyTime.show(cookie, params);
}

namespace creator {
    export function show() {
        $('#creator').show();

        $('#creator-streamURL').bind('input', function() {
            let a = /http:\/\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+):([0-9]+)\/stream\/([0-9abcdef]+)/
                .exec($(this).val());
            if (a == null) {
                return;
            }
            let ip = toInt(a[1].split('.').map(x => Number.parseInt(x)));
            if (isGlobalIP(ip)) {
                $('#creator-ip').val(a[1]);
            }
            $('#creator-id').val(a[3]);
            $('#creator-port').val(a[2]);
            updateURL();
        });

        $('#creator-id').bind('input', updateURL);
        $('#creator-ip').bind('input', updateURL);
        $('#creator-port').bind('input', updateURL);

        getIPs((ip: string) => {
            if (isIPv4(ip) && isGlobalIP(toInt(ip.split('.').map(x => Number.parseInt(x))))) {
                $('#creator-ip').val(ip);
                updateURL();
            }
        });
    }

    function updateURL() {
        let url = location.href.replace(/\?.*/, "");
        let id = $('#creator-id').val() || '{チャンネルID}';
        let ip = $('#creator-ip').val() || '{IP}';
        let port = $('#creator-port').val() || '{ポート番号}';
        $('#creator-output').val(`${url}?id=${id}&tip=${ip}:${port}`);
    }

    function isGlobalIP(ip: number) {
        return !(toInt([10, 0, 0, 0]) <= ip && ip <= toInt([10, 255, 255, 255])
            || toInt([127, 0, 0, 0]) <= ip && ip <= toInt([127, 255, 255, 255])
            || toInt([169, 254, 0, 0]) <= ip && ip <= toInt([169, 254, 255, 255])
            || toInt([172, 16, 0, 0]) <= ip && ip <= toInt([172, 31, 255, 255])
            || toInt([192, 168, 0, 0]) <= ip && ip <= toInt([192, 168, 255, 255])
            || toInt([224, 0, 0, 0]) <= ip);
    }

    function isIPv4(ip: string) {
        return ip.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/);
    }

    function toInt(ipArray: number[]) {
        return ipArray[0] * 0x1000000
            + ipArray[1] * 0x10000
            + ipArray[2] * 0x100
            + ipArray[3];
    }
}

namespace setting {
    export function show(params: Channel) {
        $('#setting').show();
        $('#setting-button').click(function() {
            $('#setting-info').show();
            let ip = $('#setting-ip').val();
            let port = Number.parseInt($('#setting-port').val());
            Cookies.set('ip', ip);
            Cookies.set('port', port);
            redirect(ip, port, params.id, params.tip);
        });
    }
}

namespace everyTime {
    export function show(cookie: Cookie, params: Channel) {
        redirect(cookie.ip, cookie.port, params.id, params.tip);
    }
}

function redirect(ip: string, port: number, id: string, tip: string) {
    Cookies.set('latest', JSON.stringify({ id: id, tip: tip, date: Date.now() }));
    let url = `http://${ip}:${port}/pls/${id}?tip=${tip}`;
    $('.link').attr('href', url);
    $('#iframe').attr('src', url);
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
