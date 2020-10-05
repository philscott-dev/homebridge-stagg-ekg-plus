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

// enum PowerState {
//   Off,
//   On,
// }

let hap: HAP
const PLATFORM_NAME = 'Stagg EKG+'

export = (api: API) => {
  hap = api.hap
  api.registerPlatform(PLATFORM_NAME, StaggEkgPlusPlatform)
}

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
    callback([new KettleSwitch(hap, this.log, this.config, PLATFORM_NAME)])
  }
}

class KettleSwitch implements AccessoryPlugin {
  private readonly log: Logging
  private readonly name: string
  //private targetTemp = 205

  // private readonly switchService: Service
  private readonly informationService: Service
  private readonly temperatureService: Service

  constructor(hap: HAP, log: Logging, config: PlatformConfig, name: string) {
    this.log = log
    this.name = name
    const host = config.host || 'localhost'
    const port = config.port || '80'
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

    this.temperatureService = new hap.Service.Thermostat(this.name)

    /**
     * Threshold
     * F Range: 104 - 212
     * C Range: 40 - 100
     */

    const minValue = 104
    const maxValue = 212
    // this.temperatureService
    //   .getCharacteristic(hap.Characteristic.HeatingThresholdTemperature)
    //   .setProps({ minValue, maxValue })

    /**
     * Power State
     */

    this.temperatureService
      .getCharacteristic(hap.Characteristic.TargetHeatingCoolingState)
      .setProps({
        validValues: [
          hap.Characteristic.TargetHeatingCoolingState.OFF,
          hap.Characteristic.TargetHeatingCoolingState.HEAT,
        ],
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
     * Current Temp
     */

    this.temperatureService
      .getCharacteristic(hap.Characteristic.CurrentTemperature)
      .on(
        CharacteristicEventTypes.GET,
        async (callback: CharacteristicGetCallback) => {
          try {
            const { data } = await axios.get(`${BASE_URL}/status`)
            const isOff = data.currentTemp === '32' || data.currentTemp === 32
            const temperature = isOff ? '0' : data.currentTemp
            log.info('Current Temp: ' + temperature)
            callback(undefined, temperature)
          } catch (err) {
            log.error(err)
            callback(err)
          }
        },
      )

    /**
     * Target Temp
     */

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
            log.info('Target Temp: ' + data.targetTemp)
            callback(undefined, data.targetTemp)
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
            await axios.post(`${BASE_URL}/temperature`, {
              targetTemp: value as number,
            })
            log.info(`${this.name} set to: ${value}`)
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
    return [
      this.informationService,
      //this.switchService,
      this.temperatureService,
    ]
  }
}
