var util = require('util');

var bleno = require('../..');

var BlenoCharacteristic = bleno.Characteristic;

function str2byte(data) {
  var byteArr = [];
  if (data.substring(0, 2) == "0x") {
    
    for (i = 2; i < data.length; i = i + 2){
      byteArr.push(parseInt(data.substring(i, i + 2), 16));
    }
  }
  return Buffer.from(byteArr);
}

var TxCharacteristic = function(rx) {
  TxCharacteristic.super_.call(this, {
    uuid: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
    properties: ['notify'],
    value: null
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
  this._rx = rx;
};

util.inherits(TxCharacteristic, BlenoCharacteristic);

TxCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('TxCharacteristic - onSubscribe, maxValueSize = ' + maxValueSize);

  this._updateValueCallback = updateValueCallback;
  this._rx.setUpdateValueCallback(updateValueCallback);
};

TxCharacteristic.prototype.onUnsubscribe = function() {
  console.log('TxCharacteristic - onUnsubscribe!!!!!!!!!!!!!!!');

  this._updateValueCallback = null;
};

TxCharacteristic.prototype.onNotify  = function() {
  console.log('TxCharacteristic - onNotify');
};

TxCharacteristic.prototype.setSocket = function(socket) {
  socket.on("tx", function(data){
    console.log('Socket tx : ' + data);
    if (data.substring(0, 2) == "0x") {
      this._updateValueCallback(str2byte(data));
    } else {
      this._updateValueCallback(Buffer.from(data));
    }
  }.bind(this));
};

module.exports = TxCharacteristic;
