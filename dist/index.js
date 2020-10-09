"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
const helpers_1 = require("./helpers");
let hap;
const PLATFORM_NAME = 'Stagg EKG+';
/**
 * Platform
 */
class StaggEkgPlusPlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
    }
    accessories(callback) {
        callback([new KettlePlugin(hap, this.log, this.config, PLATFORM_NAME)]);
    }
}
/**
 * Plugin
 */
class KettlePlugin {
    constructor(hap, log, config, name) {
        this.log = log;
        this.name = name;
        const host = config.host || 'localhost';
        const port = config.port || '8080';
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
         * Temperature Service
         */
        this.temperatureService = new hap.Service.Thermostat(this.name);
        // this.temperatureService
        //   .getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
        //   .on(
        //     CharacteristicEventTypes.GET,
        //     async (callback: CharacteristicGetCallback) => {
        //       try {
        //         const { data } = await axios.get(`${BASE_URL}/status`)
        //         log.info('Current State: ' + data.powerState)
        //         callback(
        //           undefined,
        //           hap.Characteristic.TemperatureDisplayUnits.CELSIUS,
        //         )
        //       } catch (err) {
        //         log.error(err)
        //         callback(err)
        //       }
        //     },
        //   )
        // .updateValue(hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT)
        /**
         * (Power) Target Heating Cooling State
         */
        this.temperatureService
            .getCharacteristic(hap.Characteristic.TargetHeatingCoolingState)
            .setProps({
            minValue: 0,
            maxValue: 1,
            validValues: [0, 1],
        })
            .on("get" /* GET */, async (callback) => {
            try {
                const { data } = await axios_1.default.get(`${BASE_URL}/status`);
                log.info('Current State: ' + data.powerState);
                callback(undefined, data.powerState);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        })
            .on("set" /* SET */, async (value, callback) => {
            try {
                await axios_1.default.post(`${BASE_URL}/power`, {
                    targetState: value,
                });
                log.info(`${this.name} power state set to: ${value}`);
                callback();
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        });
        /**
         * Current Temperature
         */
        this.temperatureService
            .getCharacteristic(hap.Characteristic.CurrentTemperature)
            .on("get" /* GET */, async (callback) => {
            try {
                const { data } = await axios_1.default.get(`${BASE_URL}/status`);
                const currentTemp = helpers_1.fahrenheitToCelsius(data.currentTemp);
                log.info('Current Temp: ' + currentTemp);
                callback(undefined, currentTemp);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        });
        /**
         * Target Temperature
         * F Range: 104 - 212
         * C Range: 40 - 100
         */
        const minValue = 40;
        const maxValue = 100;
        this.temperatureService
            .getCharacteristic(hap.Characteristic.TargetTemperature)
            .setProps({
            minValue,
            maxValue,
            minStep: 1,
            format: "int" /* INT */,
            validValueRanges: [minValue, maxValue],
        })
            .on("get" /* GET */, async (callback) => {
            try {
                const { data } = await axios_1.default.get(`${BASE_URL}/status`);
                const targetTemp = helpers_1.fahrenheitToCelsius(data.targetTemp);
                log.info('Target Temp: ' + targetTemp);
                callback(undefined, targetTemp);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        })
            .on("set" /* SET */, async (value, callback) => {
            try {
                const targetTemp = helpers_1.celsiusToFahrenheit(value);
                await axios_1.default.post(`${BASE_URL}/temperature`, {
                    targetTemp,
                });
                log.info(`${this.name} set to: ${targetTemp}`);
                callback();
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        });
        log.info(`${this.name} initialized`);
    }
    getServices() {
        return [this.informationService, this.temperatureService];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerPlatform(PLATFORM_NAME, StaggEkgPlusPlatform);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWN6Qix1Q0FBb0U7QUFFcEUsSUFBSSxHQUFRLENBQUE7QUFDWixNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUE7QUFPbEM7O0dBRUc7QUFFSCxNQUFNLG9CQUFvQjtJQUt4QixZQUFZLEdBQVksRUFBRSxNQUFzQixFQUFFLEdBQVE7UUFDeEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNoQixDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQXVEO1FBQ2pFLFFBQVEsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3pFLENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBRUgsTUFBTSxZQUFZO0lBT2hCLFlBQVksR0FBUSxFQUFFLEdBQVksRUFBRSxNQUFzQixFQUFFLElBQVk7UUFDdEUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtRQUNoQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQTtRQUN2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQTtRQUNsQyxNQUFNLFFBQVEsR0FBRyxVQUFVLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQTtRQUU3Qzs7V0FFRztRQUNILE1BQU0sRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFB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