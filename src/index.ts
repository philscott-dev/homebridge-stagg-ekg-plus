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

enum PowerState {
  Off,
  On,
}

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
  private targetTemp = 205

  private readonly switchService: Service
  private readonly informationService: Service
  //private readonly temperatureService: Service

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

    this.switchService = new hap.Service.Switch(config.name)
    this.switchService
      .getCharacteristic(hap.Characteristic.On)
      .on(
        CharacteristicEventTypes.GET,
        async (callback: CharacteristicGetCallback) => {
          try {
            const { data } = await axios.get(`${BASE_URL}/status`)
            log.info(
              `${this.name} is powered: ${data.powerState ? 'ON' : 'OFF'}`,
            )
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
          on: CharacteristicValue,
          callback: CharacteristicSetCallback,
        ) => {
          try {
            const powerState = on ? PowerState.On : PowerState.Off
            await axios.post(`${BASE_URL}/power`, { targetState: powerState })
            log.info(`${this.name} is powered: ${powerState ? 'ON' : 'OFF'}`)
            callback()
          } catch (err) {
            log.error(err)
            callback(err)
          }
        },
      )

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

    log.info('Switch finished initializing!')
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService,
      //this.temperatureService,
    ]
  }
}
