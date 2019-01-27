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

const AuthenticationService = require('../../services/authentication');
const logger = require('log4js').getLogger();
logger.level = 'debug';

function login(req, res) {
    console.log(req.body);
    const username = req.body['username'] || '';
    const password = req.body['password'] || '';
    if (username === '' || password === '') {
        res.sendStatus(403);
    }
    AuthenticationService.auth(username, password)
        .then(function (response) {


            res.send(response);
        })
        .catch( () => {
            res.sendStatus(403);
        });

}

function register(req, res) {

    AuthenticationService.register(req, res)
        .then(function (response) {
            res.send(response);
        })
        .catch( () => {
            res.sendStatus(403);
        });


}


module.exports = {
    login: login,
    register: register
};

