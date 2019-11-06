
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const fs = require("fs")
const request = require("request");
const processName = 'daemon.js';
const ssCountCmd = "netstat -anp |grep 'ESTABLISHED' |grep 'ss-server' |grep 'tcp' |awk '{print $5}' |awk -F \":\" '{print $1}' |sort -u |wc -l";
const ssIPCmd = "netstat -anp |grep 'ESTABLISHED' |grep 'ss-server' |grep 'tcp4' |awk '{print $5}' |awk -F \":\" '{print $1}' |sort -u";
const selfIp = "103.135.250.219";
const vpsTitle = "CN-HK-S"

function main() {
    console.log("say hello");
    const cmd = `ps aux | grep ${processName} | grep -v grep`;
    setInterval(() => {
        let stats = fs.statSync('/root/nohup.out');
        console.log(`log file size ${stats.size} bytes`);
        if (stats.size > 1024 * 1024 * 100) {
            fs.truncate('/root/nohup.out', 0, function () { console.log('truncate done') })
            console.log(`log file reset`);
        }
        exec(cmd, function (error, stdout, stderr) {
            if (stdout) {
                console.log(stdout);
                console.log('timestamp:' + new Date().getTime());
            } else {
                console.log('timestamp:' + new Date().getTime());
                console.log('daemon process death restart');
                startDaemonJs();
            }
            if (!error) {
                // success
            }
            if (error) {
                console.info('stderr : ' + stderr);
            }
        })
    }, 1000 * 10);

    setInterval(() => {
        exec(ssCountCmd, function (error, stdout, stderr) {
            if (stdout) {
                console.log("ss count:" + stdout);
            }
            if (!error) {
                // success
                request.get("https://kerr1gan.github.io/galaxy/scripts/config.json", function (error, response, body) {
                    console.log(response.statusCode) // 200
                    console.log(body);
                    let config = JSON.parse(body);
                    let vpsInfo = {
                        title: vpsTitle,
                        ip: selfIp,
                        ssCount: parseInt(stdout),
                        ssIpMsg: ""
                    }
                    let options = {
                        url: `${config.url}/api/updateVpsInfo`,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(vpsInfo)
                    };
                    request.put(options, function (error, response, body) {
                        // console.info('response:' + JSON.stringify(response));
                        // console.info("statusCode:" + response.statusCode)
                        // console.log('body: ' + body );
                    });
                });
            }
            if (error) {
                console.info('stderr : ' + stderr);
            }
        });
    }, 1000 * 10);
}

function startDaemonJs() {
    let child = spawn(`node`, [processName]);
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
        console.log('\n');
    });
    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
        console.log('\n');
    });
    child.on('close', function (code) {
        console.log('子进程已退出，退出码 ' + code);
    });
}

main();
