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

import React, { Component } from 'react';
import ajax from '../util/ajax';
import '../styles/emulator.css';
import NotificationBar from '../common/NotificationBar';

import '../styles/data-table.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';


class Emulator extends Component {

    constructor(props) {
        super(props);

        this.state = {
            FromZip: "",
            FromState: "",
            FromCity: "",
            Body:"",
            FromCountry: "",
            To: "9132703506",
            From:  window.sessionStorage.getItem('phone'),
            Answer: "",
            Commands: "",
            CommandsCached: "",
            CachedCommands: "false",
            File: "",
            Status: window.sessionStorage.getItem('status'),
            Conversation: [],
            CommandSubTitle: "",
            CommandLink: "",
            EventArray:[]
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.getConversationsForPhone = this.getConversationsForPhone.bind(this);
        this.renderConversation = this.renderConversation.bind(this);
        this.loadMoreMessages = this.loadMoreMessages.bind(this);
        this.onConversationKeypress = this.onConversationKeypress.bind(this);


    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});
    }

    dynamicLinks(str) {
        if (typeof str !== 'string') { return str; }
        var listSpace = str.split(' ')
        listSpace.forEach(function(valSpace, iSpace) {
            if (valSpace.includes('http')){
                var listLine = valSpace.split('\n');
                listLine.forEach(function(valLine, iLine){
                    if (valLine.includes('http')){
                        if (valLine.indexOf('</Message></Response>') > -1 ){
                            valLine = valLine.replace ('</Message></Response>', '');
                        }
                        listLine[iLine] = '<a target="_blank" href="' + valLine + '">' + valLine + '</a>';
                        listSpace[iSpace] = listLine.join('\n');
                    }
                });
            }
        });
        return listSpace.join(' ');
    }
    onConversationKeypress(ev) {
        var key = ev.keyCode || ev.which;
        if (key === 13) { // enter key
            this.handleSubmit(ev);
        }
        return false;
    }


    determineEventCommand(command) {
        //console.log ("command  passedin   "   + command) ;
        var enabled = 'enabled';
        this.state.EventArray.forEach(function (item, index) {
            //console.log ("item eventStatus  "   + item.eventStatus) ;
            var re = /\((.*)\)/g;
            var commandArray = item.key.match(re);
            //should be only one record like   (hellotest | hi)
            commandArray[0] = commandArray[0].replace('(', '').replace(')', '');
            var commands = commandArray[0].split('|');
            commands.forEach(function (commandItem, commandIndex) {
                //console.log ("commandItem   "   + commandItem.trim()) ;
                if (commandItem.trim() === command && item.eventStatus === 'disabled') {
                    enabled = 'disabled'
                }
            })
        });

        return enabled;
    }

    handleSubmit(ev) {
        var eventyStatus =this.determineEventCommand(this.state.Body);
        var self = this;
        var payload = {
            Body: this.state.Body,
            From: this.state.From,
            Status: this.state.Status,
            To: this.state.To
        }
        if (eventyStatus === 'enabled'){
            ajax({
                method:'POST',
                url:'/api/convo',
                data: payload
            }).then(function(res) {

                self.setState({ Body: "" });
                self.getConversationsForPhone();

            }).catch(function(err){
                console.log(err)}
            );
        }else {
            console.log('command is not  enabled');
            var newConvo = [];
            ajax({
                method:'POST',
                url:'/api/convo/inactivecommand',
                data: payload
            }).then(function(res) {
                newConvo =   res.data.concat(self.state.Conversation);
                self.setState({ Body: "" });
                self.setState({
                    Conversation: newConvo
                });

            }).catch(function(err){
                console.log(err)}
            );
        }
        ev.preventDefault();
    }
    componentWillMount() {
        var self = this;


       var commandArray=[];
       var eventStatus = [];
       var eventArray = [];

        var myData = {
            Body: "availablecommands",
            To: "+19132703506",
            From: window.sessionStorage.getItem('phone')
        };

        ajax({
            method: 'POST',
            url: '/api/convo',
            data: myData
        }).then(function (res) {
            var re = /(.*)[\n\r]/g;
            var tempString = res.data;
            tempString = tempString + '\n';
            tempString = self.dynamicLinks(tempString);
            commandArray = tempString.match(re);

            commandArray = commandArray.map(command=> command.replace('\n', '').replace('\r',''));
            self.setState(
                {
                    CommandSubTitle: commandArray[0].replace('<?xml version="1.0" encoding="UTF-8"?><Response><Message>', ''),
                    CommandLink: commandArray[commandArray.length - 1]
                }
            )

            commandArray.splice(0, 1);
            commandArray.splice(commandArray.length - 1, 1);
            self.setState({
                Commands: self.dynamicLinks(res.data)
            });
            if (res.data.indexOf('Keyhole SMS commands') > -1 && self.state.CachedCommands === "false") {

                self.setState({
                    CommandsCached: self.dynamicLinks(res.data),
                    CachedCommands: "true"
                });
            }


            var eventData = {
                events: commandArray
            };

            ajax({
                method: 'POST',
                url: '/api/convo/geteventstatus',
                data: eventData
            }).then(function (events) {

                eventStatus = events.data;
                commandArray.forEach(function (item,index){
                    eventArray.push({key:item, eventStatus:"enabled"});
                    eventStatus.forEach(function( event, eventIndex){

                        if (item === event.name ){

                            eventArray[index] = {
                                key:item,
                                eventStatus:"disabled"
                            }
                        }
                    });

                });
                //sort the array
                eventArray.sort(function (a, b) {
                    return (a.key.toLowerCase() > b.key.toLowerCase()) ? 1 : -1;
                });
                self.setState({
                    EventArray: eventArray
                });

            }).catch(
                function (err) {
                    console.log(err)
                }
                );
        }).catch(
            function (err) {
                console.log(err)
            });

        this.getConversationsForPhone();
    }

    scrollConversationToBottom() {
        const el = document.getElementById('emulator__conversation-thread');
        el.scrollTop = el.scrollHeight;
    }

    loadMoreMessages() {
        var skip = this.state.Conversation.length;
        this.getConversationsForPhone(skip);
    }

    getConversationsForPhone(skip) {
        var self = this;

        var phoneFrom = window.sessionStorage.getItem('phone');
        var getConvoData = {
            To: "+19132703506",
            From: phoneFrom
        };
        var skipCount = skip ? skip : 0;

        ajax({
            method: 'GET',
            url: '../api/convo/getconvoforphone?phone=' + phoneFrom + '&skip=' + skipCount,
            data: getConvoData
        }).then(function(res) {
            var newConvo = (skipCount === 0) ? res.data : self.state.Conversation.concat(res.data);
            self.setState({
                Conversation: newConvo
            });
            self.scrollConversationToBottom();
            self.forceUpdate();
        }).catch(function(err){ console.log(err) });
    }

    renderConversation() {
        const convo = this.state.Conversation;
        if (convo.length > 0) {
            var elements = [];
            for (var i = 0; i < convo.length; i++) {
                var input = convo[i];
                var dynamicAnswer = this.dynamicLinks(input.answer);
                var questionElement = (
                    <div className="conversation__message-container conversation__message-question" key={'question_' + i}>
                        <div className="conversation__message-content white-space" dangerouslySetInnerHTML={{__html: input.question}}></div>
                    </div>
                );
                var answerElement = (
                    <div className="conversation__message-container conversation__message-answer" key={'answer_' + i}>
                        <div className="conversation__message-content white-space" dangerouslySetInnerHTML={{__html: dynamicAnswer}}></div>
                    </div>
                )
                elements.push(answerElement);
                elements.push(questionElement);
            }
            return elements.reverse();
        } else {
            return [];
        }
    }


    onAfterSaveCell(row, cellName, cellValue) {

        var update = {
            event: {
                key: row.key,
                status:row.eventStatus
            }
        }
        ajax({
            method:'post',
            url:'../api/convo/disableevent',
            data: update,
        }).then(function (result){

        }).catch(function(err){
            console.log(err)
        });

    }
    render() {
        var conversationElements = this.renderConversation();
        var editable =  false;
        if (window.sessionStorage.getItem('status')==='admin'){
            editable={
                type: 'select', options: { values: ['enabled','disabled'] } 
            }
        }
        return (
            <div className="container">
                <NotificationBar  />
                <div className="row">
                    <div className="col-md-12"><h1>Emulator</h1></div>
                </div>
                <form encType="multipart/form-data" action="">
                    <input type="file" name="fileName" defaultValue="fileName" id="upload" style={{display: 'none'}} onChange={this.uploadFile}/>
                </form>

                <div className="row">
                    <div className="col-md-6">
                        <div className="emulator-container">
                            <div className="row">
                                <div className="emulator__message-list" id="emulator__conversation-thread">
                                    { conversationElements }
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-10">
                                    <input name="Body" type="text" className="form-control emulator-input" autoFocus value={this.state.Body} onChange={this.handleInputChange} onKeyPress={this.onConversationKeypress} placeholder="Type any of the available commands..." />
                                </div>
                                <div className="col-md-2">
                                    <button className="btn btn-default" onClick={this.handleSubmit}>Send</button>
                                </div>
                                <div className="col-md-4">
                                    <input name="From" className="form-control" type="tel" value={this.state.From} onChange={this.handleInputChange} placeholder="Phone Number" />
                                </div>
                                <div className="col-md-3">
                                    <button className="btn btn-primary" onClick={this.loadMoreMessages}>Load More</button>
                                </div>
                                <div className="col-md-3">
                                    <span>{ this.state.Conversation.length } Showing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">

                        <div>
                        <h3 className="command">Available Convo Commands</h3>
                        <BootstrapTable
                            data={ this.state.EventArray }
                            pagination
                            cellEdit={ {
                                mode: 'click',
                                blurToSave: true,
                                afterSaveCell: this.onAfterSaveCell
                            }}>
                          <TableHeaderColumn dataField='key' isKey  width ="75%">{this.state.CommandSubTitle}</TableHeaderColumn>
                          <TableHeaderColumn dataField='eventStatus' width="25%"  editable={ editable  }> Status</TableHeaderColumn>
                        </BootstrapTable>
                        </div>
                        <div className="white-space" dangerouslySetInnerHTML={{__html: this.state.CommandLink}}></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Emulator
