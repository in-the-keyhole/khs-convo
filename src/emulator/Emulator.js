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

import '../styles/emulator.css';
import React from 'react';
import restAPI from '../service/restAPI';
import NotificationBar from '../upload/NotificationBar';
import paginationFactory from 'react-bootstrap-table2-paginator';
import cellEditFactory, {Type} from 'react-bootstrap-table2-editor';
import BootstrapTable from 'react-bootstrap-table-next';
import {checkCredentials} from "../common/checkCredentials";
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";
import {pageinationOptions} from "../common/pageinationOptions";
// noinspection ES6CheckImport
import {
    Row,
    Col,
    Button,
    Card,
    CardBody,
    CardTitle,
    Input
} from 'mdbreact';


class Emulator extends BaseComponent {

    constructor(props) {
        super(props);
        console.log('Emulator credentials', props.credentials);

        this.state = {
            FromZip: '',
            FromState: '',
            FromCity: '',
            Body: '',
            FromCountry: '',
            To: '9132703506',
            From: props.credentials.phone,
            Answer: '',
            Commands: '',
            CommandsCached: '',
            CachedCommands: 'false',
            File: '',
            Status: props.credentials.status,
            Conversation: [],
            CommandSubTitle: '',
            CommandLink: '',
            EventArray: []
        };

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
        if (typeof str !== 'string') {
            return str;
        }

        const listSpace = str.split(' ');
        listSpace.forEach((valSpace, iSpace) => {

            if (valSpace.includes('http')) {
                const listLine = valSpace.split('\n');

                listLine.forEach((valLine, iLine) => {

                    if (valLine.includes('http')) {
                        if (valLine.indexOf('</Message></Response>') > -1) {
                            valLine = valLine.replace('</Message></Response>', '');
                        }
                        listLine[iLine] = '<a target="_blank" href="' + valLine + '"/' + valLine + '>';
                        listSpace[iSpace] = listLine.join('\n');
                    }
                });
            }
        });
        return listSpace.join(' ');
    }

    onConversationKeypress(ev) {
        const key = ev.keyCode || ev.which;
        if (key === 13) { // enter key
            this.handleSubmit(ev);
        }
        return false;
    }


    determineEventCommand(command) {
        let enabled = 'enabled';

        this.state.EventArray.forEach(item => {
            const re = /\((.*)\)/g;
            const commandArray = item.key.match(re);

            // should be only one record like   (hellotest | hi)
            commandArray[0] = commandArray[0].replace('(', '').replace(')', '');
            const commands = commandArray[0].split('|');

            commands.forEach(commandItem => {
                if (commandItem.trim() === command && item.eventStatus === 'disabled') {
                    enabled = 'disabled'
                }
            })
        });

        return enabled;
    }

    handleSubmit(ev) {
        ev.preventDefault();
        const eventyStatus = this.determineEventCommand(this.state.Body);
        const self = this;
        const payload = {
            Body: this.state.Body,
            From: this.state.From,
            Status: this.state.Status,
            To: this.state.To
        };
        if (eventyStatus === 'enabled') {
            restAPI({
                method: 'POST',
                url: '/api/convo',
                data: payload,
                headers: {'token': this.props.credentials.apitoken}
            }).then(() => {

                self.setState({Body: ''});
                self.getConversationsForPhone();

            }).catch(err => console.log(err));
        } else {
            console.log('command is not enabled');
            restAPI({
                method: 'POST',
                url: '/api/convo/inactivecommand',
                data: payload
            }).then(res => {
                const newConvo = res.data.concat(self.state.Conversation);
                self.setState({Body: ""});
                self.setState({Conversation: newConvo});

            }).catch(err => console.log(err));
        }
    }

    componentWillMount() {
        super.componentWillMount();
        const self = this;

        let commandArray;
        let eventStatus;
        const eventArray = [];

        const myData = {
            Body: "availablecommands",
            To: "+19132703506",
            From: this.props.credentials.phone
        };

        restAPI({
            method: 'POST',
            url: '/api/convo',
            data: myData,
            headers: {"token": this.props.credentials.apitoken}
        }).then(function (res) {
            const re = /(.*)[\n\r]/g;
            let tempString = res.data;
            tempString = tempString + '\n';
            tempString = self.dynamicLinks(tempString);
            commandArray = tempString.match(re);

            commandArray = commandArray.map(command => command.replace('\n', '').replace('\r', ''));
            self.setState(
                {
                    CommandSubTitle: commandArray[0].replace('<?xml version="1.0" encoding="UTF-8"?><Response><Message>', ''),
                    CommandLink: commandArray[commandArray.length - 1]
                }
            );

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


            const eventData = {events: commandArray};

            restAPI({
                method: 'POST',
                url: '/api/convo/geteventstatus',
                data: eventData
            }).then(function (events) {

                eventStatus = events.data;
                console.log('events.data', eventStatus);
                commandArray.forEach(function (item, index) {
                    eventArray.push({key: item, eventStatus: "enabled"});
                    eventStatus.forEach(event => {

                        if (item === event.name) {

                            eventArray[index] = {
                                _id: event._id,
                                key: item,
                                eventStatus: "disabled"
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

    static scrollConversationToBottom() {
        const el = document.getElementById('emulator__conversation-thread');
        el.scrollTop = el.scrollHeight;
    }

    loadMoreMessages() {
        const skip = this.state.Conversation.length;
        this.getConversationsForPhone(skip);
    }

    getConversationsForPhone(skip) {
        const self = this;

        const phoneFrom = this.props.credentials.phone;
        const getConvoData = {
            To: "+19132703506",
            From: phoneFrom
        };
        const skipCount = skip ? skip : 0;

        restAPI({
            method: 'GET',
            url: '../api/convo/getconvoforphone?phone=' + phoneFrom + '&skip=' + skipCount,
            data: getConvoData
        }).then(function (res) {
            const newConvo = (skipCount === 0) ? res.data : self.state.Conversation.concat(res.data);
            self.setState({
                Conversation: newConvo
            });
            Emulator.scrollConversationToBottom();
            self.forceUpdate();
        }).catch(function (err) {
            console.log(err)
        });
    }

    /**
     * Paints the conversation elements in a transcript
     *
     * @returns {*[]}
     */
    renderConversation() {
        const convo = this.state.Conversation;
        const elements = [];
        const overrideFontSize = {fontSize: "0.9rem"};
        convo.forEach((input, i) => {
            const dynamicAnswer = this.dynamicLinks(input.answer);
            const questionElement = (
                <div className="conversation__message-container conversation__message-question"
                     style={overrideFontSize}
                     key={`question_${i}`}>
                    <div className="conversation__message-content white-space">
                        {input.question}
                    </div>
                </div>
            );

            const answerElement = (
                <div className="conversation__message-container conversation__message-answer" key={`answer_${i}`}
                     style={overrideFontSize}>
                    <div className="conversation__message-content white-space">
                        {dynamicAnswer}
                    </div>
                </div>
            );

            elements.push(answerElement);
            elements.push(questionElement);
        });
        return elements.reverse();
    }


    /**
     * Saves to Mongodb. Called by onBlur event tied to editable table cells. Specifically, the method
     * sends the cellValue to the API to modify the document according to eventStatus enabled/disabled.
     * @param row
     * @param cellName
     * @param cellValue -- an object of all fields of the row's document
     */
    onAfterSaveCell(row , cellName, cellValue) {

        restAPI({
            method: 'post',
            url: '../api/convo/disableevent',
            data: cellValue,
        }).then(result => console.log(`onAfterSaveCell`, result)).catch(err => console.log(err));
    }


    render() {
        if (!checkCredentials()) {
            return '';
        }
        // TODO Stop injecting HTML from the API. See help.js for its own TODO
        const CommandLink = ({value}) => (<div dangerouslySetInnerHTML={{__html: value}}/>);

        const buttonAligment = {marginTop: '2rem'};
        const conversationElements = this.renderConversation();
        const isAdmin = this.props.credentials.status === 'admin';

        const titleStyle = {fontSize: "1.22rem", color: "#66f"};

        const columns = [
            {
                hidden: true,
                dataField: '_id'
            },
            {
                text: 'Keyhole SMS Commands',
                dataField: 'key',
                width: "75%",
                isKey: true
            },
            {
                text: 'Status',
                dataField: 'eventStatus',
                width: "25%",
                editable: isAdmin,
                editor: {
                    type: Type.CHECKBOX,
                    value: 'enabled:disabled'
                }
            }
        ];

        const card1 =
            <Card>
                <CardBody>
                    <CardTitle style={titleStyle}>Sending Center</CardTitle>
                    <Row>
                        <Col>
                            <span style={{fontSize: "0.85rem", color: "#888"}}>
                                {`${this.state.Conversation.length || 'no'} commands sent:`}</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="emulator__message-list" id="emulator__conversation-thread">
                            {conversationElements}
                        </Col>
                    </Row>
                    <Row>
                        <Col md={"9"}>
                            <Input name="Body"
                                   type="text"
                                   autoFocus
                                   value={this.state.Body || ''}
                                   onChange={this.handleInputChange}
                                   onKeyPress={this.onConversationKeypress}
                                   label={"Enter command"}
                            />
                        </Col>
                        <Col md={"2"}>
                            <Button size={"sm"}
                                    onClick={this.handleSubmit}
                                    style={buttonAligment}>Send</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={"4"}>
                            <Input name="From"
                                   type="tel"
                                   validate
                                   value={this.state.From || ''}
                                   onChange={this.handleInputChange}
                                   label={"Enter phone"}
                            />
                        </Col>
                        <Col md={"2"}>
                            <Button size={"sm"}
                                    color={"primary"}
                                    style={buttonAligment}
                                    onClick={this.loadMoreMessages}>Load&nbsp;More</Button>
                        </Col>
                    </Row>


                </CardBody>
            </Card>
        ;

        const card2 =
            <Card>
                <CardBody>
                    <CardTitle  style={titleStyle}>Installed Commands</CardTitle>
                    <Row>
                        <Col>
                            <BootstrapTable
                                bootstrap4
                                data={this.state.EventArray}
                                columns={columns}
                                keyField={'key'}
                                pagination={paginationFactory( pageinationOptions )}
                                cellEdit={cellEditFactory({
                                    mode: 'click',
                                    blurToSave: true,
                                    afterSaveCell: this.onAfterSaveCell
                                })}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <CommandLink value={this.state.CommandLink}/>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        ;

        return (
            <Card>
                <CardBody>
                    <NotificationBar/>
                    <CardTitle>Command Emulator</CardTitle>

                    <form encType="multipart/form-data" action="">
                        <Input type="file" name="fileName" id="upload" style={{display: 'none'}}
                               onChange={this.uploadFile}/>
                    </form>

                    <Row>
                        <Col md={"5"}>{card1}</Col>
                        <Col>{card2}</Col>
                    </Row>

                </CardBody>
            </Card>
        )
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(Emulator);
