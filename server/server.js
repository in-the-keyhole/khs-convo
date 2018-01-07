/*
Copyright 2017 Keyhole Software LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var http = require('http');
var express = require('express');

var log4js = require('log4js');
var config = require('./config');
var bodyParser = require('body-parser');
var mongo = require('./services/mongo');
var cors = require('cors')
var fs = require('fs');
var path = require('path');
var nr = require('newrelic');

var request = require('request');
var logger = log4js.getDefaultLogger();
var app = express();

var timesheetnotification = require('./timesheetnotification.js');
var timerUtils = require("./services/timerUtils.js");

const util = require('util');

//parse json bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

//log all requests to console for debugging
app.use('*', function (req, res, next) {
    logger.info('request: ' + req.originalUrl);
    next();
});

app.use(express.static('assets'));
app.use(express.static('build'));

//include all api's
require('./api')(app);

app.use('/*', function(req, res){
    res.send(fs.readFileSync('./build/index.html', 'utf8'));
});

//listen on port in config || convo_port env 
http.createServer(app).listen(config.port, () => {
    logger.info('App Listening on port: ' + config.port);

    // ping server to keep from sleeping
    var http = require("http");
    setInterval(function() {
       http.get(config.ping_url);
       console.log("Pinging Server to keep from sleeping");
    }, 300000); // every 5 minutes (300000)

    // Startup Timesheet Notification timer process 
    // TODO: Need to make this a configurable not required 
   //   timerUtils.setupTimer(timesheetnotification.process);
});

