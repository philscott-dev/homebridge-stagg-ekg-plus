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
    //private readonly temperatureService: Service
    constructor(hap, log, config, name) {
        this.switchOn = false;
        this.targetTemp = 205;
        this.log = log;
        this.name = name;
        const host = config.host || 'localhost';
        const port = config.port || '80';
        const BASE_URL = `http://${host}:${port}/api`;
        /**
         * Information Service
         */
        const { Manufacturer, Model, SerialNumber, Name } = hap.Characteristic;
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(Manufacturer, 'Fellow')
            .setCharacteristic(Model, 'Stagg EKG+')
            .setCharacteristic(Name, config.name)
            .setCharacteristic(SerialNumber, config.serialNumber || '000000000000000');
        /**
         * Switch Service
         */
        this.switchService = new hap.Service.Switch(config.name);
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
        // this.temperatureService
        //   .getCharacteristic(hap.Characteristic.On)
        //   .on(
        //     CharacteristicEventTypes.GET,
        //     (callback: CharacteristicGetCallback) => {
        //       log.info('Target Temp: ' + this.targetTemp)
        //       callback(undefined, this.targetTemp)
        //     },
        //   )
        //   .on(
        //     CharacteristicEventTypes.SET,
        //     async (
        //       value: CharacteristicValue,
        //       callback: CharacteristicSetCallback,
        //     ) => {
        //       this.targetTemp = value as number
        //       log.info(`Kettle target temperature was set to: ${this.targetTemp}`)
        //       callback()
        //     },
        //   )
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWV6QixJQUFJLEdBQVEsQ0FBQTtBQUNaLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQTtBQU9sQyxNQUFNLG9CQUFvQjtJQUt4QixZQUFZLEdBQVksRUFBRSxNQUFzQixFQUFFLEdBQVE7UUFDeEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNoQixDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQXVEO1FBQ2pFLFFBQVEsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3pFLENBQUM7Q0FDRjtBQUVELE1BQU0sWUFBWTtJQVFoQiw4Q0FBOEM7SUFFOUMsWUFBWSxHQUFRLEVBQUUsR0FBWSxFQUFFLE1BQXNCLEVBQUUsSUFBWTtRQVBoRSxhQUFRLEdBQUcsS0FBSyxDQUFBO1FBQ2hCLGVBQVUsR0FBRyxHQUFHLENBQUE7UUFPdEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtRQUNoQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQTtRQUN2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQTtRQUNoQyxNQUFNLFFBQVEsR0FBRyxVQUFVLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQTtRQUU3Qzs7V0FFRztRQUNILE1BQU0sRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEVB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