# Timer Events

Timer Events can be created to run code at any particular interval and for however long you want it to run.

Timer Event files must be placed in the directory defined by the `timerevent_dir` value defined in `server/config/index.js`.  This is initially defined as './server/timerevents'.  This directory will be scanned at application startup and any files that have a `process` method defined, will be loaded.

## Timer Event file

A Timer Event file must have a method named `process`.  
This method will be what is called at the determined interval.

A Timer Event file can optionally have a JSON object property named `config`, which can contain the following attributes:
* `timerName` = The name used to identify timer in logging
* `callbackDelay` = The interval between calling the timer
* `callbackMaxRun` = The number of times to run timer

The following are the defaults initially defined for these attributes in `server/config/index.js`:
* `timerevent_timerName_default` =       'Unnamed Timer'
* `timerevent_callbackDelay_default` =   60*1000 (or 1 minute)
* `timerevent_callbackMaxRun_default` =  0 (or forever)


## Example Timer Event file

The following is an example of a Hello World timer.  From looking at the `config`, you can see that it has been set to run every 8 seconds and will only run for 3 times.

    'use strict';

    var log4js = require('log4js');
    var logger = log4js.getDefaultLogger();

    module.exports = {
        config: { 
            timerName: 'Hello World Timer',
            callbackDelay: 8000,
            callbackMaxRun: 3
        },

        process: function() {
            logger.info('   helloworld.process() called');
            module.exports.sayHello();
        },
    
        sayHello: function() {
            logger.info('   helloworld.sayHello()');
        }
    }


