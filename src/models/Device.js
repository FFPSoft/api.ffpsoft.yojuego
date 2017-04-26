let Validator = require('no-if-validator').Validator;
let NotNullOrUndefinedCondition = require('no-if-validator').NotNullOrUndefinedCondition;
let CustomCondition = require('no-if-validator').CustomCondition;

class Device {
    constructor(deviceId, platform, userId, deviceAudit) {
        let validator = new Validator();
        validator.addCondition(new NotNullOrUndefinedCondition(deviceId).throw(new Error(Device.INVALID_DEVICE_ID)));
        validator.addCondition(new NotNullOrUndefinedCondition(platform).throw(new Error(Device.INVALID_PLATFORM)));
        validator.addCondition(new NotNullOrUndefinedCondition(userId).throw(new Error(Device.INVALID_USERID)));
        validator.addCondition(new CustomCondition(() => {
            return platform && (platform == 'ios' || platform == 'android');
        }).throw(new Error(Device.INVALID_PLATFORM)));

        validator.execute(() => {
            this.deviceId = deviceId;
            this.platform = platform;
            this.userId = userId;
            this.deviceAudit = deviceAudit;
        }, (err) => { throw err; });
    }

    static get INVALID_DEVICE_ID() {
        return 'Devide Id must be defined and can not be null.';
    }

    static get INVALID_PLATFORM() {
        return 'Platform must be defined and can not be null.';
    }

    static get INVALID_USERID() {
        return 'User Id must be defined and can not be null.';
    }
}

module.exports = Device;