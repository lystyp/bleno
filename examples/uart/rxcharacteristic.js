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

  this._status = 0; // 0:default, 1:wait pkg
  this._pkgNum = 0;
};

util.inherits(RxCharacteristic, BlenoCharacteristic);

RxCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log('RxCharacteristic - onReadRequest: value = ' + this._value.toString('hex'));

  callback(this.RESULT_SUCCESS, this._value);
};

RxCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  this._value = data;

  console.log('RxCharacteristic - onWriteRequest: length = ' + this._value.length.toString());
  console.log('RxCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));
  console.log('RxCharacteristic - onWriteRequest: original value = ' + this._value.toString());
  this.getRequest(this._value);


  if (this._socket) {
    var byteResult = "0x "
    for(var i = 0; i < this._value.length; i++) {
      var s = this._value[i].toString(16);
      if (s.length < 2) {
        s = "0" + s;
      }
      byteResult = byteResult + s + " ";
    }
    this._socket.emit('rx', byteResult);
  }
  callback(this.RESULT_SUCCESS);
};

RxCharacteristic.prototype.setSocket = function(socket) {
  this._socket = socket;
};

RxCharacteristic.prototype.setUpdateValueCallback = function(updateValueCallback) {
  this._updateValueCallback = updateValueCallback;
  console.log('RxCharacteristic - setUpdateValueCallback success');
};


RxCharacteristic.prototype.getRequest = function(arr) {
  if (arr.length == 4) {
    if (arr[0] == 0x31 && arr[1] == 0x10) {
      console.log('RxCharacteristic - get download request.');
      this._status = 1;
      this._pkgNum = arr[2] * 256 + arr[3];
      this._updateValueCallback([0x32, 0x20, 0x00, 0x00]);
    } 
  } else if (this._status == 1) {
    if (arr.length < 6) {
      console.log('RxCharacteristic error - pkg.length is too short.');
      this._updateValueCallback([0x32, 0x20, 0x00, 0x01]);
      this._status = 0;
      this._pkgNum = 0;
      return;
    } 

    if (arr[0] != 0x31 || arr[1] != 0x12) {
      console.log('RxCharacteristic error - prefix is not correct.');
      this._updateValueCallback([0x32, 0x20, 0x00, 0x01]);
      this._status = 0;
      this._pkgNum = 0;
      return;
    }

    var length = arr[4] * 256 + arr[5];
    var chunk = arr[2] * 256 + arr[3];
    if (arr.length != (length + 6)) {
      console.log('RxCharacteristic error - prefix is not matched with pkg.length.');
      this._updateValueCallback([0x32, 0x20, 0x00, 0x01]);
      this._status = 0;
      this._pkgNum = 0;
      return;
    }

    if (chunk == this._pkgNum) {
      console.log('RxCharacteristic - get all pkgs.');
      this._updateValueCallback([0x32, 0x20, 0x00, 0x00]);
      this._status = 0;
      this._pkgNum = 0;
      return;
    }
  }

  if (arr[0] == 0x31 && arr[1] == 0x11 && arr[2] == 0x01) {
    console.log('RxCharacteristic - get cancel request.');
    this._status = 0;
    this._pkgNum = 0;
    this._updateValueCallback([0x32, 0x20, 0x00, 0x00]);
  }


}

module.exports = RxCharacteristic;
