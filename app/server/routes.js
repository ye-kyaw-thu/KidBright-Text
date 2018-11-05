const fs = require('fs');
const path = require('path');
const util = require('util');
const exec = require('child_process').exec;
const moment = require('moment');
const SerialPort = require('serialport');
const QRCode = require('qrcode');
const md5 = require('md5');

module.exports = function (app, Config, Log) {
	const server_dir = __dirname;
	const data_dir = Config.process_dir + '/' + Config.ide.directories.data;
	const toolchain_dir = Config.process_dir + '/xtensa-esp32-elf/bin';
	const plugins_dir = Config.process_dir + '/' + Config.ide.directories.plugins;
	var pluginsInfo = [];

	function is_null(val) {
		return ((val == null) || (typeof (val) == 'undefined'));
	}

	function is_not_null(val) {
		return (!((val == null) || (typeof (val) == 'undefined')));
	}

	function esptool() {
		if (process.platform == 'win32') {
			return Config.process_dir + '/esptool.exe';
		} else
			if (process.platform == 'darwin') {
				return Config.process_dir + '/esptool';
			}

		return Config.process_dir + '/esptool.py';
	}

	function ospath(p) {
		if (process.platform == 'win32') {
			return p.replace(/\//g, '\\');
		}

		return p;
	}

	function filelistSortAsc(a, b) {
		return a.filename.localeCompare(b.filename);
	}

	function filelistSortDesc(a, b) {
		return b.filename.localeCompare(a.filename);
	}

	function categorySortAsc(a, b) {
		return a.name.localeCompare(b.name);
	}

	// main login page
	app.get('/', function (req, res) {
		res.redirect('/home');
	});

	app.get('/home', function (req, res) {
		// render home
		res.render('home', {
			title: 'Control Panel',
			//countries: CT,
			//udata: req.session.user,
			ulang: req.cookies.lang
		});
	});

	app.get('/lang', function (req, res) {
		if (req.query.set) {
			res.cookie('lang', req.query.set, {
				expires: new Date(253402300000000)
			}).send('ok');
		} else {
			res.status(200).send(req.cookies.lang);
		}
	});

	// web page language file
	app.get('/js/lang.js', function (req, res) {
		var lang_fn = 'en.js';
		if (req.cookies.lang == 'th') {
			lang_fn = 'th.js';
		}
		lang_fn = server_dir + '/languages/' + lang_fn;
		res.download(lang_fn, function (err) {
			if (err) {
				res.status(404).send('Not Found');
			}
		});
	});

	// blockly language file
	app.get('/blockly/lang.js', function (req, res) {
		var lang_fn = 'en.js';
		if (req.cookies.lang == 'th') {
			lang_fn = 'th.js';
		}
		lang_fn = server_dir + '/languages/blockly/' + lang_fn;
		res.download(lang_fn, function (err) {
			if (err) {
				res.status(404).send('Not Found');
			}
		});
	});

	app.post('/listfile', function (req, res) {
		var dir = data_dir;
		var filelist = [];
		try {
			var files = fs.readdirSync(dir);
			for (var i in files) {
				var name = dir + '/' + files[i];
				if (fs.statSync(name).isFile()) {
					filelist.push({
						filename: files[i]
					});
				}
			}
			filelist.sort(filelistSortAsc);
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(filelist));
		} catch (err) {
			console.error(err);
			res.status(400).send('0');
		}
	});

	app.post('/savefile', function (req, res) {
		try {
			fs.writeFileSync(data_dir + '/' + req.body['filename'], req.body['content'], 'utf8');
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(null));
		} catch (err) {
			console.error(err);
			res.status(400).send('0');
		}
	});

	app.post('/openfile', function (req, res) {
		try {
			fs.readFile(data_dir + '/' + req.body['filename'], 'utf8', function (err, contents) {
				//res.status(200).send(o);
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify(contents));
			});
		} catch (err) {
			console.error(err);
			res.status(400).send('0');
		}
	});

	app.post('/deletefile', function (req, res) {
		try {
			fs.unlinkSync(data_dir + '/' + req.body['filename']);
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(null));
		} catch (err) {
			console.error(err);
			res.status(400).send('0');
		}
	});

	app.post('/setclock', function (req, res) {
		Log.i('setting board real time clock...');
		try {
			var port_name = req.body['port_name'];
			var tx_str = req.body['datetime'];
			var serialport = new SerialPort(port_name, {
				baudRate: 115200,
				dataBits: 8,
				stopBits: 1,
				parity: 'none',
				rtscts: false,
				xon: false,
				xoff: false,
				xany: false,
				autoOpen: false
			});

			serialport.open(function (err) {
				if (err) throw err;

				serialport.write('rtc set ' + tx_str + '\n', function (err) {
					if (err) {
						console.log('Error on write: ', err.message);
					}
					// delay close port
					setTimeout(function () {
						serialport.close();

						res.setHeader('Content-Type', 'application/json');
						res.status(200);
						res.send(JSON.stringify(null));
					}, 500);
				});
			});
		} catch (err) {
			console.log(err);
			// response with json format (ajax post dataType is json)
			res.setHeader('Content-Type', 'application/json');
			res.status(400);
			res.send(JSON.stringify({
				result: err
			}));
		}
	});

	app.post('/standalone', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({
			standalone: Config.standalone
		}));
	});

	app.post('/version', function (req, res) {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({
			version: Config.version
		}));
	});

	app.post('/port_list', function (req, res) {
		try {
			require('serialport').list(function (err, ports) {
				if (err) throw err;

				var port_list_str = 'none';
				var port_list = [];
				for (var i in ports) {
					if (is_not_null(ports[i].comName) && is_not_null(ports[i].productId) && is_not_null(ports[i].vendorId)) {
						var uid = ports[i].vendorId + ':' + ports[i].productId;
						if (Config.ide.port_vid_pid.indexOf(uid.toLowerCase()) >= 0) {
							port_list.push(ports[i].comName);
							if (i == 0) {
								port_list_str = ports[i].comName;
							}
							else {
								port_list_str += ', ' + ports[i].comName;
							}
						}
					}
				}
				Log.i('serial port enumerated (' + port_list_str + ')');

				res.setHeader('Content-Type', 'application/json');
				res.status(200);
				res.send(JSON.stringify({
					result: port_list
				}));
			});
		} catch (err) {
			console.log(err);
			// response with json format (ajax post dataType is json)
			res.setHeader('Content-Type', 'application/json');
			res.status(400);
			res.send(JSON.stringify({
				result: err
			}));
		}
	});

	app.post('/read_mac', function (req, res) {
		var port_name = req.body['port_name'];
		try {
			var cmd = util.format(
				'"%s" --chip esp32 %s read_mac',
				esptool(),
				'--port "' + port_name + '" --baud 921600'
			);
			exec(ospath(cmd), (err, stdout, stderr) => {
				if (err) throw err;

				var board_id = '';
				var mac_addr = '';
				var strlst = String(stdout).split(/\r?\n/);
				for (var i in strlst) {
					var str = strlst[i];
					var chlst = str.split(':');
					if (chlst.length == 7) {
						board_id = chlst[4] + chlst[5] + chlst[6];
						mac_addr = (chlst[1] + ':' + chlst[2] + ':' + chlst[3] + ':' + chlst[4] + ':' + chlst[5] + ':' + chlst[6]).trim();
					}
				}
				Log.i('reading board mac address (' + mac_addr + ')');

				// response with json format (ajax post dataType is json)
				res.setHeader('Content-Type', 'application/json');
				res.status(200);
				res.send(JSON.stringify({
					board_id: board_id,
					mac_addr: mac_addr
				}));
			});
		} catch (err) {
			Log.i('board mac address (none)');
			console.log(err);
			// response with json format (ajax post dataType is json)
			res.setHeader('Content-Type', 'application/json');
			res.status(400);
			res.send(JSON.stringify({
				result: err
			}));
		}
	});

	var iot_config = [];
	var topics = [];
	var config_flag = false;
	var iot_code = '';
	function gen_iot_code(setup_code, current_setup_code) {
		var trim_code = current_setup_code.trim();
		if (trim_code.substring(0, 10) == 'IOT_CONFIG') {
			config_flag = true;
			var current_line = JSON.parse(
				trim_code.substring(10, trim_code.length));
			iot_config.push(current_line);

			if (topics.indexOf(current_line['topic']) == -1) {
				topics.push(current_line['topic']);
			}
		}
		else {
			config_flag = false;
		}
		if ((config_flag == false) && (iot_config.length != 0)) {
			for (topics_index in topics) {
				var filtered_data = iot_config.filter(a => a.topic == topics[topics_index]);
				if (topics_index == 0) {
					iot_code += '{\\"' + topics[topics_index] + '\\":{';
				}
				else {
					iot_code += '},\\"' + topics[topics_index] + '\\":{';
				}
				for (data_index in filtered_data) {
					if (data_index != 0) {
						iot_code += ',';
					}
					iot_code += filtered_data[data_index]['data'].replace(/"/g, '\\"');
				}
				if (topics_index == topics.length - 1) {
					iot_code += '}';
				}
			}
			iot_code += '}'
			setup_code += '  ' + 'kbiot_setConfig("CFG", "' + iot_code + '");\n';
			setup_code += '  ' + current_setup_code + '\n';
			topics = [];
			iot_config = [];
			iot_code = '';
		}
		else if (config_flag == false) {
			setup_code += '  ' + current_setup_code + '\n';
		}
		return setup_code;
	}

	function check_use_prime_func(code, flag) {
		if (flag === false) {
			return code.includes('check_is_prime');
		}
		return flag;
	}

	function compileFiles(files, index, cflags, plugins_includes_switch, output_dir, cb) {
		var fn = files[index];
		var fn_obj = output_dir + '/' + path.basename(fn.substr(0, fn.lastIndexOf('.')) + '.o');

		Log.i('compiling... ' + path.basename(fn));
		var cmd = util.format('"%s/xtensa-esp32-elf-c++" -std=gnu++11 -fno-rtti -Og -ggdb -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER=\'""\' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE=\'"mbedtls/esp_config.h"\' -DHAVE_CONFIG_H -Iesp32/lib/release/netpie/include %s %s -c "%s" -o "%s"', toolchain_dir, cflags, plugins_includes_switch, fn, fn_obj);
		exec(ospath(cmd), { cwd: __dirname + '/../..' }, (err, stdout, stderr) => {
			if (err) {
				// compile error
				if (cb) {
					cb(err);
				}
			}
			else {
				index++;
				if (index < files.length) {
					compileFiles(files, index, cflags, plugins_includes_switch, output_dir, cb);
				} else {
					if (cb) {
						cb();
					}
				}
			}
		});
	}

	app.post('/build', function (req, res) {
		var board_id = req.body['board_id'];
		var mac_addr = req.body['mac_addr'];
		var kbmac_addr = (mac_addr.replace(/:/g, "")).toUpperCase();
		var md5_mac_addr = md5('K:' + kbmac_addr);

		// console.log('=== ' + kbmac_addr);
		// console.log(md5_mac_addr);

		var sta_ssid = req.body['sta_ssid'];
		var sta_password = req.body['sta_password'];
		var enable_iot = req.body['enable_iot'];
		var start_wifi_code = '';
		var start_iot_code = '';
		var prime_func_code = '';
		var use_prime_func = false;

		if (sta_ssid !== '') {
			if (sta_password !== '') {
				// set wifi and enable wifi
				start_wifi_code = 'wifi_sta_start(CONFIG_WIFI_SSID, CONFIG_WIFI_PASSWORD);\n';
				if (enable_iot === 'true') {
					start_iot_code = 'kbiot_init(KBSERIAL, CLIENTID, USERNAME, PASSWORD);\n\n';
				}
			}
		}

		Log.i('building board id ' + board_id + ' (' + mac_addr + ')');

		var code = new Buffer(req.body['code'], 'base64').toString('utf8');
		// extract setup and task statements
		var var_str = '';
		var code_strlst = code.split('\n');
		var braces_cnt = 0;
		var task_code = '';
		var task_fn_name = [];
		var setup_code = '// setup\n';
		var in_func_flag = false;

		var driver_type_arr = [
			'DEV_IO',
			'DEV_I2C0',
			'DEV_I2C1',
			'DEV_SPI'
		];
		var obj_inst_tab = [];

		for (var code_str_index in code_strlst) {
			var line = code_strlst[code_str_index].replace('\n', '');

			// collect plug-ins object instantiation
			var driver_type = null;
			var line_inst_arr = [];
			for (var dt_index in driver_type_arr) {
				driver_type = driver_type_arr[dt_index];
				var re = new RegExp(driver_type + '\\..*?\\.', 'g'); // https://www.regextester.com/94730
				var m_arr = line.match(re);
				if (m_arr != null) {
					for (var m_index in m_arr) {
						line_inst_arr.push({
							obj_inst: m_arr[m_index],
							drv_type: driver_type
						});
					}
				}
			}

			if (line_inst_arr.length > 0) {
				for (var line_inst_index in line_inst_arr) {
					var obj_inst = line_inst_arr[line_inst_index].obj_inst;
					var drv_type = line_inst_arr[line_inst_index].drv_type;
					var inst = '';
					var cls = '';
					var re = new RegExp(drv_type + '\\..*?\\)', 'g');
					var inst_lst = obj_inst.match(re);

					if (inst_lst != null) {
						inst = inst_lst[0].replace(drv_type + '.', '');
						var cls_lst = inst.match(/.*?\(/g);
						if (cls_lst != null) {
							cls = cls_lst[0].replace('(', '');
						}
					}

					var obj_declare_index = 0;
					// check duplicate object instantiate
					var obj_inst_dup_flag = false;
					for (var inst_index in obj_inst_tab) {
						if (inst == obj_inst_tab[inst_index].instantiate) {
							obj_inst_dup_flag = true;
							break;
						}
						if (cls == obj_inst_tab[inst_index].class) {
							obj_declare_index++;
						}
					}
					if (!obj_inst_dup_flag) {
						obj_inst_tab[inst] = {
							instantiate: inst,
							class: cls,
							dir: cls.toLowerCase(),
							declare: cls.toLowerCase() + '_' + String(obj_declare_index),
							driver: drv_type
						};
					}
				}
			}

			// perform plug-ins object instantiate substitution
			for (var line_inst_index in line_inst_arr) {
				var obj_inst_lst = line_inst_arr[line_inst_index].obj_inst.split('.');
				if (obj_inst_lst.length == 3) {
					line = line.split(line_inst_arr[line_inst_index].obj_inst).join(obj_inst_tab[obj_inst_lst[1]].declare + '.');
				}
			}

			// find variable line
			if (line.substring(0, 4) == 'var ') {
				var_str += line.replace('var', 'double').replace(new RegExp(',', 'g'), '=0,').replace(';', '=0;') + '\n';
				line = '';
			}

			if (line.length <= 0) {
				continue;
			}

			// task function
			if (line.substring(0, 10) == 'void vTask') {
				var tmp_line = line.replace('(', ' ');
				var tmp_linelst = tmp_line.split(' ');
				task_fn_name.push(tmp_linelst[1]);
				task_code += '\n';
				in_func_flag = true;
			}

			var open_brace_cnt = line.split('{').length - 1;
			var close_brace_cnt = line.split('}').length - 1;
			braces_cnt = braces_cnt + open_brace_cnt - close_brace_cnt;

			if (in_func_flag) {
				task_code = gen_iot_code(task_code, line); + '\n'; // generate iot code
				use_prime_func = check_use_prime_func(line, use_prime_func);
				// task_code += (line + '\n');
				if (braces_cnt == 0) {
					in_func_flag = false;
				}
			} else {
				setup_code += (line + '\n');
			}
		}
		if (task_code != '') {
			task_code = task_code + '\n';
		}

		// plug-ins includes
		var plugins_includes_code = '';
		var plugins_includes_switch = '';
		var plugins_sources = [];
		for (var inst_index in obj_inst_tab) {
			for (var i in pluginsInfo[obj_inst_tab[inst_index].dir].incs) {
				plugins_includes_code += '#include "' + pluginsInfo[obj_inst_tab[inst_index].dir].incs[i] + '"\n';
			}
			for (var i in pluginsInfo[obj_inst_tab[inst_index].dir].srcs) {
				plugins_sources.push(pluginsInfo[obj_inst_tab[inst_index].dir].abs_dir + '/' + pluginsInfo[obj_inst_tab[inst_index].dir].srcs[i]);
			}
			plugins_includes_switch += ' -I"' + pluginsInfo[obj_inst_tab[inst_index].dir].rel_dir + '"';
		}

		// plug-ins object instantiate code, ex: SHT31 sht31 = SHT31(64, 0x44, 1000);
		var plugins_obj_inst_code = '';
		for (var inst_index in obj_inst_tab) {
			plugins_obj_inst_code += obj_inst_tab[inst_index].class + ' ' + obj_inst_tab[inst_index].declare + ' = ' + inst_index + ';\n';
		}
		// plug-ins object registration, ex: devman_add(DEV_I2C1, &sht31);
		var plugins_obj_reg_code = '';
		for (var inst_index in obj_inst_tab) {
			plugins_obj_reg_code += '  devman_add(' + obj_inst_tab[inst_index].driver + ',' + ' &' + obj_inst_tab[inst_index].declare + ');\n';
		}

		// add setup code indent
		var setup_code_list = setup_code.split('\n');
		setup_code = '';
		for (var setup_code_index in setup_code_list) {
			use_prime_func = check_use_prime_func(setup_code_list[setup_code_index], use_prime_func);
			setup_code = gen_iot_code(setup_code, setup_code_list[setup_code_index]); // generate iot code
			// setup_code += '  ' + setup_code_list[setup_code_index] + '\n';
		}

		var task_fn_code = '  // create tasks\n';
		for (var task_fn_index in task_fn_name) {
			var task_fn = task_fn_name[task_fn_index];
			//xTaskCreatePinnedToCore(vUserAppTask, "User App Task", USERAPP_STACK_SIZE_MIN, NULL, USERAPP_TASK_PRIORITY, NULL, ARDUINO_RUNNING_CORE);
			//task_fn_code += '  xTaskCreate(' + task_fn + ', "' + task_fn + '", USERAPP_STACK_SIZE_MIN, NULL, USERAPP_TASK_PRIORITY, NULL);\n'
			task_fn_code += '  xTaskCreatePinnedToCore(' + task_fn + ', "' + task_fn + '", USERAPP_STACK_SIZE_MIN, NULL, USERAPP_TASK_PRIORITY, NULL, KIDBRIGHT_RUNNING_CORE);\n';
		}

		if (use_prime_func === true) {
			prime_func_code =
				'bool check_is_prime(int num){\n' +
				'	bool isPrime = true; \n' +
				'	for(int i = 2; i <= int(sqrt(num)); ++i)\n' +
				'	{\n' +
				'		if(num % i == 0){\n' +
				'			isPrime = false;\n' +
				'			break;\n' +
				'		}\n' +
				'	}\n' +
				'	return isPrime;\n' +
				'  }\n';
		}

		var iot_task = 'void iotTask(void *pvParameters) {\n' +
			start_wifi_code +
			start_iot_code +
			'vTaskDelay(500 / portTICK_RATE_MS);\n' +
			'    vTaskDelete(NULL);\n' +
			'}\n';

		var user_app_code =
			'#include <stdio.h>\n' +
			'#include <string.h>\n' +
			'#include "freertos/FreeRTOS.h"\n' +
			'#include "freertos/task.h"\n' +
			'#include "esp_system.h"\n' +
			'#include "kidbright32.h"\n' +
			'#include "devman.h"\n' +
			'#include "ports.h"\n' +
			'#include "button12.h"\n' +
			'#include "ldr.h"\n' +
			'#include "sound.h"\n' +
			'#include "ht16k33.h"\n' +
			'#include "lm73.h"\n' +
			'#include "mcp7940n.h"\n' +
			'#include <math.h>\n' +
			plugins_includes_code +
			'\n' +
			// kbiot
			'#include "nvs_flash.h"\n' +
			'#include "wificontroller.h"\n' +
			'#include "kbiot.h"\n\n' +
			'#define KBSERIAL "' + kbmac_addr + '"\n' +
			'#define CLIENTID "' + kbmac_addr + '"\n' +
			'#define USERNAME "' + md5_mac_addr + '"\n' +
			'#define PASSWORD ""\n' +
			'#define CONFIG_WIFI_SSID "' + sta_ssid + '"\n' +
			'#define CONFIG_WIFI_PASSWORD "' + sta_password + '"\n\n' +
			'#define PI 3.14159265' + '\n' +
			// ===
			'// ==================================================================================\n' +
			'// on-board devices\n' +
			'// ==================================================================================\n' +
			'// i/o devices\n' +
			'PORTS ports = PORTS();\n' +
			'BUTTON12 button12 = BUTTON12();\n' +
			'LDR ldr = LDR();\n' +
			'SOUND sound = SOUND();\n' +
			'// i2c devices\n' +
			'HT16K33 ht16k33 = HT16K33(0, HT16K33_ONBOARD_ADDR);\n' +
			'LM73 lm73_0 = LM73(0, LM73_0_ONBOARD_ADDR); // hardware rev 1.0\n' +
			'LM73 lm73_1 = LM73(0, LM73_1_ONBOARD_ADDR); // hardware from rev 1.1\n' +
			'MCP7940N mcp7940n = MCP7940N(0, MCP7940N_ONBOARD_ADDR);\n' +
			'\n' +
			'// ==================================================================================\n' +
			'// plug-ins devices\n' +
			'// ==================================================================================\n' +
			plugins_obj_inst_code +
			'\n' +
			var_str +
			prime_func_code +
			iot_task +
			task_code + '\n' +
			'void user_app(void) {\n' +
			'xTaskCreatePinnedToCore(iotTask, "iotTask", USERAPP_STACK_SIZE_MIN, NULL, USERAPP_TASK_PRIORITY, NULL, KIDBRIGHT_RUNNING_CORE);\n' +
			'srand(mcp7940n.get(5));\n' + // random seed
			setup_code +
			task_fn_code +
			'}\n' +
			'\n' +
			'void vUserAppTask(void *pvParameters) {\n' +
			'  // init device manager\n' +
			'  devman_init();\n' +
			'\n' +
			'  // ================================================================================\n' +
			'  // add on-board devices\n' +
			'  // ================================================================================\n' +
			'  // i/o devices\n' +
			'  devman_add(DEV_IO, &ports);\n' +
			'  devman_add(DEV_IO, &button12);\n' +
			'  devman_add(DEV_IO, &ldr);\n' +
			'  devman_add(DEV_IO, &sound);\n' +
			'  // i2c0 devices\n' +
			'  devman_add(DEV_I2C0, &ht16k33);\n' +
			'  // i2c1 devices\n' +
			'  devman_add(DEV_I2C1, &lm73_0);\n' +
			'  devman_add(DEV_I2C1, &lm73_1);\n' +
			'  devman_add(DEV_I2C1, &mcp7940n);\n' +
			'\n' +
			'  // ================================================================================\n' +
			'  // add plug-ins devices\n' +
			'  // ================================================================================\n' +
			plugins_obj_reg_code +
			'\n' +
			'  // start device manager\n' +
			'  devman_start();\n' +
			'\n' +
			'  // wait all devices initialized or error\n' +
			'  while (!devman_ready()) {\n' +
			'    vTaskDelay(100 / portTICK_RATE_MS);\n' +
			'  }\n' +
			'\n' +
			'  // real user app\n' +
			'  user_app();\n' +
			'\n' +
			'  // kill itself\n' +
			'  vTaskDelete(NULL);\n' +
			'}\n' +
			'\n' +
			'void UartParser(char *line, char list[][MAX_UART_LINE_CHAR_COUNT], int len) {\n' +
			'  //\n' +
			'}\n';

		try {
			// create build directory
			var board_name = mac_addr.replace(/:/g, '-');
			var user_app_dir = Config.process_dir + '/esp32/build/' + board_name;

			if (!fs.existsSync(Config.process_dir + '/esp32/build/')) {
				fs.mkdirSync(Config.process_dir + '/esp32/build/');
			}
			if (!fs.existsSync(user_app_dir)) {
				fs.mkdirSync(user_app_dir);
			}

			// save to file
			fs.writeFile(user_app_dir + '/user_app.cpp', user_app_code, (err) => {
				if (err) throw err;
				// parse common.mk
				fs.readFile(Config.process_dir + '/esp32/lib/release/common.mk', 'utf8', (err, data) => {
					if (err) throw err;

					// extract RELEASE_DIR, CFLAG+=, LDFLAGS+=
					var release_dir = '';
					var cflags = '';
					var ldflags = '';
					var strlst = data.split('\n');
					for (var i in strlst) {
						var str = strlst[i];
						if (str != "") {
							if (str.indexOf('RELEASE_DIR=') == 0) {
								var lnlst = str.split('=');
								if (lnlst.length == 2) {
									release_dir = lnlst[1];
								}
							}
							if (str.indexOf('CFLAGS+=') == 0) {
								var lnlst = str.split('+=');
								if (lnlst.length == 2) {
									cflags = lnlst[1];
								}
							}
							if (str.indexOf('LDFLAGS+=') == 0) {
								var lnlst = str.split('+=');
								if (lnlst.length == 2) {
									ldflags = lnlst[1];
								}
							}
						}
					}
					cflags = cflags.replace(/\$\(RELEASE_DIR\)/g, 'esp32/' + release_dir);
					ldflags = ldflags.replace(/\$\(RELEASE_DIR\)/g, 'esp32/' + release_dir);

					// add user_app into sources
					plugins_sources.push(user_app_dir + '/user_app.cpp');
					// compile
					compileFiles(plugins_sources, 0, cflags, plugins_includes_switch, user_app_dir, (err) => {
						if (err) {
							console.log(err);
							// response with json format (ajax post dataType is json)
							res.setHeader('Content-Type', 'application/json');
							res.status(400);
							res.send(JSON.stringify({
								result: 'error'
							}));
						}
						else {
							var obj_files = '';
							for (var i in plugins_sources) {
								var fn = plugins_sources[i];
								if (i == 0) {
									obj_files += '"' + user_app_dir + '/' + path.basename(fn.substr(0, fn.lastIndexOf('.')) + '.o') + '"';
								} else {
									obj_files += ' "' + user_app_dir + '/' + path.basename(fn.substr(0, fn.lastIndexOf('.')) + '.o') + '"';
								}
							}
							// create libmain
							Log.i('archiving... libmain.a');
							var cmd = util.format('"%s/xtensa-esp32-elf-ar" cru "%s/libmain.a" %s', toolchain_dir, user_app_dir, obj_files);
							exec(ospath(cmd), { cwd: __dirname + '/../..' }, (err, stdout, stderr) => {
								if (err) {
									console.log(err);
									// response with json format (ajax post dataType is json)
									res.setHeader('Content-Type', 'application/json');
									res.status(400);
									res.send(JSON.stringify({
										result: 'error'
									}));
								}
								else {
									// link
									Log.i('linking... ' + board_name + '.elf');
									var cmd = util.format('"%s/xtensa-esp32-elf-gcc" -nostdlib -u call_user_start_cpu0  -Wl,--gc-sections -Wl,-static -Wl,--start-group %s -L"%s" -lgcc -lstdc++ -lgcov -Wl,--end-group -Wl,-EL -o "%s/%s.elf"', toolchain_dir, ldflags, user_app_dir, user_app_dir, board_name);
									exec(ospath(cmd), { cwd: __dirname + '/../..' }, (err, stdout, stderr) => {
										if (err) {
											console.log(err);
											// response with json format (ajax post dataType is json)
											res.setHeader('Content-Type', 'application/json');
											res.status(400);
											res.send(JSON.stringify({
												result: 'error'
											}));
										}
										else {
											// create bin
											Log.i('creating bin image... ' + board_name + '.bin');
											var cmd = util.format(
												'"%s" --chip esp32 elf2image --flash_mode "dio" --flash_freq "40m" --flash_size "4MB" -o "%s" "%s/%s.elf"',
												esptool(),
												user_app_dir + '/' + board_name + '.bin',
												user_app_dir,
												board_name
											);
											exec(ospath(cmd), { cwd: __dirname + '/../..' }, (err, stdout, stderr) => {
												if (err) {
													console.log(err);
													// response with json format (ajax post dataType is json)
													res.setHeader('Content-Type', 'application/json');
													res.status(400);
													res.send(JSON.stringify({
														result: 'error'
													}));
												}
												else {
													res.setHeader('Content-Type', 'application/json');
													res.status(200);
													res.send(JSON.stringify({
														result: 'ok'
													}));
												}
											});
										}
									});
								}
							});
						}
					});
				});
			});

		} catch (err) {
			console.log(err);
			// response with json format (ajax post dataType is json)
			res.setHeader('Content-Type', 'application/json');
			res.status(400);
			res.send(JSON.stringify({
				result: 'error'
			}));
		}
	});

	app.post('/program', function (req, res) {
		var board_id = req.body['board_id'];
		var mac_addr = req.body['mac_addr'];
		var port_name = req.body['port_name'];

		Log.i('programing board id ' + board_id + ' (' + mac_addr + ')');
		try {
			var board_name = mac_addr.replace(/:/g, '-');
			var user_app_dir = Config.process_dir + '/esp32/build/' + board_name;
			var release_dir = Config.process_dir + '/esp32/lib/release';

			// program
			var cmd = util.format(
				'"%s" --chip esp32 %s --before "default_reset" --after "hard_reset" write_flash -z --flash_mode "dio" --flash_freq "40m" --flash_size detect 0x1000 "%s" 0x8000 "%s" 0x10000 "%s"',
				esptool(),
				'--port "' + port_name + '" --baud 921600',
				release_dir + '/bootloader.bin',
				release_dir + '/partitions_singleapp.bin',
				user_app_dir + '/' + board_name + '.bin'
			);
			exec(ospath(cmd), { cwd: __dirname + '/../..' }, (err, stdout, stderr) => {
				if (err) throw err;

				res.setHeader('Content-Type', 'application/json');
				res.status(200);
				res.send(JSON.stringify({
					result: 'ok'
				}));
			});
		} catch (err) {
			console.log(err);
			// response with json format (ajax post dataType is json)
			res.setHeader('Content-Type', 'application/json');
			res.status(400);
			res.send(JSON.stringify({
				result: 'error'
			}));
		}
	});

	app.post('/gen_qr', function (req, res) {
		var path = __dirname + '/../public/images/qrcode.png';
		var mac_addr = req.body['mac_addr'];
		QRCode.toFile(path, mac_addr, {
			color: {
				dark: '#000', // Blue modules
				light: '#0000' // Transparent background
			}
		}, function (err) {
			if (err) throw err;
			res.setHeader('Content-Type', 'application/json');
			res.status(200);
			res.send(JSON.stringify({
				result: 'ok'
			}));
		});
	});

	function createCategory(cats, index, cb) {
		fs.readdir(ospath(plugins_dir + '/' + cats[index].directory), (err, drivers) => {
			if (!err) {
				drivers.forEach(driver => {
					var dir = plugins_dir + '/' + cats[index].directory + '/' + driver;
					try {
						if (driver == (cats[index].directory + '.json')) {
							cats[index].category = JSON.parse(fs.readFileSync(dir), 'utf8');
						} else {
							// check directory
							if (fs.lstatSync(dir).isDirectory(dir)) {
								try {
									pluginsInfo[driver] = {
										abs_dir: dir,
										rel_dir: 'plugins/' + cats[index].directory + '/' + driver,
										srcs: [],
										incs: []
									};

									// extract block definitions
									var Blockly = {
										Blocks: []
									};
									eval(fs.readFileSync(dir + '/blocks.js').toString());
									var blocks = [];
									var block_cnt = 0;
									for (var i in Blockly.Blocks) {
										blocks.push(i);
										block_cnt++;
									}

									try {
										// extrack block generators
										var Blockly = {
											JavaScript: []
										};
										eval(fs.readFileSync(dir + '/generators.js').toString());
										var generators = [];
										var generator_cnt = 0;
										for (var i in Blockly.JavaScript) {
											generators.push(i);
											generator_cnt++;
										}

										Log.i('plugin "' + driver + '" found ' + block_cnt + (block_cnt > 1 ? ' blocks' : ' block'));
										cats[index].plugins.push({
											name: driver,
											blocks: blocks
										});
									} catch (e) {
										Log.e('plugin "' + driver + '" generators.js error');
									}
								} catch (e) {
									Log.e('plugin "' + driver + '" blocks.js error');
								}

							}
						}
					} catch (e) {
						// exception on not directory
					}
				});
			}

			index++;
			if (index < cats.length) {
				createCategory(cats, index, cb);
			} else {
				if (cb) {
					cb();
				}
			}
		});
	}

	function listFiles(drivers, index, cb) {
		var dir = pluginsInfo[drivers[index]].abs_dir;
		fs.readdir(ospath(dir), (err, files) => {
			if (!err) {
				files.forEach(file => {
					if (fs.lstatSync(dir + '/' + file).isFile(dir + '/' + file)) {
						// source file (*.c, *.cpp)
						if ((file.match(/\.c$/g) != null) || (file.match(/\.cpp$/g) != null)) {
							pluginsInfo[drivers[index]].srcs.push(file);
						}
						// header file (*.h)
						if (file.match(/\.h$/g) != null) {
							pluginsInfo[drivers[index]].incs.push(file);
						}
					}
				});
			}

			index++;
			if (index < drivers.length) {
				listFiles(drivers, index, cb);
			} else {
				if (cb) {
					cb();
				}
			}
		});
	}

	app.post('/plugins', function (req, res) {
		Log.i('loading plugins...');
		fs.readdir(ospath(plugins_dir), (err, categories) => {
			if (err) {
				Log.e('no plugins directory');
				res.setHeader('Content-Type', 'application/json');
				res.send(JSON.stringify({
					categories: []
				}));
			} else {
				// categories
				var cats = [];
				categories.forEach(category => {
					cats.push({
						directory: category,
						plugins: [],
						category: null
					});
				});

				pluginsInfo = [];
				createCategory(cats, 0, () => {
					// list plugins files
					var drivers = [];
					for (var driver in pluginsInfo) {
						drivers.push(driver);
					}
					listFiles(drivers, 0, () => {
						// response
						res.setHeader('Content-Type', 'application/json');
						res.send(JSON.stringify({
							categories: cats
						}));
					});

				});
			}
		});
	});

	function createPluginsJs(cats, index, req, res, cb) {
		fs.readdir(ospath(plugins_dir + '/' + cats[index]), (err, drivers) => {
			if (!err) {
				// default language
				var lang = 'en';
				if (is_not_null(req.cookies.lang)) {
					lang = req.cookies.lang;
				}
				// collect drivers
				drivers.forEach(driver => {
					var dir = plugins_dir + '/' + cats[index] + '/' + driver;
					try {
						// check directory
						if (fs.lstatSync(dir).isDirectory(dir)) {
							res.write(fs.readFileSync(dir + '/msg/' + lang + '.js'));
							res.write(fs.readFileSync(dir + '/blocks.js'));
							res.write(fs.readFileSync(dir + '/generators.js'));
						}
					} catch (e) {
						// exceptions
						console.log(e);
					}
				});
			}

			index++;
			if (index < cats.length) {
				createPluginsJs(cats, index, req, res, cb);
			} else {
				if (cb) {
					cb();
				}
			}
		});
	}

	app.get('/plugins.js', function (req, res) {
		// creating plugins.js
		fs.readdir(ospath(plugins_dir), (err, categories) => {
			if (err) {
				Log.e('no plugins directory');
				res.send('');
			} else {
				createPluginsJs(categories, 0, req, res, () => {
					res.end();
				});
			}
		});
	});

	app.get('*', function (req, res) {
		res.render('404', {
			title: 'Page Not Found'
		});
	});
};
