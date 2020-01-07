// ----------------------get ngrok url
var process = require('child_process');

function sleep(seconds){
  var waitTill = new Date(new Date().getTime() + seconds * 1000);
  while(waitTill > new Date()){}
}

function Promise_url(){
    return new Promise((res, rej) => {
        console.log("process GO~");
        process.exec('curl http://localhost:4040/api/tunnels', (err, stdout, stderr) => {
            if (err) {
              console.log("ngrok err = " + err);
              rej(err);
            } else {
                var jsonContent = JSON.parse(stdout);
                var url = jsonContent['tunnels'][0].public_url;
                console.log("ngrok url = " + url);
                res(url);
            }
        });
    }); 
} 


async function override_url(callback){
    var url = undefined;
    var times = 0;
    while (times < 3) {
        console.log(times);
        console.log(url);
        url = await Promise_url();
        if (url) {
            break;
        }
        times = times + 1;
        sleep(3);
    }
    if (url.replace) {
        url = url.replace('http://', '');
        url = url.replace('https://', '');
    }
    console.log('ngrok url = ' + url);
    callback(url);
}

function get_url(callback){
    override_url(callback);
}

module.exports = get_url;