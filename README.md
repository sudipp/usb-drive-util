# usb-drive-util
USB drive utility for NodeJs, lists all usb drives attached, fires events when an USB attached and removed from system. Uses drivelist, usb, diskspace modules

### API ###
1) GetDriveSpace(driveletter) - returns drive space info (total, used, free)
2) ListSystemDrives - returns all system drives
3) loadUSBDriveDetails - returns all USB drives attached to system
4) IsUSBEmpty(driveletter) - return true if the drive is empty

### Events ###
1) usbadd - Fired when an USB drive is attached to system
2) usbremove - Fired when an USB drive is removed from system

### Usage ###
```
const drives = require('../src/drives').Drives;

function loadUSBDrvList(){
    drives.loadUSBDriveDetails().then(function(result){

        if(result && result.length== 0){
            console.log('No USB drive found in the system');
            return;
        }

        console.log('Loading USB drive(s) details');
        _.forEach(result, function (driveStats){
            console.log(driveStats);
        })

    }).catch(function(err) {
        console.log(err.message);
    });
}

loadUSBDrvList();

let drv = new drives();
//Track events when drive is attached and removed
drv.on("usbadd",(device)=>{
    console.log('An USB drive is attached to system');
    setTimeout(function() {
        loadUSBDrvList();
    }, 1000);    
})
.on("usbremove", (device)=>{
    console.log('drive removed');
});
