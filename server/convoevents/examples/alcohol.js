var StateService = require('../../services/stateservice');

module.exports = function (events) {

    var event = {};
    event.isAuth = false;
    event.description = 'Drinking Age';
    event.words = [{
        word: 'drink',
        value: 10
    }];

     event.states = [
        { reply: 'When you where born (mm/dd/yyyy) ?', validator: 'date', state: 'ask'},
        {    
           transition:
                 function(session, request, event) {
                    var birthday = +new Date(request.question[0]);
                    var age =  ~~((Date.now() - birthday) / (31557600000));
                    return age >= 21 ? 'legal' : 'illegal'; 
                 }, 
                 state: 'calc'},
                     
        { reply: 'You are Legal to Drink', postAction: 'stop', state: 'legal'},
        { reply: 'To young to dring, sorry', postAction: 'stop', state: 'illegal'}
    ];

    event.run = function (request) {

        return new Promise(function (resolve, reject) {
            return resolve(StateService.doStates(event, request));
        })

    }

    events.push(event);

}