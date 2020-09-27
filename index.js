"use strict";
let hap;
class ExampleSwitch {
    constructor(log, config) {
        this.switchOn = false;
        this.log = log;
        this.name = config.name;
        this.switchService = new hap.Service.Switch(this.name);
        this.switchService
            .getCharacteristic(hap.Characteristic.On)
            .on("get" /* GET */, (callback) => {
            log.info('Current state of the switch was returned: ' +
                (this.switchOn ? 'ON' : 'OFF'));
            callback(undefined, this.switchOn);
        })
            .on("set" /* SET */, (value, callback) => {
            this.switchOn = value;
            log.info('Switch state was set to: ' + (this.switchOn ? 'ON' : 'OFF'));
            callback();
        });
        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'Fellow')
            .setCharacteristic(hap.Characteristic.Model, 'Stagg EKG+');
        log.info('Switch finished initializing!');
    }
    /*
     * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
     * Typical this only ever happens at the pairing process.
     */
    identify() {
        this.log('Identify!');
    }
    /*
     * This method is called directly after creation of this instance.
     * It should return all services which should be added to the accessory.
     */
    getServices() {
        return [this.informationService, this.switchService];
    }
}
module.exports = (api) => {
    hap = api.hap;
    api.registerAccessory('ExampleSwitch', ExampleSwitch);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQWFBLElBQUksR0FBUSxDQUFBO0FBT1osTUFBTSxhQUFhO0lBUWpCLFlBQVksR0FBWSxFQUFFLE1BQXVCO1FBTHpDLGFBQVEsR0FBRyxLQUFLLENBQUE7UUFNdEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7UUFFdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN0RCxJQUFJLENBQUMsYUFBYTthQUNmLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO2FBQ3hDLEVBQUUsa0JBRUQsQ0FBQyxRQUFtQyxFQUFFLEVBQUU7WUFDdEMsR0FBRyxDQUFDLElBQUksQ0FDTiw0Q0FBNEM7Z0JBQzFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FDakMsQ0FBQTtZQUNELFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3BDLENBQUMsQ0FDRjthQUNBLEVBQUUsa0JBRUQsQ0FBQyxLQUEwQixFQUFFLFFBQW1DLEVBQUUsRUFBRTtZQUNsRSxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQWdCLENBQUE7WUFDaEMsR0FBRyxDQUFDLElBQUksQ0FBQywyQkFBMkIsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtZQUN0RSxRQUFRLEVBQUUsQ0FBQTtRQUNaLENBQUMsQ0FDRixDQUFBO1FBRUgsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRTthQUM3RCxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUM7YUFDNUQsaUJBQWlCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFFNUQsR0FBRyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO0lBQzNDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxRQUFRO1FBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUN2QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsV0FBVztRQUNULE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ3RELENBQUM7Q0FDRjtBQTdERCxpQkFBUyxDQUFDLEdBQVEsRUFBRSxFQUFFO0lBQ3BCLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFBO0lBQ2IsR0FBRyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQTtBQUN2RCxDQUFDLENBQUEifQ==