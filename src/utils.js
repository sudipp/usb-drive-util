const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const OneKb = 1024;
const OneMb = OneKb * 1024;
const OneGb = OneMb * 1024;
const OneTb = OneGb * 1024;

class Utils
{
    static precisionRound(number, precision) {
        var factor = Math.pow(10, precision);
        return Math.round(number * factor) / factor;
    }
    static getDataTB(dataByte){
        return Utils.precisionRound(dataByte/OneTb,1);
    };
    static getDataGB(dataByte){
        return Utils.precisionRound(dataByte/OneGb,1);
    };
    static getDataMB(dataByte){
        return Utils.precisionRound(dataByte/OneMb,1);
    };
    static getDataKB(dataByte){
        return Utils.precisionRound(dataByte/OneKb,1);
    };

    static getDataBytes(dataByte){
        var asTb = Utils.getDataTB(dataByte);
        var asGb = Utils.getDataGB(dataByte);;
        var asMb = Utils.getDataMB(dataByte);;
        var asKb = Utils.getDataKB(dataByte);;
        var chosenValue = asTb > 1 ? asTb +" TB"
            : asGb > 1 ? asGb +" GB"
            : asMb > 1 ? asMb +" MB"
            : asKb > 1 ? asKb+" KB"
            : dataByte +" B"
        return chosenValue;
    };


    static containsDeep(array, item){
        return _.some(_.map(array, _.partial(_.isEqual, item)))
    };
    static differenceDeep(x, y){
        return _.filter(x, _.partial(_.negate(Utils.containsDeep), y))
    };
    static createDiffOperation(type, element){
        return {
            type: type,
            drive: element
        };
    }
    /*
    # @summary Detect changes regarding drives between different time intervals
    # @function
    # @static
    #
    # @param {Array} - previous drive list
    # @param {Array} - current drive list
    # @returns {Object[]} - current drive list, potential differences with previous one
    #
    # @example - compare(previousDrives, currentDrives)
    */
    static driveDiff(previous, current){
        var additions = Utils.differenceDeep(current, previous);
        var removals = Utils.differenceDeep(previous, current);

        var mappingAdditions = _.map(additions, _.partial(Utils.createDiffOperation, 'add'));
        var mappingRemovals = _.map(removals, _.partial(Utils.createDiffOperation, 'remove'));

        return {
            drives: current,
            diff: _.union(mappingAdditions, mappingRemovals)
        }
    }

    static rmDir(dirPath, removeSelf) {
        if (removeSelf === undefined)
            removeSelf = true;
        try { var files = fs.readdirSync(dirPath); }
        catch(e) { return; }
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = path.join(dirPath, files[i]);
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    rmDir(filePath);
            }
        if (removeSelf)
            fs.rmdirSync(dirPath);
    };
};
module.exports.Utils = Utils;