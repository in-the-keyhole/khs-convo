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
    mongodb: process.env.MONGODB_URI || 'mongodb://heroku_gcs4053b:ld4t5rv5a8u8c64iivqrr374k8@ds131687.mlab.com:31687/heroku_gcs4053b',
    passwordCrypto: process.env.passwordCrypto || "k2312lk3m12l31",
    twilio: {
        accountSid: process.env.accountSid || "AC94e84f13ebab85027b860d213b20d636",
        authToken: process.env.authToken || "5e3cbdf99849e9fae3e294e83b47502b",
        phone: process.env.phone || '19132700360'
    },
    slack: {
        webhookUri: "https://hooks.slack.com/services/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",
        channel: "jenkins",
        userName:"Keyhole",
        successMessage: "Open Shift Build/Deploy Success.",
        failureMessage:"Open Shift Build/Deploy failure."
    },
    event_dir: process.env.event_dir || './server/convoevents',
    uploaded_event_dir: './server/services/convo/events',
    template_dir: process.env.template_dir || 'server/convoevents',
    timesheet: {
        host: process.env.TIMESHEET_HOST || 'keyhole-timesheet-staging.herokuapp.com',
        port: process.env.TIMESHEET_PORT || '80',
        url: process.env.TIMESHEET_URL || 'http://keyhole-timesheet-staging.herokuapp.com'
    },
    session_timeout: process.env.TIMESHEET_URL || 5,
    ping_url: process.env.PING_URL || 'http://khs-convo-dev.herokuapp.com',
    smtp_user: 'grokola@keyholesoftware.com',
    smtp_password: '%KeyholeGrokola',
    sample_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InZwZW5kZXJncmFzcyIsImRhdGUiOjE1MTE5MzY2NDUxNjYsInN0YXR1cyI6ImFkbWluIiwiaWF0IjoxNTExOTM2NjQ1LCJleHAiOjE1MTM0NDg1ODU0MTF9.hM3YQc0c7-VHyAxxzHzPBoed6Gx1duxGxIlFSo4BjXw'
}
