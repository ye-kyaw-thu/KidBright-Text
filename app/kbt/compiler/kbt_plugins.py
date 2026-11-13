"""Initial, source-audited plugin API adapters for KidBright Text Stage 5.

The catalog covers a deliberately small, testable first tranche. It does not
claim to implement every installed KidBright plugin. Each entry maps a KBT API
to an existing plugin Blockly block and its source-defined fields/inputs.
"""
from __future__ import annotations

PLUGIN_APIS = {
    # Bluetooth UART plugin (plugins/bluetooth/ble_uart)
    "plugins.bluetooth.ble_uart.send": {
        "block": "ble_uart.send", "kind": "statement", "return_type": "none",
        "params": ["value"], "required": ["value"], "defaults": {},
        "types": {"value": ["number", "text"]}, "value_inputs": {"value": "VALUE"}
    },
    "plugins.bluetooth.ble_uart.read_text": {
        "block": "ble_uart.read_text", "kind": "expression", "return_type": "text",
        "params": [], "required": [], "defaults": {}, "types": {}
    },
    "plugins.bluetooth.ble_uart.read_number": {
        "block": "ble_uart.read_number", "kind": "expression", "return_type": "number",
        "params": [], "required": [], "defaults": {}, "types": {}
    },

    # LCD I2C 20x4 plugin (plugins/display/lcd_i2c)
    "plugins.display.lcd_i2c_20x4.clear": {
        "block": "lcd_i2c_20x4.clear", "kind": "statement", "return_type": "none",
        "params": ["channel", "address"], "required": [],
        "defaults": {"channel": 0, "address": 32}, "types": {"channel": ["number"], "address": ["number"]},
        "fields": {"channel": "CHANNEL", "address": "ADDRESS"},
        "ranges": {"channel": [0, 64], "address": [32, 39]}
    },
    "plugins.display.lcd_i2c_20x4.backlight": {
        "block": "lcd_i2c_20x4.backlight", "kind": "statement", "return_type": "none",
        "params": ["status", "channel", "address"], "required": ["status"],
        "defaults": {"channel": 0, "address": 32}, "types": {"status": ["boolean"], "channel": ["number"], "address": ["number"]},
        "fields": {"status": "STATUS", "channel": "CHANNEL", "address": "ADDRESS"},
        "ranges": {"channel": [0, 64], "address": [32, 39]}
    },
    "plugins.display.lcd_i2c_20x4.print": {
        "block": "lcd_i2c_20x4.print", "kind": "statement", "return_type": "none",
        "params": ["column", "row", "value", "channel", "address"],
        "required": ["column", "row", "value"], "defaults": {"channel": 0, "address": 32},
        "types": {"column": ["number"], "row": ["number"], "value": ["number", "text"], "channel": ["number"], "address": ["number"]},
        "fields": {"channel": "CHANNEL", "address": "ADDRESS"},
        "value_inputs": {"column": "COLUMN", "row": "ROW", "value": "VALUE"},
        "ranges": {"column": [0, 19], "row": [0, 3], "channel": [0, 64], "address": [32, 39]}
    },
    "plugins.display.lcd_i2c_20x4.print_prec": {
        "block": "lcd_i2c_20x4.print_prec", "kind": "statement", "return_type": "none",
        "params": ["column", "row", "value", "precision", "channel", "address"],
        "required": ["column", "row", "value"], "defaults": {"precision": 2, "channel": 1, "address": 39},
        "types": {"column": ["number"], "row": ["number"], "value": ["number"], "precision": ["number"], "channel": ["number"], "address": ["number"]},
        "fields": {"channel": "CHANNEL", "address": "ADDRESS", "precision": "PREC"},
        "value_inputs": {"column": "COLUMN", "row": "ROW", "value": "VALUE"},
        "ranges": {"column": [0, 19], "row": [0, 3], "precision": [0, 4], "channel": [0, 64], "address": [32, 39]}
    },

    # DS18B20 I2C plugin (plugins/science_lab/ds18b20_i2c)
    "plugins.science_lab.ds18b20_i2c.get_temperature": {
        "block": "ds18b20_i2c.get_temperature", "kind": "expression", "return_type": "number",
        "params": ["channel", "address"], "required": [],
        "defaults": {"channel": 0, "address": 24}, "types": {"channel": ["number"], "address": ["number"]},
        "fields": {"channel": "CHANNEL", "address": "ADDRESS"},
        "ranges": {"channel": [0, 64]}, "choices": {"address": [24, 25, 26, 27]}
    },

    # SHT31 temperature/humidity sensor plugin (plugins/weather_sensors/sht31)
    "plugins.weather_sensors.sht31.get_temperature": {
        "block": "sht31.get_temperature", "kind": "expression", "return_type": "number",
        "params": ["channel", "address"], "required": [],
        "defaults": {"channel": 0, "address": 68}, "types": {"channel": ["number"], "address": ["number"]},
        "fields": {"channel": "CHANNEL", "address": "ADDRESS"},
        "ranges": {"channel": [0, 64]}, "choices": {"address": [68, 69]}
    },
    "plugins.weather_sensors.sht31.get_humidity": {
        "block": "sht31.get_humidity", "kind": "expression", "return_type": "number",
        "params": ["channel", "address"], "required": [],
        "defaults": {"channel": 0, "address": 68}, "types": {"channel": ["number"], "address": ["number"]},
        "fields": {"channel": "CHANNEL", "address": "ADDRESS"},
        "ranges": {"channel": [0, 64]}, "choices": {"address": [68, 69]}
    },
    "plugins.weather_sensors.sht31.is_error": {
        "block": "sht31.is_error", "kind": "expression", "return_type": "boolean",
        "params": ["channel", "address"], "required": [],
        "defaults": {"channel": 0, "address": 68}, "types": {"channel": ["number"], "address": ["number"]},
        "fields": {"channel": "CHANNEL", "address": "ADDRESS"},
        "ranges": {"channel": [0, 64]}, "choices": {"address": [68, 69]}
    },

    # TSL2561 illuminance sensor plugin (plugins/weather_sensors/tsl2561)
    "plugins.weather_sensors.tsl2561.get_illuminance": {
        "block": "tsl2561.get_illuminance", "kind": "expression", "return_type": "number",
        "params": ["channel", "address"], "required": [],
        "defaults": {"channel": 0, "address": 41}, "types": {"channel": ["number"], "address": ["number"]},
        "fields": {"channel": "CHANNEL", "address": "ADDRESS"},
        "ranges": {"channel": [0, 64]}, "choices": {"address": [41, 57, 73]}
    },

    # ADS1115 ADC plugin (plugins/weather_sensors/ads1115)
    "plugins.weather_sensors.ads1115.get_volt": {
        "block": "ads1115.get_volt", "kind": "expression", "return_type": "number",
        "params": ["channel", "address", "ain"], "required": [],
        "defaults": {"channel": 0, "address": 72, "ain": 0},
        "types": {"channel": ["number"], "address": ["number"], "ain": ["number"]},
        "fields": {"channel": "CHANNEL", "address": "ADDRESS", "ain": "AIN"},
        "ranges": {"channel": [0, 64], "ain": [0, 3]}, "choices": {"address": [72, 73, 74, 75]}
    }
}

PLUGIN_EVENTS = {
    "plugins.bluetooth.ble_uart.data": {
        "block": "ble_uart.on_data", "statement_input": "ON_DATA",
        "driver": "bluetooth/ble_uart"
    }
}


def bind_plugin_arguments(call, spec):
    """Bind positional/keyword KBT arguments, applying documented defaults."""
    params = spec.get("params", [])
    bound = {}
    errors = []
    if len(call.args) > len(params):
        errors.append("too many positional arguments")
    for index, value in enumerate(call.args[:len(params)]):
        bound[params[index]] = value
    for name, value in call.keywords.items():
        if name not in params:
            errors.append("unknown argument '" + name + "'")
        elif name in bound:
            errors.append("argument '" + name + "' was provided more than once")
        else:
            bound[name] = value
    for name, value in spec.get("defaults", {}).items():
        if name not in bound:
            bound[name] = value
    for name in spec.get("required", []):
        if name not in bound:
            errors.append("missing required argument '" + name + "'")
    return bound, errors
