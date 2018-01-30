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
var moment = require('moment');

class NotifyEmulator extends Component {

    constructor(props) {
        super(props);

        this.state = {
            scheduledNotifications: [],
            msgtext: "",
            sentMsg: "",
            Body: "notify " + props.group.GroupName + " ",
            To: "9132703506",
            From:  window.sessionStorage.getItem('phone'),
            confirmsendmodal: false,
            scheduleHide: true,
            scheduleDate: '',
            scheduleTime: ''
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
           self.fetchScheduledNotifications();

        }).catch(function(err){console.log(err)});

        //ev.preventDefault();
    }

    fetchScheduledNotifications(){
        var self = this;
        ajax({ 
            method: 'get',
            url:'/api/notify/schedulednotification', 
            params: {'group': self.props.group.GroupName}
        }).then(function(res) {

            self.setState({ 
                scheduledNotifications: res.data,
             });

        }).catch(function(err){console.log(err)});
    }

    componentWillMount() { 
        this.fetchScheduledNotifications(); 
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.group !== this.props.group) {
            this.props.group = nextProps.group;
            this.fetchScheduledNotifications();
        }
    }

    openConfirmSendModal() { 
        this.setState( { confirmsendmodal: true } );
    }
    closeConfirmSendModal() { 
        this.setState( { confirmsendmodal: false } );
    }

    openDeleteScheduledNotificationModal(sn){ 
        this.setState( { 
            currentScheduledNotification: sn,
            deleteScheduledNotificationModal: true
        });
    }
    closeDeleteScheduledNotificationModal() { 
        this.setState( { deleteScheduledNotificationModal: false } );
    }
    deleteScheduledNotification() {
        var self = this;

        ajax({ 
            method: 'delete',
            url:'/api/notify/schedulednotification', 
            data: self.state.currentScheduledNotification
        }).then(function(res) {
            var deletedFilteredOut = self.state.scheduledNotifications.filter(function(item) { 
                return item._id !== self.state.currentScheduledNotification._id;
            });
            self.setState({ 
                scheduledNotifications: deletedFilteredOut,
            });

             self.closeDeleteScheduledNotificationModal();
        }).catch(function(err){console.log(err)});
    }


    openEditScheduledNotificationModal(sn){ 
        this.setState( { 
            currentScheduledNotification: sn,
            editScheduledNotificationModal: true
        });
    }
    closeEditScheduledNotificationModal() { 
        this.setState( { editScheduledNotificationModal: false } );
    }
    editScheduledNotification() {
        console.log("editScheduledNotification");
        console.dir(this.state.currentScheduledNotification);
    }


    validConfirmSend() {
        var isValid = true;

        if(!this.state.msgtext) { isValid = false; }
        if(!this.props.group.checkSMS && !this.props.group.checkEmail && !this.props.group.checkSlack) { isValid = false; }
        if(this.props.group.Users.length === 0) { isValid = false; }
        if(this.state.scheduleDate && !this.state.scheduleTime) { isValid = false; }
        if(this.state.scheduleTime && !this.state.scheduleDate) { isValid = false; }

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

    formatScheduleDate(sd) {
        return moment(sd).format('L') + ' ' + moment(sd).format('LT');
    }

    render() {
        this.state.Body = "notify " + this.props.group.GroupName;

        // Form list of Scheduled Notifications for group
        const ScheduledNotificationist = this.state.scheduledNotifications.map((record) =>
            <div className="row row-striped">
                <div className="col-xs-2">
                    {/* <i title="Edit" className="glyphicon glyphicon-edit clickable"  onClick={() => this.openEditScheduledNotificationModal(record)} /> */}
                    <i title="Delete from schedule" className="glyphicon glyphicon-remove-sign text-danger clickable"  onClick={() => this.openDeleteScheduledNotificationModal(record)} />
                </div>
                <div className="col-xs-4">{this.formatScheduleDate(record.scheduleDate)}</div>
                <div className="col-xs-6">{record.msg}</div>
            </div>
        );

        return (
            <div>
                <div className="row">
                    <div className="col-xs-12 notificationsHeaderStyle"><span>Message</span></div>
                </div>
                <div className="row">
                    <div className="col-xs-10">
                        <input name="msgtext" type="text" className="form-control emulator-input" autoFocus value={this.state.msgtext} onChange={this.handleInputChange} onKeyPress={this.onConversationKeypress} placeholder="Enter notification message here" />
                    </div>
                    <div className="col-xs-2">
                        <button className="btn btn-default" disabled={!this.validConfirmSend()} onClick={() => this.openConfirmSendModal()}>Confirm</button>
                    </div>
                </div>


                <div className="row">
                    <div className="col-xs-12 notificationsHeaderStyle">
                    <i title="Schedule" className={"glyphicon clickable " + (this.state.scheduleHide ? 'glyphicon-plus' : 'glyphicon-minus')}  onClick={() => this.toggleScheduleHide()} /> <span>Schedule ({this.state.scheduledNotifications.length})</span> (to send at a later time)
                    </div>
                </div>
                <div className={this.state.scheduleHide ? 'hidden' : ''}>
                    <div className='row'>
                        <div className="col-xs-3">Schedule Date: <input name="scheduleDate" type="date" className="form-control emulator-input" value={this.state.scheduleDate} onChange={this.handleInputChange} /></div>
                        <div className="col-xs-3">Schedule Time: <input name="scheduleTime" type="time" className="form-control emulator-input" value={this.state.scheduleTime} onChange={this.handleInputChange} /></div>
                    </div>

                        <div className="row">
                            <div className={this.state.scheduledNotifications.length > 0 ? 'col-xs-offset-1 col-xs-11' : 'hidden'}>
                                <div className="row">
                                    <div className="col-xs-12 notificationsHeaderStyle"><span>Currently Scheduled Notifications</span></div>
                                </div>

                                {ScheduledNotificationist}
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
                                <div className="col-md-4"><strong>Message:</strong></div>
                                <div className="col-md-8">{this.state.msgtext}</div>
                            </div>
                            <div className={"row " + (this.state.scheduleDate === '' ? 'hidden' : '')}>
                                <div className="col-md-4"><strong>Scheduled date/time:</strong></div>
                                <div className="col-md-8">
                                    {moment(this.state.scheduleDate + " " + this.state.scheduleTime, "YYYY-MM-DD H:mi").format('L')} 
                                    &nbsp;
                                    {moment(this.state.scheduleDate + " " + this.state.scheduleTime, "YYYY-MM-DD H:mi").format('LT')}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4"><strong># Users:</strong></div>
                                <div className="col-md-8">{this.props.group.Users.length}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-4"><strong>Send Mediums:</strong></div>
                                <div className="col-md-8">{this.sendMediums()}</div>
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <div className="row">
                            <div className="col-md-12 pull-right">
                                <button className="btn btn-primary" disabled={this.state.sentMsg !== ""} onClick={() => this.handleSubmit()}>{this.state.scheduleDate === '' ? 'Send' : 'Schedule'}</button>
                                <button className="btn btn-default" onClick={() => this.closeConfirmSendModal()}>{this.state.sentMsg !== "" ? 'Close' : 'Cancel'}</button>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>


                <Modal show={this.state.deleteScheduledNotificationModal} onHide={this.close}>
                    <Modal.Header className="bg-danger">
                        <strong>Confirm Delete Scheduled Notification</strong>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="form-group">
                            <label>Are you sure you want to delete this?</label>
                        </div>

                        <div className="row">
                            <div className="col-md-3"><strong>Date:</strong></div>
                            <div className="col-md-9">{this.state.currentScheduledNotification ? this.formatScheduleDate(this.state.currentScheduledNotification.scheduleDate) : '' } </div>
                        </div> 
                        <div className="row">
                            <div className="col-md-3"><strong>Message:</strong></div>
                            <div className="col-md-9">{this.state.currentScheduledNotification ? this.state.currentScheduledNotification.msg : '' } </div>
                        </div> 
                    </Modal.Body>

                    <Modal.Footer>
                        <div className="row">
                            <div className="col-md-12 pull-right">
                                <button className="btn btn-danger"  onClick={() => this.deleteScheduledNotification()} >Delete</button>
                                <button className="btn btn-default" onClick={() => this.closeDeleteScheduledNotificationModal()}>Cancel</button>
                            </div> 
                        </div>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.editScheduledNotificationModal} onHide={this.close}>
                    <Modal.Header className="bg-info">
                        <strong>Edit Scheduled Notification</strong>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="row">
                            <div className="col-md-3"><strong>Date:</strong></div>
                            <div className="col-md-9">{this.state.currentScheduledNotification ? this.state.currentScheduledNotification.scheduleDate : '' } </div>
                        </div> 
                        <div className="row">
                            <div className="col-md-3"><strong>Message:</strong></div>
                            <div className="col-md-9">
                                <input name="currentScheduledNotification.msg" type="text" className="form-control emulator-input" defaultValue={this.state.currentScheduledNotification ? this.state.currentScheduledNotification.msg : ''} onChange={this.handleInputChange} placeholder="Enter notification message here" />
                            </div>
                        </div> 
                    </Modal.Body>

                    <Modal.Footer>
                        <div className="row">
                            <div className="col-md-12 pull-right">
                                <button className="btn btn-primary"  onClick={() => this.editScheduledNotification()} >Submit</button>
                                <button className="btn btn-default" onClick={() => this.closeEditScheduledNotificationModal()}>Cancel</button>
                            </div> 
                        </div>
                    </Modal.Footer>
                </Modal>


            </div>
        )
    }
}

export default NotifyEmulator
