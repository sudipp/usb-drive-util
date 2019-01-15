
const _ = require('lodash');
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