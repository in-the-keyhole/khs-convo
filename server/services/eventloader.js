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

logger.level = 'debug';

function Loader() {
}


Loader.prototype.loadevents = function (pathArg, events) {

    const path = pathArg || config.event_dir;

    path.split(',').forEach(thePath => readDirectory(thePath, events));

    if (path && path.indexOf('upload...') > -1) {
        const arr = path.split('...');
        const convoEventPath = `convoevents/${arr[2]}`;
        try {
            require(`../${convoEventPath}/${arr[1]}`)(events);
        } catch (e) {
            logger.error(`Error Loading Single Event ... ${arr[1]}`);
            throw(new Error(e));
        }
        logger.info(`Loaded Single Event - ${arr[1]}`);
    }
};


function readDirectory(pathArg, events) {

    const path = pathArg.trim();

    fs.readdir(path, function (err, filenames) {

        if (err) {
            logger.error(err);
            throw(new Error(err));
        }
        filenames.forEach(function (filename, index) {

            fs.stat(`${path}/${filename}`, function (err, stats) {

                    if (!stats.isDirectory()) {
                        if (filename.indexOf('.js') > 0 && filename.indexOf('index.js') < 0) {

                            try {
                                const convoEvent = require(`../../${path}/${filename}`);
                                if (typeof convoEvent === 'function') {
                                    convoEvent(events);
                                } else {
                                    logger.error(`Not loaded: ${path}/${filename}. It is not a convo event.`)
                                }
                            } catch (err2) {
                                throw (new Error(`Error Loading Event...${filename}\n${err2}`));
                            }
                            events[(events.length - 1)].filename = filename;
                            logger.debug(`Loaded Event  - ${path}/${filename}`);
                        }
                    } else {

                        new Loader().loadevents(`${path}/${filename}`, events);
                        logger.debug(`Called loadevents of directory ${path}/${filename}`);
                        return;

                    }

                }
            );
        });
    });

}

module.exports = Loader;
