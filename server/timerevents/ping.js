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

const config = require('../config');
const log4js = require('log4js');
const logger = log4js.getLogger();
const request = require('http-basic');

logger.level = 'debug';

module.exports = {
    config: {
        timerName: 'Ping Timer',
        callbackDelay: 0,
        callbackMaxRun: 0
    },

    process: function() {
        if(config.ping_url) {
            request('GET', config.ping_url, {},  (err, res) => {
                if (err){
                    logger.info(`\tTimer ping of server ${err}`);
                } else {
                    logger.info(`\tTimer ping of server: ${res.statusCode}`);
                }
            });
        }
    }
}
