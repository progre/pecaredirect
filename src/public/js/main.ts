/// <reference path="typings.d.ts" />

function main() {
    $('#loading').hide();
    let params = parse(document.location.search);
    if (params['id'] == null || params['tip'] == null) {
        Cookies.remove('ip');
        Cookies.remove('port');
        $('#clear').show();
        return;
    }
    let ip = Cookies.get('ip');
    let port = Cookies.get('port');
    if (ip == null || port == null) {
        firstTime(params);
    } else {
        everyTime(ip, port, params);
    }
}

function firstTime(params: any) {
    $('#firsttime').show();
    $('#button').click(function() {
        let ip = $('#ip').val();
        let port = $('#port').val();
        Cookies.set('ip', ip);
        Cookies.set('port', port);
        redirect(ip, port, params);
    });
}

function everyTime(ip: string, port: string, params: any) {
    $('#everytime').show();
    redirect(ip, port, params);
}

function redirect(ip: string, port: string, params: any) {
    location.href = `http://${ip}:${port}/pls/${params['id']}?tip=${params['tip']}`;
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

main();
