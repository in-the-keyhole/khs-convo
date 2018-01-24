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
import { Modal  } from 'react-bootstrap';

class NotifyEmulator extends Component {

    constructor(props) {
        super(props);

        this.state = {
            msgtext: "",
            sentMsg: "",
            Body: "notify " + props.group.GroupName + " ",
            To: "9132703506",
            From:  window.sessionStorage.getItem('phone'),
            confirmsendmodal: false,
            scheduleHide: true
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.onConversationKeypress = this.onConversationKeypress.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({
            [target.name]: target.value,
            sentMsg: ""
        });

        if(target.name === 'scheduleDate') {
            var now = new Date();
            var hours = now.getHours();
            var mins = now.getMinutes()+1;
            hours = (hours < 10 ? '0' : '') + hours;
            mins = (mins < 10 ? '0' : '') + mins;
            this.setState({
                scheduleTime: hours + ':' + mins
            });
        }
    }


    onConversationKeypress(ev) {
        var key = ev.keyCode || ev.which;
        if (key === 13) { // enter key
            this.handleSubmit(ev);
        }
        return false;
    }

    handleSubmit(ev) {
        this.setState({  
            msgtext: "",
            sentMsg: "Message Sent"
        });

        var payload = {
            Body: "notify " + this.props.group.GroupName + ' ' + this.state.msgtext,
            From: this.state.From,
            To: this.state.To,
            Schedule: { date: this.state.scheduleDate, time: this.state.scheduleTime }
        }

        var self = this;
        ajax({
            method:'POST',
            url:'/api/convo',
            data: payload,
            headers: {"token": window.sessionStorage.getItem('apitoken') }
        }).then(function(res) {

            self.setState({  
                msgtext: "",
                sentMsg: "Message Sent",
                scheduleHide: true,
                scheduleDate: '',
                scheduleTime: ''
            });
           // self.getConversationsForPhone();

        }).catch(function(err){console.log(err)});

        //ev.preventDefault();
    }

    componentWillMount() {

    }
 
    openConfirmSendModal() { 
        this.setState( { confirmsendmodal: true } );
    }
    closeConfirmSendModal() { 
        this.setState( { confirmsendmodal: false } );
    }
    validConfirmSend() {
        var isValid = true;

        if(!this.state.msgtext) { isValid = false; }
        if(!this.props.group.checkSMS && !this.props.group.checkEmail && !this.props.group.checkSlack) { isValid = false; }
        if(this.props.group.Users.length === 0) { isValid = false; }

        return isValid;
    }
    sendMediums() {
        var str = "";
        if(this.props.group.checkSMS) { 
            str = "SMS"; 
        }
        if(this.props.group.checkEmail) { 
            if(str !== "") {str += ", "; }
            str += "Email"; 
        }
        if(this.props.group.checkSlack) { 
            if(str !== "") {str += ", "; }
            str += "Slack"; 
        }
        return str;
    }

    toggleScheduleHide() {
        this.setState({ 
            scheduleHide: !this.state.scheduleHide,
            scheduleDate: '',
            scheduleTime: ''
        });
    }

    render() {
        this.state.Body = "notify " + this.props.group.GroupName;

        return (
            <div>
                <div className="row">
                    <div className="col-xs-10">
                        <input name="msgtext" type="text" className="form-control emulator-input" autoFocus value={this.state.msgtext} onChange={this.handleInputChange} onKeyPress={this.onConversationKeypress} placeholder="Enter notification message here" />
                    </div>
                    <div className="col-xs-2">
                        <button className="btn btn-default" disabled={!this.validConfirmSend()} onClick={() => this.openConfirmSendModal()}>Send</button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-xs-12">
                        <h4 className="notificationsHeaderStyle" ><i title="Schedule" className={"glyphicon clickable " + (this.state.scheduleHide ? 'glyphicon-plus' : 'glyphicon-minus')}  onClick={() => this.toggleScheduleHide()} /> Schedule (to send at a later time)</h4>
                        <div className={this.state.scheduleHide ? 'hidden' : 'row'}>
                            <div className="col-xs-3">Schedule Date: <input name="scheduleDate" type="date" className="form-control emulator-input" value={this.state.scheduleDate} onChange={this.handleInputChange} /></div>
                            <div className="col-xs-3">Schedule Time: <input name="scheduleTime" type="time" className="form-control emulator-input" value={this.state.scheduleTime} onChange={this.handleInputChange} /></div>
                        </div>
                    </div>
                </div>


                <Modal show={this.state.confirmsendmodal} onHide={this.close}>
                    <Modal.Header className="bg-info">
                        <strong>Confirm Send Notification</strong>
                    </Modal.Header>

                    <Modal.Body>
                        <div className={this.state.sentMsg !== "" ? 'row visible' : 'row invisible'}>
                            <div className="col-md-12 red text-center">{this.state.sentMsg}</div>
                        </div>

                        <div className={this.state.sentMsg === "" ? 'visible' : 'invisible'} >
                            <div className="row">
                                <div className="col-md-3"><strong>Message:</strong></div>
                                <div className="col-md-9">{this.state.msgtext}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-3"><strong># Users:</strong></div>
                                <div className="col-md-9">{this.props.group.Users.length}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-3"><strong>Send Mediums:</strong></div>
                                <div className="col-md-9">{this.sendMediums()}</div>
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <div className="row">
                            <div className="col-md-12 pull-right">
                                {/* <input className="btn btn-primary" type="submit" value="Send" /> */}
                                <button className="btn btn-primary" disabled={this.state.sentMsg !== ""} onClick={() => this.handleSubmit()}>Send</button>
                                <button className="btn btn-default" onClick={() => this.closeConfirmSendModal()}>Cancel</button>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default NotifyEmulator
