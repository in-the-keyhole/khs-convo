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
const logger = require('log4js').getLogger();
const ping = require('ping');

logger.level = 'debug';

const timerName = 'Ping Timed Event';

module.exports = {

    process: function () {

        if (config.ping_url) {
            // Contain any throw to protect server
            try {
                // Pluck host from configured URL
                const host = (url => (url.indexOf('//') > -1 ? url.split('/')[2] : url.split('/')[0]))(config.ping_url) ;

                ping.sys.probe(host,  isAlive => {
                    const msg =`${timerName}: host "${host}" is `;
                    logger.info(`${msg} ${isAlive ? "ALIVE" : "DEAD"}`);
                });
            } catch (err) {
                logger.error(`ping timer event may have a malformed ping URL configured`);
            }

        } else {
            logger.error(`ping timer event has no ping URL configured`);
        }
    }
}
