"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
var PowerState;
(function (PowerState) {
    PowerState[PowerState["Off"] = 0] = "Off";
    PowerState[PowerState["On"] = 1] = "On";
})(PowerState || (PowerState = {}));
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
            .on("get" /* GET */, async (callback) => {
            try {
                const { data } = await axios_1.default.get(`${BASE_URL}/status`);
                log.info(`${this.name} is powered: ${data.powerState ? 'ON' : 'OFF'}`);
                callback(undefined, data.powerState);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        })
            .on("set" /* SET */, async (on, callback) => {
            try {
                const powerState = on ? PowerState.On : PowerState.Off;
                await axios_1.default.post(`${BASE_URL}/power`, { targetState: powerState });
                log.info(`${this.name} is powered: ${powerState ? 'ON' : 'OFF'}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWV6QixJQUFLLFVBR0o7QUFIRCxXQUFLLFVBQVU7SUFDYix5Q0FBRyxDQUFBO0lBQ0gsdUNBQUUsQ0FBQTtBQUNKLENBQUMsRUFISSxVQUFVLEtBQVYsVUFBVSxRQUdkO0FBRUQsSUFBSSxHQUFRLENBQUE7QUFDWixNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUE7QUFPbEMsTUFBTSxvQkFBb0I7SUFLeEIsWUFBWSxHQUFZLEVBQUUsTUFBc0IsRUFBRSxHQUFRO1FBQ3hELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDaEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUF1RDtRQUNqRSxRQUFRLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN6RSxDQUFDO0NBQ0Y7QUFFRCxNQUFNLFlBQVk7SUFPaEIsOENBQThDO0lBRTlDLFlBQVksR0FBUSxFQUFFLEdBQVksRUFBRSxNQUFzQixFQUFFLElBQVk7UUFOaEUsZUFBVSxHQUFHLEdBQUcsQ0FBQTtRQU90QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFBO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFBO1FBQ2hDLE1BQU0sUUFBUSxHQUFHLFVBQVUsSUFBSSxJQUFJLElBQUksTUFB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