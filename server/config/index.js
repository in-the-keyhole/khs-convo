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

module.exports = {
    port: process.env.PORT || 3001,
    url: process.env.HEROKU_URL || 'http://localhost:3001/' ,
    jwt_secret: process.env.jwt_secret || 'lfanflaefknawelf',
    jwt_expires: process.env.jwt_expires || 3600,
    mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/khs-convo',
    passwordCrypto: process.env.passwordCrypto || "k2312lk3m12l31",
    event_dir: process.env.event_dir || './server/convoevents',
    timerevent_dir: process.env.timerevent_dir || './server/timerevents',
    uploaded_event_dir: './server/services/convo/events',
    template_dir: process.env.template_dir || 'server/convoevents',
    ping_url: process.env.PING_URL || 'http://khs-convo-dev.herokuapp.com',
    slack: {
        webhookUri: 'your slack webhook here',
        channel:  '<channel name>',
        userName: '<user name>',
        successMessage:  'You Success Message here',
        failureMessage: 'You failure message here '
    },
    twilio: {
        accountSid: process.env.accountSid || '<twilio account sid>',
        authToken: process.env.authToken || '<twilio auth token>',
        phone: process.env.PHONE || '<twilio phone #?'
    },
}
