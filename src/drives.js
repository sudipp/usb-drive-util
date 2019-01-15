const drivelist = require('drivelist');
const diskspace = require('diskspace');
const usb = require('usb'); 
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const fs = require('fs');
const utils = require('../src/utils').Utils;

const privateMethods = {
    ListUSBDrives(){
        return new Promise(function(resolve, reject) {
            drivelist.list( (error, drives) => {
                if (error) {
                    reject(error);
                }
                var usbDrives = _.filter(drives, function(o) { return o.isUSB; });
                resolve(usbDrives);
            });
        });
    }
}


exports.Drives = class Drives extends EventEmitter{
    constructor() {
        super();

        //hooking and emitting to usb drive add/remove events
        var _this = this;
        
        usb.on('attach', function(device) {
            console.log('usbadd', device); 
            _this.emit('usbadd', device);
        });
        usb.on('detach', function(device) {
            console.log('usbremove', device); 
            _this.emit('usbremove', device);
        });
    };

    static isUSBDriveAvailable(){
        return privateMethods.ListUSBDrives().then(function(result) {
            return (result!=undefined && result.length > 0);
        }, function(error) {
            throw error;
        });
    };
    static GetDriveSpace(driveLetter){
        return new Promise(function(resolve, reject) {
            diskspace.check(driveLetter, (error, result) =>{
                if (error) {
                    reject(error); //throw error;
                }
                result.driveLetter = driveLetter;
                resolve(result);
            });
        });
    }
    static ListSystemDrives(){
        return new Promise(function(resolve, reject) {
            drivelist.list( (error, drives) => {
                if (error) {
                    reject(error); //throw error;
                }
                var usbDrives = _.filter(drives, function(o) { return o.isSystem; });
                resolve(usbDrives);
            });
        });
    };

    //Returns USB drive details with drive spaces
    static loadUSBDriveDetails(){
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                privateMethods.ListUSBDrives().then(function(result) {
                    var availableUSBDrives = [];
                    _.forEach(result, function (usbdrive) {
                        availableUSBDrives.push(usbdrive);
                    });
                    return availableUSBDrives;
                }).then(function(usbdrives) {

                    var promisesDrvSpace = [];
                    _.forEach(usbdrives, function (usbdrive) 
                    {
                        var drvPath = usbdrive.mountpoints[0].path;
                        promisesDrvSpace.push(Drives.GetDriveSpace(drvPath));
                    });
                    return promisesDrvSpace;
                }).then(function(promisesDrvSpace){

                    let drivesStats = [];
                    Promise.all(promisesDrvSpace).then(result => {

                        _.forEach(result, function (usbdriveStat) 
                        {
                            drivesStats.push({
                                driveLetter : usbdriveStat.driveLetter,
                                status: usbdriveStat.status,
                                totalSpace : usbdriveStat.total,
                                usedSpace : usbdriveStat.used,
                                freeSpace : usbdriveStat.free,
                                totalSpaceText : utils.getDataBytes(usbdriveStat.total),
                                usedSpaceText : utils.getDataBytes(usbdriveStat.used),
                                freeSpaceText : utils.getDataBytes(usbdriveStat.free)
                            });
                        });
                        resolve(drivesStats);

                    }).catch(function(err) {
                        reject(err);
                    });
                }).catch(function(err) {
                    reject(err);
                });
            },1000);
        });
    };

    static IsUSBEmpty(driveLetter){
        try {
            var stat =fs.statSync(driveLetter);
            if (stat.isDirectory()) {
                var items= fs.readdirSync(driveLetter);
                if(items.length == 1 && items[0] =="System Volume Information")
                    return true; 

                return (items && items.length == 0);
            }
            return false;
        } catch (e) {
            if (e.code === 'ENOENT') { 
                return true;
            }
        }
        return false;
    }
};