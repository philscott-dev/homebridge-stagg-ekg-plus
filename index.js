"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
let hap;
const BASE_URL = 'http://192.168.1.18:8080/api';
const PLATFORM_NAME = 'Stagg EKG+';
const ACCESSORY_NAME = 'EKG+';
class StaggEkgPlusPlatform {
    constructor(log) {
        this.log = log;
        // probably parse config or something here
        log.info(`${PLATFORM_NAME} Platform Initialized`);
    }
    accessories(callback) {
        callback([new ExampleSwitch(hap, this.log, ACCESSORY_NAME)]);
    }
}
class ExampleSwitch {
    constructor(hap, log, name) {
        this.switchOn = false;
        this.log = log;
        this.name = name;
        this.switchService = new hap.Service.Switch(this.name);
        this.switchService
            .getCharacteristic(hap.Characteristic.On)
            .on("get" /* GET */, (callback) => {
            log.info('Current state of the switch was returned: ' +
                (this.switchOn ? 'ON' : 'OFF'));
            callback(undefined, this.switchOn);
        })
            .on("set" /* SET */, async (on, callback) => {
            try {
                if (on) {
                    await axios_1.default.get(`${BASE_URL}/power/on`);
                }
                else {
                    await axios_1.default.get(`${BASE_URL}/power/off`);
                }
                this.switchOn = on;
                log.info('Switch state was set to: ' + (this.switchOn ? 'ON' : 'OFF'));
                callback();
            }
            catch (err) {
                log.error(err);
            }
        });
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'Fellow')
            .setCharacteristic(hap.Characteristic.Model, 'Stagg EKG+');
        log.info('Switch finished initializing!');
    }
    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify() {
        this.log('Identify!');
    }
    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices() {
        return [this.informationService, this.switchService];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerPlatform(PLATFORM_NAME, StaggEkgPlusPlatform);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWN6QixJQUFJLEdBQVEsQ0FBQTtBQUVaLE1BQU0sUUFBUSxHQUFHLDhCQUE4QixDQUFBO0FBQy9DLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQTtBQUNsQyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUE7QUFPN0IsTUFBTSxvQkFBb0I7SUFHeEIsWUFBWSxHQUFZO1FBQ3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBRWQsMENBQTBDO1FBRTFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLHVCQUF1QixDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUF1RDtRQUNqRSxRQUFRLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDOUQsQ0FBQztDQUNGO0FBRUQsTUFBTSxhQUFhO0lBUWpCLFlBQVksR0FBUSxFQUFFLEdBQVksRUFBRSxJQUFZO1FBTHhDLGFBQVEsR0FBRyxLQUFLLENBQUE7UUFNdEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtRQUVoQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3RELElBQUksQ0FBQyxhQUFhO2FBQ2YsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7YUFDeEMsRUFBRSxrQkFFRCxDQUFDLFFBQW1DLEVBQUUsRUFBRTtZQUN0QyxHQUFHLENBQUMsSUFBSSxDQUNOLDRDQUE0QztnQkFDMUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUNqQyxDQUFBO1lBQ0QsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDcEMsQ0FBQyxDQUNGO2FBQ0EsRUFBRSxrQkFFRCxLQUFLLEVBQ0gsRUFBdUIsRUFDdkIsUUFBbUMsRUFDbkMsRUFBRTtZQUNGLElBQUk7Z0JBQ0YsSUFBSSxFQUFFLEVBQUU7b0JBQ04sTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxXQUFXLENBQUMsQ0FBQTtpQkFDeEM7cUJBQU07b0JBQ0wsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxZQUFZLENBQUMsQ0FBQTtpQkFDekM7Z0JBRUQsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFhLENBQUE7Z0JBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQ04sMkJBQTJCLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUM3RCxDQUFBO2dCQUNELFFBQVEsRUFBRSxDQUFBO2FBQ1g7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2Y7UUFDSCxDQUFDLENBQ0YsQ0FBQTtRQUVILElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUU7YUFDN0QsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDO2FBQzVELGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFBO1FBRTVELEdBQUcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQTtJQUMzQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsUUFBUTtRQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDdkIsQ0FBQztJQUVEOzs7T0FHRztJQUNILFdBQVc7UUFDVCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUN0RCxDQUFDO0NBQ0Y7QUE1RkQsaUJBQVMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtJQUNwQixHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQTtJQUNiLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtBQUMzRCxDQUFDLENBQUEifQ==