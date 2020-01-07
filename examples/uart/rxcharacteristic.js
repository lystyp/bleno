var util = require('util');

var bleno = require('../..');

var BlenoCharacteristic = bleno.Characteristic;

var RxCharacteristic = function() {
  RxCharacteristic.super_.call(this, {
    uuid: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
    properties: ['read', 'write'],
    value: null
  });

  this._value = new Buffer(0);
  this._updateValueCallback = null;
  this._socket = null;
};

util.inherits(RxCharacteristic, BlenoCharacteristic);

RxCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('RxCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};

RxCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('RxCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));
  console.log('RxCharacteristic - onWriteRequest: original value = ' + this._value.toString());
  if (this._socket) {
    this._socket.emit('rx', this._value.toString());
  }
  callback(this.RESULT_SUCCESS);
};

RxCharacteristic.prototype.setSocket = function(socket) {
  this._socket = socket;
};

module.exports = RxCharacteristic;
