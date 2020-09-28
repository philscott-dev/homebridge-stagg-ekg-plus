# homebridge-stagg-ekg-plus
To be used in conjunction with [homebridge-stagg-ekg-plus-server](https://github.com/philscott-dev/homebridge-stagg-ekg-plus-server)

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