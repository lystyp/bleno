var util = require('util');

var bleno = require('../..');

var BlenoCharacteristic = bleno.Characteristic;

var TxCharacteristic = function() {
  TxCharacteristic.super_.call(this, {
    uuid: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
    properties: ['notify'],
    value: null
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

util.inherits(TxCharacteristic, BlenoCharacteristic);

TxCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('TxCharacteristic - onSubscribe, maxValueSize = ' + maxValueSize);

  this._updateValueCallback = updateValueCallback;
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

    this._updateValueCallback(Buffer.from(data));
  }.bind(this));
};

module.exports = TxCharacteristic;
