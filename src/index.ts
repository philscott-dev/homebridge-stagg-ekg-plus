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
import { C_MAX, C_MIN } from './constants'
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

  private tempUnits: 0 | 1

  constructor(hap: HAP, log: Logging, config: PlatformConfig, name: string) {
    const { CELSIUS, FAHRENHEIT } = hap.Characteristic.TemperatureDisplayUnits
    this.log = log
    this.name = name
    const host = config.host || 'localhost'
    const port = config.port || '8080'
    const BASE_URL = `http://${host}:${port}/api`

    /**
     * Units
     */

    this.log(`Temp Unit: ${config.tempUnits}`)
    this.tempUnits = config.tempUnits === 'c' ? CELSIUS : FAHRENHEIT

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
     * Display Units
     */

    this.temperatureService = new hap.Service.Thermostat(this.name)
    this.temperatureService
      .getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
      .on(
        CharacteristicEventTypes.GET,
        async (callback: CharacteristicGetCallback) => {
          try {
            callback(undefined, this.tempUnits)
          } catch (err) {
            if (err instanceof Error) {
              log.error(err.message)
              callback(err)
            } else {
              callback()
            }
          }
        },
      )

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
            if (err instanceof Error) {
              log.error(err.message)
              callback(err)
            } else {
              callback()
            }
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
            if (err instanceof Error) {
              log.error(err.message)
              callback(err)
            } else {
              callback()
            }
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
            const currentTemp =
              this.tempUnits === CELSIUS
                ? data.currentTemp
                : fahrenheitToCelsius(data.currentTemp)
            log.info('Current Temp: ' + data.currentTemp)
            callback(undefined, currentTemp)
          } catch (err) {
            if (err instanceof Error) {
              log.error(err.message)
              callback(err)
            } else {
              callback()
            }
          }
        },
      )

    /**
     * Target Temperature
     */

    this.temperatureService
      .getCharacteristic(hap.Characteristic.TargetTemperature)
      .setProps({
        minValue: C_MIN,
        maxValue: C_MAX,
        minStep: 1,
        format: hap.Formats.INT,
        validValueRanges: [C_MIN, C_MAX],
      })
      .on(
        CharacteristicEventTypes.GET,
        async (callback: CharacteristicGetCallback) => {
          try {
            const { data } = await axios.get(`${BASE_URL}/status`)
            const targetTemp =
              this.tempUnits === CELSIUS
                ? data.targetTemp
                : fahrenheitToCelsius(data.targetTemp)
            log.info('Target Temp: ' + data.targetTemp)
            callback(undefined, targetTemp)
          } catch (err) {
            if (err instanceof Error) {
              log.error(err.message)
              callback(err)
            } else {
              callback()
            }
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
            log.info(`${this.name} set to: ${value}`)
            const targetTemp =
              this.tempUnits === CELSIUS
                ? (value as number)
                : celsiusToFahrenheit(value as number)
            await axios.post(`${BASE_URL}/temperature`, {
              targetTemp,
            })
            log.info(`${this.name} set to: ${targetTemp}`)
            callback()
          } catch (err) {
            if (err instanceof Error) {
              log.error(err.message)
              callback(err)
            } else {
              callback()
            }
          }
        },
      )

    log.info(`${this.name} initialized`)
  }

  getServices(): Service[] {
    return [this.informationService, this.temperatureService]
  }
}
