"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
// enum PowerState {
//   Off,
//   On,
// }
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
        // this.switchService = new hap.Service.Switch(config.name)
        // this.switchService
        //   .getCharacteristic(hap.Characteristic.On)
        //   .on(
        //     CharacteristicEventTypes.GET,
        //     async (callback: CharacteristicGetCallback) => {
        //       try {
        //         const { data } = await axios.get(`${BASE_URL}/status`)
        //         log.info(
        //           `${this.name} is powered: ${data.powerState ? 'ON' : 'OFF'}`,
        //         )
        //         callback(undefined, data.powerState)
        //       } catch (err) {
        //         log.error(err)
        //         callback(err)
        //       }
        //     },
        //   )
        //   .on(
        //     CharacteristicEventTypes.SET,
        //     async (
        //       on: CharacteristicValue,
        //       callback: CharacteristicSetCallback,
        //     ) => {
        //       try {
        //         const powerState = on ? PowerState.On : PowerState.Off
        //         await axios.post(`${BASE_URL}/power`, { targetState: powerState })
        //         log.info(`${this.name} is powered: ${powerState ? 'ON' : 'OFF'}`)
        //         callback()
        //       } catch (err) {
        //         log.error(err)
        //         callback(err)
        //       }
        //     },
        //   )
        /**
         * Temperature Service
         */
        this.temperatureService = new hap.Service.Thermostat(this.name);
        /**
         * Threshold
         * F Range: 104 - 212
         * C Range: 40 - 100
         */
        const minValue = 104;
        const maxValue = 212;
        // this.temperatureService
        //   .getCharacteristic(hap.Characteristic.HeatingThresholdTemperature)
        //   .setProps({ minValue, maxValue })
        /**
         * Power State
         */
        this.temperatureService
            .getCharacteristic(hap.Characteristic.TargetHeatingCoolingState)
            .setProps({
            maxValue: hap.Characteristic.TargetHeatingCoolingState.HEAT,
            validValues: [
                hap.Characteristic.TargetHeatingCoolingState.OFF,
                hap.Characteristic.TargetHeatingCoolingState.HEAT,
            ],
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
         * Current Temp
         */
        this.temperatureService
            .getCharacteristic(hap.Characteristic.CurrentTemperature)
            .on("get" /* GET */, async (callback) => {
            try {
                const { data } = await axios_1.default.get(`${BASE_URL}/status`);
                const isOff = data.currentTemp === '32' || data.currentTemp === 32;
                const temperature = isOff ? '0' : data.currentTemp;
                log.info('Current Temp: ' + temperature);
                callback(undefined, temperature);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        });
        /**
         * Target Temp
         */
        this.temperatureService
            .getCharacteristic(hap.Characteristic.TargetTemperature)
            .setProps({ minValue, maxValue, minStep: 1 })
            .on("get" /* GET */, async (callback) => {
            try {
                const { data } = await axios_1.default.get(`${BASE_URL}/status`);
                log.info('Target Temp: ' + data.targetTemp);
                callback(undefined, data.targetTemp);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        })
            .on("set" /* SET */, async (value, callback) => {
            try {
                await axios_1.default.post(`${BASE_URL}/temperature`, {
                    targetTemp: value,
                });
                log.info(`${this.name} set to: ${value}`);
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
        return [
            this.informationService,
            //this.switchService,
            this.temperatureService,
        ];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerPlatform(PLATFORM_NAME, StaggEkgPlusPlatform);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWV6QixvQkFBb0I7QUFDcEIsU0FBUztBQUNULFFBQVE7QUFDUixJQUFJO0FBRUosSUFBSSxHQUFRLENBQUE7QUFDWixNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUE7QUFPbEMsTUFBTSxvQkFBb0I7SUFLeEIsWUFBWSxHQUFZLEVBQUUsTUFBc0IsRUFBRSxHQUFRO1FBQ3hELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDaEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUF1RDtRQUNqRSxRQUFRLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN6RSxDQUFDO0NBQ0Y7QUFFRCxNQUFNLFlBQVk7SUFTaEIsWUFBWSxHQUFRLEVBQUUsR0FBWSxFQUFFLE1BQXNCLEVBQUUsSUFBWTtRQUN0RSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFBO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFBO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLFVBQVUsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFBO1FBRTdDOztXQUVHO1FBQ0gsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxjQUFj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