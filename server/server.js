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

const http = require('http');
const express = require('express');
const log4js = require('log4js');
const logger = log4js.getLogger();
const config = require('./config');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

logger.level = 'debug';

const app = express();

const timerEventLoader = require('./services/timereventloader');

// parse json bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

// log all requests to console for debugging
app.use('*', function (req, res, next) {
    logger.info(`request: ${req.originalUrl}`);
    next();
});

app.use(express.static('assets'));
app.use(express.static('build'));

// include all api's
require('./api')(app);

app.use('/*', function(req, res){
    res.send(fs.readFileSync('./build/index.html', 'utf8'));
});

// listen on port in config || convo_port env
const port = config.port;
http.createServer(app).listen(port, () => {
    logger.info(`App Listening on port: ${port}`);
    timerEventLoader.load();
});
