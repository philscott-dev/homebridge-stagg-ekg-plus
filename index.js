"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
let hap;
const PLATFORM_NAME = 'Stagg EKG+';
class StaggEkgPlusPlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        log.info(`${PLATFORM_NAME} Platform Initialized`);
    }
    accessories(callback) {
        callback([new KettleSwitch(hap, this.log, this.config, PLATFORM_NAME)]);
    }
}
class KettleSwitch {
    // private readonly temperatureService: Service
    constructor(hap, log, config, name) {
        this.switchOn = false;
        this.log = log;
        this.name = name;
        const host = config.host || 'localhost';
        const port = config.port || '80';
        const BASE_URL = `${host}:${port}/api`;
        /**
         * Information Service
         */
        const { Manufacturer, Model, SerialNumber } = hap.Characteristic;
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(Manufacturer, 'Fellow')
            .setCharacteristic(Model, 'Stagg EKG+')
            .setCharacteristic(SerialNumber, config.serialNumber || '000000000000000');
        /**
         * Switch Service
         */
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
                    await axios_1.default.get(`${BASE_URL}/api/power/on`);
                }
                else {
                    await axios_1.default.get(`${BASE_URL}/api/power/off`);
                }
                this.switchOn = on;
                log.info('Switch state was set to: ' + (this.switchOn ? 'ON' : 'OFF'));
                callback();
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        });
        /**
         * Temperature Service
         * F Range: 104 - 212
         * C Range: 40 - 100
         */
        // const minValue = 104
        // const maxValue = 212
        // this.temperatureService = new hap.Service.Thermostat(this.name)
        // this.temperatureService.getCharacteristic(
        //   hap.Characteristic.CurrentTemperature,
        // )
        // this.temperatureService.getCharacteristic(
        //   hap.Characteristic.TargetTemperature,
        // )
        // this.temperatureService
        //   .getCharacteristic(hap.Characteristic.HeatingThresholdTemperature)
        //   .setProps({ minValue, maxValue })
        log.info('Switch finished initializing!');
    }
    getServices() {
        return [
            this.informationService,
            this.switchService,
        ];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerPlatform(PLATFORM_NAME, StaggEkgPlusPlatform);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWV6QixJQUFJLEdBQVEsQ0FBQTtBQUNaLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQTtBQU9sQyxNQUFNLG9CQUFvQjtJQUt4QixZQUFZLEdBQVksRUFBRSxNQUFzQixFQUFFLEdBQVE7UUFDeEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUVkLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLHVCQUF1QixDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUF1RDtRQUNqRSxRQUFRLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN6RSxDQUFDO0NBQ0Y7QUFFRCxNQUFNLFlBQVk7SUFPaEIsK0NBQStDO0lBRS9DLFlBQVksR0FBUSxFQUFFLEdBQVksRUFBRSxNQUFzQixFQUFFLElBQVk7UUFOaEUsYUFBUSxHQUFHLEtBQUssQ0FBQTtRQU90QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFBO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFBO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFBO1FBRXRDOztXQUVHO1FBQ0gsTUFBTSxFQUFFLFlBQVksRUFBRSxL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