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

const mongo = require('./server/services/mongo');
const uuid = require('uuid');
const crypto = require('crypto');
const secret = process.env.passwordCrypto || "k2312lk3m12l31";


const id = uuid();

function encodePassword(password) {
    const hash = crypto.createHmac('sha512', secret);
    hash.update(password);
    return hash.digest('hex');
}


const Prompt = require('prompt-password');
const prompt = new Prompt({
    type: 'password',
    message: 'Please set the admin password:',
    name: 'password'
});

// noinspection JSUnresolvedFunction
prompt.run()
  .then(function(password) {
    console.log(password);

  mongo.Update({ Username: 'admin'},  {
             uuid: id,
             Username: 'admin',
             FirstName: 'Admin',
             LastName: 'User',
             Name: 'Admin User',
             Status: 'admin'
            }, 'Users', {upsert: true})
            .then( () => {

                mongo.Update(
                    {uuid: id},
                    {uuid: id, password: encodePassword(password)},
                    'Passwords',
                    { upsert: true })
                .then(function () {

                    console.log("Admin user added. Pleae log in, change password, or add other users ...");
                    process.exit();
                })
            });


 });
