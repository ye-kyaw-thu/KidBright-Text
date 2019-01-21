const fs = require('fs');
const http = require('http');
const express = require('express');
const nocache = require('nocache');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jade = require('jade');
const Log = require('./log');
const Config = require('./config.json');
const version = require('../package.json').version;
const port = global.gPort || Config.webserver.port;

module.exports = {
	init: function (process_dir, snapshot_flag) {
		Config.version = version;
		Config.process_dir = process_dir;
		Config.snapshot_flag = snapshot_flag;
		// setup log print
		if (Config.log.info) {
			Log.log_flag |= Log.info;
		}
		if (Config.log.error) {
			Log.log_flag |= Log.error;
		}
		if (Config.log.debug) {
			Log.log_flag |= Log.debug;
		}

		// check and create data directory
		var data_dir = Config.process_dir + '/' + Config.ide.directories.data;
		if (!fs.existsSync(data_dir)) {
			fs.mkdirSync(data_dir);
		}

		// setup express app
		const app = express();
		app.locals.pretty = true;
		app.set('views', __dirname + '/server/views');
		app.set('view engine', 'jade');
		app.use(cookieParser());
		app.use(bodyParser.json({
			limit: '50mb'
		}));
		app.use(bodyParser.urlencoded({
			extended: true,
			limit: '50mb'
		}));

		app.use(nocache());
		app.use(express.static(__dirname + '/public'));

		require(__dirname + '/server/routes.js')(app, Config, Log);

		http.createServer(app).listen(port, function () {
			Log.i('webserver listening on port ' + port);
		});
	}
};
