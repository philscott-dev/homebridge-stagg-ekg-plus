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
         * F Range: 104 - 212
         * C Range: 40 - 100
         */
        const minValue = 40;
        const maxValue = 100;
        this.temperatureService = new hap.Service.Thermostat(this.name);
        this.temperatureService
            .getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
            .on("get" /* GET */, async (callback) => {
            try {
                const { CELSIUS, FAHRENHEIT, } = hap.Characteristic.TemperatureDisplayUnits;
                const { data } = await axios_1.default.get(`${BASE_URL}/status`);
                const units = data.targetTemp <= maxValue && data.targetTemp >= minValue
                    ? CELSIUS
                    : FAHRENHEIT;
                callback(undefined, units);
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
                const currentTemp = helpers_1.fahrenheitToCelsius(data.currentTemp);
                log.info('Current Temp: ' + currentTemp);
                callback(undefined, currentTemp);
            }
            catch (err) {
                log.error(err);
                callback(err);
            }
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUF5QjtBQWN6Qix1Q0FBb0U7QUFFcEUsSUFBSSxHQUFRLENBQUE7QUFDWixNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUE7QUFPbEM7O0dBRUc7QUFFSCxNQUFNLG9CQUFvQjtJQUt4QixZQUFZLEdBQVksRUFBRSxNQUFzQixFQUFFLEdBQVE7UUFDeEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtJQUNoQixDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQXVEO1FBQ2pFLFFBQVEsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3pFLENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBRUgsTUFBTSxZQUFZO0lBT2hCLFlBQVksR0FBUSxFQUFFLEdBQVksRUFBRSxNQUFzQixFQUFFLElBQVk7UUFDdEUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtRQUNoQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQTtRQUN2QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQTtRQUNsQyxNQUFNLFFBQVEsR0FBRyxVQUFVLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQTtRQUU3Qzs7V0FFRztRQUNILE1BQU0sRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsY0FBYyxDQUFBO1FBQ3RFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUU7YUFDN0QsaUJBQWlCLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQzthQUN6QyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDO2FBQ3RDLGlCQUFpQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBYyxDQUFDO2FBQzlDLGlCQUFpQixDQUNoQixZQUFZLEVBQ1gsTUFBTSxDQUFDLFlBQXVCLElBQUksaUJBQWlCLENBQ3JELENBQUE7UUFFSDs7OztXQUlHO1FBRUgsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFBO1FBQ25CLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQTtRQUVwQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFL0QsSUFBSSxDQUFDLGtCQUFrQjthQUNwQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDO2FBQzdELEVBQUUsa0JBRUQsS0FBSyxFQUFFLFFBQW1DLEVBQUUsRUFBRTtZQUM1QyxJQUFJO2dCQUNGLE1BQU0sRUFDSixPQUFPLEVBQ1AsVUFBVSxHQUNYLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQTtnQkFDOUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsU0FBUyxDQUFDLENBQUE7Z0JBQ3RELE1BQU0sS0FBSyxHQUNULElBQUksQ0FBQyxVQUFVLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksUUFBUTtvQkFDeEQsQ0FBQyxDQUFDLE9BQU87b0JBQ1QsQ0FBQyxDQUFDLFVBQVUsQ0FBQTtnQkFDaEIsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTthQUMzQjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ2QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2Q7UUFDSCxDQUFDLENBQ0YsQ0FBQTtRQUVIOztXQUVHO1FBRUgsSUFBSSxDQUFDLGtCQUFrQjthQUNwQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLHlCQUF5QixDQUFDO2FBQy9ELFFBQVEsQ0FBQztZQUNSLFFBQVEsRUFBRSxDQUFDO1lBQ1gsUUFBUSxFQUFFLENBQUM7WUFDWCxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3BCLENBQUM7YUFDRCxFQUFFLGtCQUVELEtBQUssRUFBRSxRQUFtQyxFQUFFLEVBQUU7WUFDNUMsSUFBSTtnQkFDRixNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxTQUFTLENBQUMsQ0FBQTtnQkFDdEQsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBQzdDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO2FBQ3JDO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1osR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDZCxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDZDtRQUNILENBQUMsQ0FDRjthQUNBLEVBQUUsa0JBRUQsS0FBSyxFQUNILEtBQTBCLEVBQzFCLFFBQW1DLEVBQ25DLEVBQUU7WUFDRixJQUFJO2dCQUNGLE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsUUFBUSxFQUFFO29CQUNwQyxXQUFXLEVBQUUsS0FBZTtpQkFDN0IsQ0FBQyxDQUFBO2dCQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSx3QkFBd0IsS0FBSyxFQUFFLENBQUMsQ0FBQTtnQkFDckQsUUFBUSxFQUFFLENBQUE7YUFDWDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ2QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2Q7UUFDSCxDQUFDLENBQ0YsQ0FBQTtRQUVIOztXQUVHO1FBRUgsSUFBSSxDQUFDLGtCQUFrQjthQUNwQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDO2FBQ3hELEVBQUUsa0JBRUQsS0FBSyxFQUFFLFFBQW1DLEVBQUUsRUFBRTtZQUM1QyxJQUFJO2dCQUNGLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLGVBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLFNBQVMsQ0FBQyxDQUFBO2dCQUN0RCxNQUFNLFdBQVcsR0FBRyw2QkFBbUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7Z0JBQ3pELEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLENBQUE7Z0JBQ3hDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUE7YUFDakM7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNkLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUNkO1FBQ0gsQ0FBQyxDQUNGLENBQUE7UUFFSCxJQUFJLENBQUMsa0JBQWtCO2FBQ3BCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUM7YUFDdkQsUUFBUSxDQUFDO1lBQ1IsUUFBUTtZQUNSLFFBQVE7WUFDUixPQUFPLEVBQUUsQ0FBQztZQUNWLE1BQU0saUJBQWlCO1lBQ3ZCLGdCQUFnQixFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQztTQUN2QyxDQUFDO2FBQ0QsRUFBRSxrQkFFRCxLQUFLLEVBQUUsUUFBbUMsRUFBRSxFQUFFO1lBQzVDLElBQUk7Z0JBQ0YsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsU0FBUyxDQUFDLENBQUE7Z0JBQ3RELE1BQU0sVUFBVSxHQUFHLDZCQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtnQkFDdkQsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLENBQUE7Z0JBQ3RDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUE7YUFDaEM7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUNkLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUNkO1FBQ0gsQ0FBQyxDQUNGO2FBQ0EsRUFBRSxrQkFFRCxLQUFLLEVBQ0gsS0FBMEIsRUFDMUIsUUFBbUMsRUFDbkMsRUFBRTtZQUNGLElBQUk7Z0JBQ0YsTUFBTSxVQUFVLEdBQUcsNkJBQW1CLENBQUMsS0FBZSxDQUFDLENBQUE7Z0JBQ3ZELE1BQU0sZUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsY0FBYyxFQUFFO29CQUMxQyxVQUFVO2lCQUNYLENBQUMsQ0FBQTtnQkFDRixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksWUFBWSxVQUFVLEVBQUUsQ0FBQyxDQUFBO2dCQUM5QyxRQUFRLEVBQUUsQ0FBQTthQUNYO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1osR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDZCxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDZDtRQUNILENBQUMsQ0FDRixDQUFBO1FBRUgsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLGNBQWMsQ0FBQyxDQUFBO0lBQ3RDLENBQUM7SUFFRCxXQUFXO1FBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtJQUMzRCxDQUFDO0NBQ0Y7QUEzTUQsaUJBQVMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtJQUNwQixHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQTtJQUNiLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtBQUMzRCxDQUFDLENBQUEifQ==