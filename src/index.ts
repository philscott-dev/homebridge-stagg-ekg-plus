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
} from 'homebridge'

let hap: HAP

const BASE_URL = 'http://192.168.1.18:8080/api'
const PLATFORM_NAME = 'Stagg EKG+'
const ACCESSORY_NAME = 'EKG+'

export = (api: API) => {
  hap = api.hap
  api.registerPlatform(PLATFORM_NAME, StaggEkgPlusPlatform)
}

class StaggEkgPlusPlatform implements StaticPlatformPlugin {
  private readonly log: Logging

  constructor(log: Logging) {
    this.log = log

    // probably parse config or something here

    log.info(`${PLATFORM_NAME} Platform Initialized`)
  }

  accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): void {
    callback([new ExampleSwitch(hap, this.log, ACCESSORY_NAME)])
  }
}

class ExampleSwitch implements AccessoryPlugin {
  private readonly log: Logging
  private readonly name: string
  private switchOn = false

  private readonly switchService: Service
  private readonly informationService: Service

  constructor(hap: HAP, log: Logging, name: string) {
    this.log = log
    this.name = name

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
              await axios.get(`${BASE_URL}/power/on`)
            } else {
              await axios.get(`${BASE_URL}/power/off`)
            }

            this.switchOn = on as boolean
            log.info(
              'Switch state was set to: ' + (this.switchOn ? 'ON' : 'OFF'),
            )
            callback()
          } catch (err) {
            log.error(err)
          }
        },
      )

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Fellow')
      .setCharacteristic(hap.Characteristic.Model, 'Stagg EKG+')

    log.info('Switch finished initializing!')
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log('Identify!')
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [this.informationService, this.switchService]
  }
}
