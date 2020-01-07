var bleno = require('../..');

var BlenoPrimaryService = bleno.PrimaryService;

var TxCharacteristic = require('./txcharacteristic');
var RxCharacteristic = require('./rxcharacteristic');
var socket = null;

var rx = new RxCharacteristic();
var tx = new TxCharacteristic();

console.log('bleno - echo');

bleno.on('stateChange', function(state) {
  console.log('stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('raspberry_uart', ['6e400001b5a3f393e0A9e50e24dcca9e']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
        characteristics: [
          rx, 
          tx
        ]
      })
    ]);
  }
});


// ------------- Server
var http = require('http');
var url = require('url');
var fs = require('fs');

// 加入socket的library
var io = require('socket.io'); // 加入 Socket.IO

var server = http.createServer(function(request, response){
    console.log('Connection');
    var path = url.parse(request.url).pathname;
    switch (path) {
        case '/':
            fs.readFile(__dirname + "/index.html", function(error, data) {
                if (error){
                    response.writeHead(404);
                    response.write("opps this doesn't exist - 404");
                } else {
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(data, "utf8");
                }
                response.end();
            });
            break;
    }
});

server.listen(8000);
console.log("Server is created.")

var serv_io = io.listen(server);
serv_io.sockets.on('connection', function(socket) {
    console.log("Socket get connection : " + socket.client.id)
    rx.setSocket(serv_io.sockets);
    tx.setSocket(socket);
});