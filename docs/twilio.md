### Configuring Twilio 
KHS{convo} SMS functionality is based on a Twilio account.

In the `server/config/index.js` add Twilio configuration

twilio: {
        accountSid: process.env.accountSid || '<twilio account sid>',
        authToken: process.env.authToken || '<twilio auth token>',
        phone: process.env.PHONE || '<twilio phone #>'
    },

