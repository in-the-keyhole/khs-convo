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
var logger = log4js.getDefaultLogger();

// Default Callback Delay is 1 minute
var callbackDelayDefault = 60*1000;

module.exports = {
// Usage:
//      var timerUtils = require("./services/timerUtils.js");
//
//      The "callback" can be:
//          A method of an object
//          A local method defined
//          An anonymous method define inline
//
//      The "callbackDelay" default is 1 minute, if 0 or no value is passed the default will be used
//
//      The "callbackMaxRun" default is 0 which is "forever". This is the number of times to run the "callback"
//
//      This sets up the callback to run every minute, forever
//          timerUtils.setupTimer(timesheetnotification.process);
//      This setup the callback to run every 5 minutes, forever
//          timerUtils.setupTimer(timesheetnotification.process, 60*1000*5);
//      This setup the callback to run every 5 minutes, will run 6 times
//          timerUtils.setupTimer(timesheetnotification.process, 60*1000*5, 6);
//
setupTimer: function(callback = '', callbackDelay = callbackDelayDefault, callbackMaxRun = 0) {
        if (callback !== '') {
            // Allow user to pass 0 and get default
            callbackDelay = callbackDelay > 0 ? callbackDelay : callbackDelayDefault;

            let runCallbackCount = 0;
            let callbackName = callback.name !== '' ? callback.name : 'anonymous';

            // Run callback initially
            callback();

            // Setup setInterval() using parameters
            var si = setInterval(function() {
                runCallbackCount++;
                logger.info('Running: ' + callbackName + '(): ' + runCallbackCount + (callbackMaxRun > 0 ? ' of ' + callbackMaxRun : ''));
                callback();
            
                // If there is a max number of calls, then evaluate and stop if necessary
                if(callbackMaxRun > 0 && runCallbackCount === callbackMaxRun) {
                    logger.info('Stopping: ' + callbackName + '()');
                    clearInterval(si);
                } 
            }, callbackDelay);
        } 
        else {
            logger.info('No callback passed in');
        }
    }
}
