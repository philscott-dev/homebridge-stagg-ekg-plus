"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
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
        const { CELSIUS, FAHRENHEIT } = hap.Characteristic.TemperatureDisplayUnits;
        this.log = log;
        this.name = name;
        const host = config.host || 'localhost';
        const port = config.port || '8080';
        const BASE_URL = `http://${host}:${port}/api`;
        /**
         * Units
         */
        this.log(`Temp Unit: ${config.tempUnits}`);
        this.tempUnits = config.tempUnits === 'c' ? CELSIUS : FAHRENHEIT;
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
         * Display Units
         */
        this.temperatureService = new hap.Service.Thermostat(this.name);
        this.temperatureService
            .getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
            .on("get" /* GET */, async (callback) => {
            try {
                callback(undefined, this.tempUnits);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        });
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
                const currentTemp = this.tempUnits === CELSIUS
                    ? data.currentTemp
                    : helpers_1.fahrenheitToCelsius(data.currentTemp);
                log.info('Current Temp: ' + data.currentTemp);
                callback(undefined, currentTemp);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        });
        /**
         * Target Temperature
         */
        this.temperatureService
            .getCharacteristic(hap.Characteristic.TargetTemperature)
            .setProps({
            minValue: constants_1.C_MIN,
            maxValue: constants_1.C_MAX,
            minStep: 1,
            format: "int" /* INT */,
            validValueRanges: [constants_1.C_MIN, constants_1.C_MAX],
        })
            .on("get" /* GET */, async (callback) => {
            try {
                const { data } = await axios_1.default.get(`${BASE_URL}/status`);
                const targetTemp = this.tempUnits === CELSIUS
                    ? data.targetTemp
                    : helpers_1.fahrenheitToCelsius(data.targetTemp);
                log.info('Target Temp: ' + data.targetTemp);
                callback(undefined, targetTemp);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        })
            .on("set" /* SET */, async (value, callback) => {
            try {
                log.info(`${this.name} set to: ${value}`);
                const targetTemp = this.tempUnits === CELSIUS
                    ? value
                    : helpers_1.celsiusToFahrenheit(value);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWN6QiwyQ0FBMEM7QUFDMUMsdUNBQW9FO0FBRXBFLElBQUksR0FBUSxDQUFBO0FBQ1osTUFBTSxhQUFhLEdBQUcsWUFBWSxDQUFBO0FBT2xDOztHQUVHO0FBRUgsTUFBTSxvQkFBb0I7SUFLeEIsWUFBWSxHQUFZLEVBQUUsTUFBc0IsRUFBRSxHQUFRO1FBQ3hELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7SUFDaEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxRQUF1RDtRQUNqRSxRQUFRLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN6RSxDQUFDO0NBQ0Y7QUFFRDs7R0FFRztBQUVILE1BQU0sWUFBWTtJQVNoQixZQUFZLEdBQVEsRUFBRSxHQUFZLEVBQUUsTUFBc0IsRUFBRSxJQUFZO1FBQ3RFLE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQTtRQUMxRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFBO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFBO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLFVBQVUsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFBO1FBRTdDOztXQUVHO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO1FBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFBO1FBRWhFOztXQUVHO1FBQ0gsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUE7UUFDdEUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRTthQUM3RCxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDO2FBQ3pDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUM7YUFDdEMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFjLENBQUM7YUFDOUMsaUJBQWlCLENBQ2hCLFlBQVksRUFDWCxNQUFNLENBQUMsWUFBdUIsSUFBSSxpQkFBaUIsQ0FDckQsQ0FBQTtRQUVIOztXQUVHO1FBRUgsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQy9ELElBQUksQ0FBQyxrQkFBa0I7YUFDcEIsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQzthQUM3RCxFQUFFLGtCQUVELEtBQUssRUFBRSxRQUFtQyxFQUFFLEVBQUU7WUFDNUMsSUFBSTtnQkFDRixRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTthQUNwQztZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ2QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2Q7UUFDSCxDQUFDLENBQ0YsQ0FBQTtRQUVIOztXQUVHO1FBRUgsSUFBSSxDQUFDLGtCQUFrQjthQUNwQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLHlCQUF5QixDQUFDO2FBQy9ELFFBQVEsQ0FBQztZQUNSLFFBQVEsRUFBRSxDQUFDO1lBQ1gsUUFBUSxFQUFFLENBQUM7WUFDWCxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3BCLENBQUM7YUFDRCxFQUFFLGtCQUVELEtBQUssRUFBRSxRQUFtQyxFQUFFLEVBQUU7WUFDNUMsSUFBSTtnQkFDRixNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxTQUFTLENBQUMsQ0FBQTtnQkFDdEQsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBQzdDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO2FBQ3JDO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1osR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDZCxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDZDtRQUNILENBQUMsQ0FDRjthQUNBLEVBQUUsa0JBRUQsS0FBSyxFQUNILEtBQTBCLEVBQzFCLFFBQW1DLEVBQ25DLEVBQUU7WUFDRixJQUFJO2dCQUNGLE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsUUFBUSxFQUFFO29CQUNwQyxXQUFXLEVBQUUsS0FBZTtpQkFDN0IsQ0FBQyxDQUFBO2dCQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSx3QkFBd0IsS0FBSyxFQUFFLENBQUMsQ0FBQTtnQkFDckQsUUFBUSxFQUFFLENBQUE7YUFDWDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ2QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2Q7UUFDSCxDQUFDLENBQ0YsQ0FBQTtRQUVIOztXQUVHO1FBRUgsSUFBSSxDQUFDLGtCQUFrQjthQUNwQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDO2FBQ3hELEVBQUUsa0JBRUQsS0FBSyxFQUFFLFFBQW1DLEVBQUUsRUFBRTtZQUM1QyxJQUFJO2dCQUNGLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLGVBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLFNBQVMsQ0FBQyxDQUFBO2dCQUN0RCxNQUFNLFdBQVcsR0FDZixJQUFJLENBQUMsU0FBUyxLQUFLLE9BQU87b0JBQ3hCLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVztvQkFDbEIsQ0FBQyxDQUFDLDZCQUFtQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtnQkFDM0MsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7Z0JBQzdDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUE7YUFDakM7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNkLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUNkO1FBQ0gsQ0FBQyxDQUNGLENBQUE7UUFFSDs7V0FFRztRQUVILElBQUksQ0FBQyxrQkFBa0I7YUFDcEIsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQzthQUN2RCxRQUFRLENBQUM7WUFDUixRQUFRLEVBQUUsaUJBQUs7WUFDZixRQUFRLEVBQUUsaUJBQUs7WUFDZixPQUFPLEVBQUUsQ0FBQztZQUNWLE1BQU0saUJBQWlCO1lBQ3ZCLGdCQUFnQixFQUFFLENBQUMsaUJBQUssRUFBRSxpQkFBSyxDQUFDO1NBQ2pDLENBQUM7YUFDRCxFQUFFLGtCQUVELEtBQUssRUFBRSxRQUFtQyxFQUFFLEVBQUU7WUFDNUMsSUFBSTtnQkFDRixNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxTQUFTLENBQUMsQ0FBQTtnQkFDdEQsTUFBTSxVQUFVLEdBQ2QsSUFBSSxDQUFDLFNBQVMsS0FBSyxPQUFPO29CQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVU7b0JBQ2pCLENBQUMsQ0FBQyw2QkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBQzFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDM0MsUUFBUSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQTthQUNoQztZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ2QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2Q7UUFDSCxDQUFDLENBQ0Y7YUFDQSxFQUFFLGtCQUVELEtBQUssRUFDSCxLQUEwQixFQUMxQixRQUFtQyxFQUNuQyxFQUFFO1lBQ0YsSUFBSTtnQkFDRixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksWUFBWSxLQUFLLEVBQUUsQ0FBQyxDQUFBO2dCQUN6QyxNQUFNLFVBQVUsR0FDZCxJQUFJLENBQUMsU0FBUyxLQUFLLE9BQU87b0JBQ3hCLENBQUMsQ0FBRSxLQUFnQjtvQkFDbkIsQ0FBQyxDQUFDLDZCQUFtQixDQUFDLEtBQWUsQ0FBQyxDQUFBO2dCQUMxQyxNQUFNLGVBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLGNBQWMsRUFBRTtvQkFDMUMsVUFBVTtpQkFDWCxDQUFDLENBQUE7Z0JBQ0YsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLFlBQVksVUFBVSxFQUFFLENBQUMsQ0FBQTtnQkFDOUMsUUFBUSxFQUFFLENBQUE7YUFDWDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ2QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2Q7UUFDSCxDQUFDLENBQ0YsQ0FBQTtRQUVILEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsQ0FBQTtJQUN0QyxDQUFDO0lBRUQsV0FBVztRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7SUFDM0QsQ0FBQztDQUNGO0FBcE5ELGlCQUFTLENBQUMsR0FBUSxFQUFFLEVBQUU7SUFDcEIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUE7SUFDYixHQUFHLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLG9CQUFvQixDQUFDLENBQUE7QUFDM0QsQ0FBQyxDQUFBIn0=