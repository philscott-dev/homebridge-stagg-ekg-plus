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
            .getCharacteristic(hap.Characteristic.TargetHeaterCoolerState)
            .setProps({
            maxValue: hap.Characteristic.TargetHeaterCoolerState.HEAT,
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
         * Current Temp
         */
        this.temperatureService
            .getCharacteristic(hap.Characteristic.CurrentTemperature)
            .on("get" /* GET */, async (callback) => {
            try {
                const { data } = await axios_1.default.get(`${BASE_URL}/status`);
                const isOff = data.currentTemp === '32' || data.currentTemp === 32;
                log.info('Current Temp: ' + isOff ? 'Off' : data.currentTemp);
                callback(undefined, isOff ? 0 : data.currentTemp);
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
            .setProps({ minValue, maxValue })
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