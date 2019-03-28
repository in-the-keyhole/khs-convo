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

const log4js = require('log4js');
const logger = log4js.getLogger();
const fs = require('fs');
const config = require('../config');
// const path = require('path');

logger.level = 'debug';

module.exports = {

    load: function() {
        logger.info('TimerEventLoader: load()');

        // Remove expired Scheduled Notifications and process others
        try {
            const tmp2 = require('./convo/scheduledNotifications.js');

            if(typeof tmp2.removeExpired === 'function') {
                tmp2.removeExpired();
            }

            if(typeof tmp2.process === 'function') {
                logger.info('TimerEventLoader: Loading - scheduledNotifications.js');
                module.exports.setupTimer(tmp2.process, tmp2.config);
            }
        }
        catch (err){
            logger.error("NO SCHEDULE NOTIFICATIONS FILE");
        }


        const filepath = config.timerevent_dir;

        // Read current directory contents
        fs.readdir(filepath, function (err, filenames) {
            if (err) {
                logger.error(err);
                return;
            }

            if(filenames.length > 0) {
                // Enumerate filenames
                filenames.forEach( (filename) => {
                        fs.stat(filepath + '/' + filename, function (err, stats) {
                        // Only look at files
                        if(stats.isFile()) {
                            const tmp = require(`../../${filepath}/${filename}`);

                            // If there is a "process()", then setup timer
                            if(tmp.process && typeof tmp.process === 'function') {
                                logger.info(`===> TimerEventLoader: Loading - ${filepath}/${filename}`);
                                module.exports.setupTimer(tmp.process, tmp.config);
                            }  else {
                                logger.error(`TimerEventLoader: No process() found in: ${filepath}/${filename}`);
                            }
                        }
                    });
                });
            } else {
                logger.warn('TimerEventLoader: No TimerEvent files to load');
            }
        });
    },

    setupTimer: function( callback = null, timerconfig = {} ) {

        if ( callback ) {
            const timerName = typeof timerconfig.timerName === 'string'
                ? timerconfig.timerName
                : config.timerevent_timerName_default;

            const callbackDelay = typeof timerconfig.callbackDelay === 'number' && timerconfig.callbackDelay > 0
                ? timerconfig.callbackDelay
                : config.timerevent_callbackDelay_default;

            const callbackMaxRun = typeof timerconfig.callbackMaxRun === 'number'
                ? timerconfig.callbackMaxRun
                : config.timerevent_callbackMaxRun_default;

            logger.debug(`\tsetupTimer: timerName: ${timerName}`);
            logger.debug(`\tsetupTimer: callbackDelay: ${callbackDelay}`);
            logger.debug(`\tsetupTimer: callbackMaxRun: ${callbackMaxRun}`);

            let runCallbackCount = 0;


            // Always run callback initially with zero delay
            logger.info(`==> setupTimer initial call: ${timerName}: ${runCallbackCount + 1}${callbackMaxRun > 0 ? ' of ' + callbackMaxRun : ''}`);
            callback();
            runCallbackCount++;

            // Delay any subsequent callbacks by configured interval
            if ( callbackMaxRun > 1 ) {
                // Setup setInterval() using parameters
                const si = setInterval(() => {
                    logger.info(`setupTimer subsequent call: ${timerName}: ${runCallbackCount + 1}${callbackMaxRun > 0 ? ' of ' + callbackMaxRun : ''}`);
                    callback();
                    runCallbackCount++;

                    // If there is a max number of calls, then evaluate and stop if necessary
                    if( runCallbackCount >= callbackMaxRun) {
                        logger.info(`* Stopping: ${timerName}`);
                        clearInterval(si);
                    }
                }, callbackDelay);
            }

        }
        else {
            logger.ar('No callback passed in');
        }
    }

};
