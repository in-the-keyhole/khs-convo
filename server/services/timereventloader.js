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

var log4js = require('log4js');
var logger = log4js.getLogger();
var fs = require('fs');
var config = require('../config');
var path = require('path');

module.exports = {
    load: function() {
        logger.info('TimerEventLoader: load()');


        // Remove expired Scheduled Notifications and process others
        try {
            var tmp2 = require('./convo/scheduledNotifications.js');

            if(typeof tmp2.removeExpired === 'function') {
                tmp2.removeExpired();
            }

            if(typeof tmp2.process === 'function') {
                logger.info('TimerEventLoader: Loading - scheduledNotifications.js');
                module.exports.setupTimer(tmp2.process, tmp2.config);
            }
        } 
        catch (err){
            console.log("NO SCHEDULE NOTIFICATIONS FILE");
        }

        

        var filepath = config.timerevent_dir;

        // Read current directory contents
        fs.readdir(filepath, function (err, filenames) {
            if (err) {
                logger.error(err);
                return;
            }
            
            if(filenames.length > 0) {
                // Loop thru filenames
                filenames.forEach(function (filename, index) {
                        fs.stat(filepath + '/' + filename, function (err, stats) {
                        // Only look at files
                        if(stats.isFile()) {
                            var tmp = require('../../' + filepath + '/' + filename);

                            // If there is a "process()", then setup timer
                            if(typeof tmp.process === 'function') {
                                logger.info('TimerEventLoader: Loading - ' + filepath + '/' + filename);
                                module.exports.setupTimer(tmp.process, tmp.config);
                            }  else {
                                logger.error('TimerEventLoader: No process() found in: ' + filepath + '/' + filename);
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
        if (callback !== null) {
            let timerName = typeof timerconfig.timerName === 'string' ? timerconfig.timerName : config.timerevent_timerName_default;
            let callbackDelay = typeof timerconfig.callbackDelay === 'number' && timerconfig.callbackDelay > 0 ? timerconfig.callbackDelay : config.timerevent_callbackDelay_default;
            let callbackMaxRun = typeof timerconfig.callbackMaxRun === 'number' ? timerconfig.callbackMaxRun : config.timerevent_callbackMaxRun_default;
            logger.debug('   setupTimer: timerName: ' + timerName);
            logger.debug('   setupTimer: callbackDelay: ' + callbackDelay);
            logger.debug('   setupTimer: callbackMaxRun: ' + callbackMaxRun);

            let runCallbackCount = 0;

            // Run callback initially
            logger.info('Running: ' + timerName + ': ' + (runCallbackCount+1) + (callbackMaxRun > 0 ? ' of ' + callbackMaxRun : ''));
            try {
            callback(); }
            catch(e) { logger.info("Error executing Process "+timerName+" - "+e) }
            runCallbackCount++;

            // Create setInterval if needed to run more than 1 time
            if(callbackMaxRun === 0 || callbackMaxRun > 1) {
                // Setup setInterval() using parameters
                let si = setInterval(function() {
                    logger.info('Running: ' + timerName + ': ' + (runCallbackCount+1) + (callbackMaxRun > 0 ? ' of ' + callbackMaxRun : ''));
                    try {
                    callback();
                    } catch(e) { logger.info("Error executing Process "+timerName+" - "+e)      }
                    runCallbackCount++;
                
                    // If there is a max number of calls, then evaluate and stop if necessary
                    if(callbackMaxRun > 1 && runCallbackCount >= callbackMaxRun) {
                        logger.info('* Stopping: ' + timerName);
                        clearInterval(si);
                    } 
                }, callbackDelay);
            }
        } 
        else {
            logger.error('No callback passed in');
        }
    }
}
