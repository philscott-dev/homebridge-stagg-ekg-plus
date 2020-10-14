# homebridge-stagg-ekg-plus
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

A homebridge plugin for the [Fellow Stagg EKG+](https://fellowproducts.com/products/stagg-ekg-plus). Used in conjunction with [homebridge-stagg-ekg-plus-server](https://github.com/philscott-dev/homebridge-stagg-ekg-plus-server), this plugin will enhance your kettle with WiFi connectivity, and Apple HomeKit integration.

## Installation
```
npm install -g homebridge-stagg-ekg-plus
```

## Configuration
Edit `~/.homebridge/config.json`:
```
"platforms": [
  {
    "name": "EKG+",
    "host": "192.168.1.254",
    "port": 8080,
    "serialNumber": "EABK1A123456789",
    "platform": "Stagg EKG+"
  }
]
```