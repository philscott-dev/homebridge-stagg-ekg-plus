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
  private switchOn = false

  private readonly switchService: Service
  private readonly informationService: Service
  // private readonly temperatureService: Service

  constructor(hap: HAP, log: Logging, config: PlatformConfig, name: string) {
    this.log = log
    this.name = name
    const host = config.host || 'localhost'
    const port = config.port || '80'
    const BASE_URL = `http://${host}:${port}/api`

    /**
     * Information Service
     */
    const { Manufacturer, Model, SerialNumber } = hap.Characteristic
    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(Manufacturer, 'Fellow')
      .setCharacteristic(Model, 'Stagg EKG+')
      .setCharacteristic(
        SerialNumber,
        (config.serialNumber as string) || '000000000000000',
      )

    /**
     * Switch Service
     */

    this.switchService = new hap.Service.Switch(this.name)
    this.switchService
      .getCharacteristic(hap.Characteristic.On)
      .on(
        CharacteristicEventTypes.GET,
        (callback: CharacteristicGetCallback) => {
          log.info(
            'Current state of the switch was returned: ' +
              (this.switchOn ? 'ON' : 'OFF'),
          )
          callback(undefined, this.switchOn)
        },
      )
      .on(
        CharacteristicEventTypes.SET,
        async (
          on: CharacteristicValue,
          callback: CharacteristicSetCallback,
        ) => {
          try {
            if (on) {
              await axios.get(`${BASE_URL}/api/power/on`)
            } else {
              await axios.get(`${BASE_URL}/api/power/off`)
            }

            this.switchOn = on as boolean
            log.info(
              'Switch state was set to: ' + (this.switchOn ? 'ON' : 'OFF'),
            )
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
