require('xterm/dist/xterm.css');
const queryString = require('query-string');
const Terminal = require('xterm');
Terminal.loadAddon('fit');

var term = null;
var ws = null;
var alive = null;
var connected = false;

function init() {
    term = new Terminal();
    term.open(document.getElementById('terminal'), { focus: true });
    term.fit();

    term.write('\033[1;3;31minit...\033[0m');

    term.on('data', function(data) {
        if (ws && ws.readyState === 1) {
            ws.send("0" + utf8_to_b64(data));
        }
    });
}

function connect() {
    const params = queryString.parse(location.search);
    if(!params['user']) {
        term.write('\r\n\033[1;3;31mError: user not specified\033[0m');
        return;
    }
    if(!params['pod']) {
        term.write('\r\n\033[1;3;31mError: pod not specified\033[0m');
        return;
    }
    if(!params['container']) {
        term.write('\r\n\033[1;3;31mError: container not specified\033[0m');
        return;
    }
    let url = '/proxy/users/' + params['user'] + '/pods/' + params['pod'] + '/containers/' + params['container'] + '/shell';
    term.write('\r\n\033[1;3;31mconnect...\033[0m');
    if (window.location.protocol === "http:") {
        url = "ws://" + window.location.host + url;
    } else {
        url = "wss://" + window.location.host + url;
    }
    ws = new WebSocket(url, 'base64.channel.k8s.io');
    ws.onopen = function(event) {
        connected = true;
        alive = setInterval(function() {
            ws.send("0");
        }, 30 * 1000);
        term.reset();
    };
    ws.onclose = function(event) {
        connected = false;
        clearInterval(alive);
        alive = null;
        term.reset();
        term.write('\r\n\033[1;3;31mconnection closed\033[0m');
        term.write('\x1b[31m' + event.reason + '\x1b[m\r\n');
        setTimeout(function() {
            window.close();
        }, 5000);
    };
    ws.onmessage = function(event) {
        var data = event.data.slice(1);
        switch(event.data[0]) {
            case '1':
            case '2':
            case '3':
                term.write(b64_to_utf8(data));
                break;
        }
    };
}

function utf8_to_b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(atob(str)));
}

init();
connect();

window.onbeforeunload = function(e) {
    if(connected) {
        var confirmationMessage = 'It seems you didn\'t disconnect from remote shell. '
                                + 'If you leave before exit, the remote shell won\'t be closed.';
        return confirmationMessage;
    }
};
