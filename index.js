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
        const minValue = 104;
        const maxValue = 212;
        this.temperatureService = new hap.Service.Thermostat(this.name);
        this.temperatureService.getCharacteristic(hap.Characteristic.CurrentTemperature);
        this.temperatureService.getCharacteristic(hap.Characteristic.TargetTemperature);
        this.temperatureService
            .getCharacteristic(hap.Characteristic.HeatingThresholdTemperature)
            .setProps({ minValue, maxValue });
        this.temperatureService
            .getCharacteristic(hap.Characteristic.On)
            .on("get" /* GET */, (callback) => {
            log.info('Target Temp: ' + this.targetTemp);
            callback(undefined, this.targetTemp);
        })
            .on("set" /* SET */, async (value, callback) => {
            this.targetTemp = value;
            log.info(`Kettle target temperature was set to: ${this.targetTemp}`);
            callback();
        });
        log.info('Switch finished initializing!');
    }
    getServices() {
        return [
            this.informationService,
            this.temperatureService,
            this.switchService,
        ];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerPlatform(PLATFORM_NAME, StaggEkgPlusPlatform);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWV6QixJQUFJLEdBQVEsQ0FBQTtBQUNaLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQTtBQU9sQyxNQUFNLG9CQUFvQjtJQUt4QixZQUFZLEdBQVksRUFBRSxNQUFzQixFQUFFLEdBQVE7UUFDeEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNoQixDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQXVEO1FBQ2pFLFFBQVEsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3pFLENBQUM7Q0FDRjtBQUVELE1BQU0sWUFBWTtJQVVoQixZQUFZLEdBQVEsRUFBRSxHQUFZLEVBQUUsTUFBc0IsRUFBRSxJQUFZO1FBUGhFLGFBQVEsR0FBRyxLQUFLLENBQUE7UUFDaEIsZUFBVSxHQUFHLEdBQUcsQ0FBQTtRQU90QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFBO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFBO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLFVBQVUsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFBO1FBRTdDOztXQUVHO1FBQ0gsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxHQUFHLEdBQUcs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