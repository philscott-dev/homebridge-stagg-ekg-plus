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
        const BASE_URL = `http://${host}:${port}/api`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWV6QixJQUFJLEdBQVEsQ0FBQTtBQUNaLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQTtBQU9sQyxNQUFNLG9CQUFvQjtJQUt4QixZQUFZLEdBQVksRUFBRSxNQUFzQixFQUFFLEdBQVE7UUFDeEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNoQixDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQXVEO1FBQ2pFLFFBQVEsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3pFLENBQUM7Q0FDRjtBQUVELE1BQU0sWUFBWTtJQU9oQiwrQ0FBK0M7SUFFL0MsWUFBWSxHQUFRLEVBQUUsR0FBWSxFQUFFLE1BQXNCLEVBQUUsSUFBWTtRQU5oRSxhQUFRLEdBQUcsS0FBSyxDQUFBO1FBT3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7UUFDaEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxXQUFXLENBQUE7UUFDdkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUE7UUFDaEMsTUFBTSxRQUFRLEdBQUcsVUFBVSxJQUFJLElBQUksSUFBSSxNQUFNLENBQUE7UUFFN0M7O1dBRUc7UUFDSCxNQUFNLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFBO1FBQ2hFLElB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