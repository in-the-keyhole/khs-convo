# Twilio Integration 

KHS{Convo} is integreated with SMS capability the [Twilio](http://twilio.com) api SMS services.    

This is done by configuring Twilio to route SMS messages to a running KHS{Convo} 
instance.  KHS{Convo} will execute a matching event and return a result through Twilio to the SMS device, as is depicted below. 

![](./images/architecture.png)
 
## Configuring Twilio to forward to KHS{Convo}

Here are the steps to configure a Twilio SMS service that points to KHS{Convo}

`1.` Login into your Twilio account. 

`2.` Navigate to your `console`

`3.` Click `All Products and Services` and select `Programmable SMS`

`4.` Select `Messaging Service` 

`5.` Click the `+` add button, and enter the following 

     `Use Case:` Notitifcations 2 - Way

`6.` Enter the configuration options shown below, and `save`.

   ![](./images/twilio.png)  


## Configuring KHS{Convo} 

You will need to configure 



In the `server/config/index.js` add Twilio configuration

twilio: {
        accountSid: process.env.accountSid || '<twilio account sid>',
        authToken: process.env.authToken || '<twilio auth token>',
        phone: process.env.PHONE || '<twilio phone #>'
    },

