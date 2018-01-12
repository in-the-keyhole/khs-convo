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

var log4js = require('log4js');
var logger = log4js.getDefaultLogger();

var timesThru = 0;

module.exports = {
    config: { 
        timerName: 'Hello World Timer',
        callbackDelay: 8000,
        callbackMaxRun: 3
    },

    process: function() {
        timesThru++;
        logger.info('   helloworld.process() called');

        module.exports.sayHello();
    },
 
    sayHello: function() {
        logger.info('   helloworld.sayHello()');
    }
}