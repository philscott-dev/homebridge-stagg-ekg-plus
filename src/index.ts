import axios from 'axios'
import {
  AccessoryPlugin,
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service,
  StaticPlatformPlugin,
  PlatformConfig,
} from 'homebridge'
import { fahrenheitToCelsius, celsiusToFahrenheit } from './helpers'

let hap: HAP
const PLATFORM_NAME = 'Stagg EKG+'

export = (api: API) => {
  hap = api.hap
  api.registerPlatform(PLATFORM_NAME, StaggEkgPlusPlatform)
}

/**
 * Platform
 */

class StaggEkgPlusPlatform implements StaticPlatformPlugin {
  private readonly log: Logging
  private config: PlatformConfig
  private api: API

  constructor(log: Logging, config: PlatformConfig, api: API) {
    this.log = log
    this.config = config
    this.api = api
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    callback([new KettlePlugin(hap, this.log, this.config, PLATFORM_NAME)])
  }
}

/**
 * Plugin
 */

class KettlePlugin implements AccessoryPlugin {
  private readonly log: Logging
  private readonly name: string

  private readonly informationService: Service
  private readonly temperatureService: Service

  constructor(hap: HAP, log: Logging, config: PlatformConfig, name: string) {
    this.log = log
    this.name = name
    const host = config.host || 'localhost'
    const port = config.port || '8080'
    const BASE_URL = `http://${host}:${port}/api`

    /**
     * Information Service
     */
    const { Manufacturer, Model, SerialNumber, Name } = hap.Characteristic
    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(Manufacturer, 'Fellow')
      .setCharacteristic(Model, 'Stagg EKG+')
      .setCharacteristic(Name, config.name as string)
      .setCharacteristic(
        SerialNumber,
        (config.serialNumber as string) || '000000000000000',
      )

    /**
     * Temperature Service
     */

    this.temperatureService = new hap.Service.Thermostat(this.name)

    this.temperatureService
      .getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
      .updateValue(hap.Characteristic.TemperatureDisplayUnits.FAHRENHEIT)

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
      .on(
        CharacteristicEventTypes.GET,
        async (callback: CharacteristicGetCallback) => {
          try {
            const { data } = await axios.get(`${BASE_URL}/status`)
            log.info('Current State: ' + data.powerState)
            callback(undefined, data.powerState)
          } catch (err) {
            log.error(err)
            callback(err)
          }
        },
      )
      .on(
        CharacteristicEventTypes.SET,
        async (
          value: CharacteristicValue,
          callback: CharacteristicSetCallback,
        ) => {
          try {
            await axios.post(`${BASE_URL}/power`, {
              targetState: value as number,
            })
            log.info(`${this.name} power state set to: ${value}`)
            callback()
          } catch (err) {
            log.error(err)
            callback(err)
          }
        },
      )

    /**
     * Current Temperature
     */

    this.temperatureService
      .getCharacteristic(hap.Characteristic.CurrentTemperature)
      .on(
        CharacteristicEventTypes.GET,
        async (callback: CharacteristicGetCallback) => {
          try {
            const { data } = await axios.get(`${BASE_URL}/status`)
            const currentTemp = fahrenheitToCelsius(data.currentTemp)
            log.info('Current Temp: ' + currentTemp)
            callback(undefined, currentTemp)
          } catch (err) {
            log.error(err)
            callback(err)
          }
        },
      )

    /**
     * Target Temperature
     * F Range: 104 - 212
     * C Range: 40 - 100
     */

    const minValue = 40
    const maxValue = 100

    this.temperatureService
      .getCharacteristic(hap.Characteristic.TargetTemperature)
      .setProps({
        minValue,
        maxValue,
        minStep: 1,
        format: hap.Formats.INT,
        validValueRanges: [minValue, maxValue],
      })
      .on(
        CharacteristicEventTypes.GET,
        async (callback: CharacteristicGetCallback) => {
          try {
            const { data } = await axios.get(`${BASE_URL}/status`)
            const targetTemp = fahrenheitToCelsius(data.targetTemp)
            log.info('Target Temp: ' + targetTemp)
            callback(undefined, targetTemp)
          } catch (err) {
            log.error(err)
            callback(err)
          }
        },
      )
      .on(
        CharacteristicEventTypes.SET,
        async (
          value: CharacteristicValue,
          callback: CharacteristicSetCallback,
        ) => {
          try {
            const targetTemp = celsiusToFahrenheit(value as number)
            await axios.post(`${BASE_URL}/temperature`, {
              targetTemp,
            })
            log.info(`${this.name} set to: ${targetTemp}`)
            callback()
          } catch (err) {
            log.error(err)
            callback(err)
          }
        },
      )

    log.info(`${this.name} initialized`)
  }

  getServices(): Service[] {
    return [this.informationService, this.temperatureService]
  }
}
