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
            confirmSendModal: false,
            scheduleHide: true,
            newScheduleDate: '',
            newScheduleTime: ''
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
        var tmpScheduleDate = this.createScheduleDate(this.state.newScheduleDate, this.state.newScheduleTime);
        var sentMsgText = !isNaN(tmpScheduleDate) ? 'Message Scheduled' : 'Message Sent';

        var payload = {
            Body: "notify " + this.props.group.GroupName + ' ' + this.state.msgtext,
            From: this.state.From,
            To: this.state.To,
            scheduleDate: tmpScheduleDate
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
                sentMsg: sentMsgText,
                scheduleHide: true,
                newScheduleDate: '',
                newScheduleTime: ''
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
            this.setState( {group: nextProps.group} );
            this.fetchScheduledNotifications();
        }
    }

    createScheduleDate(tmpDate, tmpTime) {
        var scheduleTimeExists = typeof tmpTime !== 'undefined' && !this.IsEmpty(tmpTime);
        var requestScheduleDate = tmpDate;
        var requestScheduleTime = '';

        if(scheduleTimeExists) {
            requestScheduleTime = tmpTime;
        } else {
            const now = new Date();
            requestScheduleTime = now.getHours() + ':' + now.getMinutes();
        }

        const dateParts = requestScheduleDate.split('-');
        const timeParts = requestScheduleTime.split(':');

        return new Date(dateParts[0], parseInt(dateParts[1], 10)-1, dateParts[2], timeParts[0], timeParts[1], 0);
    }
    IsEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    openConfirmSendModal() {
        this.setState({ confirmSendModal: true });
    }
    closeConfirmSendModal() {
        this.setState({ confirmSendModal: false });
    }

    openDeleteScheduledNotificationModal(sn){
        this.setState({
            currentScheduledNotification: sn,
            deleteScheduledNotificationModal: true
        });
    }
    closeDeleteScheduledNotificationModal() {
        this.setState({ deleteScheduledNotificationModal: false });
    }
    deleteScheduledNotification() {
        const self = this;

        ajax({
            method: 'delete',
            url:'/api/notify/schedulednotification',
            data: self.state.currentScheduledNotification
        }).then(function(res) {
            const deletedFilteredOut = self.state.scheduledNotifications.filter(function (item) {
                return item._id !== self.state.currentScheduledNotification._id;
            });
            self.setState({
                scheduledNotifications: deletedFilteredOut,
                scheduleHide: true
            });

             self.closeDeleteScheduledNotificationModal();
        }).catch(function(err){console.log(err)});
    }


    openEditScheduledNotificationModal(sn){
        this.setState({
            currentScheduledNotification: sn,
            editScheduledNotificationModal: true,
            editScheduleDate: moment(sn.scheduleDate).format('YYYY-MM-DD'),
            editScheduleTime: moment(sn.scheduleDate).format('HH:mm'),
            editMsg: sn.msg
        });
    }
    closeEditScheduledNotificationModal() {
        this.setState({
            editScheduledNotificationModal: false
        });
    }
    editScheduledNotification() {
        const csn = this.state.currentScheduledNotification;
        const csnDate = this.createScheduleDate(this.state.editScheduleDate, this.state.editScheduleTime);
        csn.scheduleDate = csnDate;
        csn.msg = this.state.editMsg;

        const self = this;
        ajax({
            method: 'put',
            url:'/api/notify/schedulednotification',
            data: csn
        }).then(function(res) {
            self.setState({
                currentScheduledNotification: {},
                editScheduleDate: '',
                editScheduleTime: '',
                editMsg: ''
            });
            self.fetchScheduledNotifications();
            self.closeEditScheduledNotificationModal();

        }).catch(function(err){console.log(err)});
    }


    validConfirmSend() {
        let isValid = true;

        if(!this.state.msgtext) { isValid = false; }
        if(!this.props.group.checkSMS && !this.props.group.checkEmail && !this.props.group.checkSlack) { isValid = false; }
        if(this.props.group.Users.length === 0) { isValid = false; }
        if(this.state.scheduleDate && !this.state.scheduleTime) { isValid = false; }
        if(this.state.scheduleTime && !this.state.scheduleDate) { isValid = false; }

        return isValid;
    }
     validEdit() {
         let isValid = true;

         if(!this.state.editMsg) { isValid = false; }
         if(this.state.editScheduleDate && !this.state.editScheduleTime) { isValid = false; }
         if(this.state.editScheduleTime && !this.state.editScheduleDate) { isValid = false; }

         return isValid;
     }


    sendMediums() {
        let str = "";
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
        return moment(sd).format('L') + ' @ ' + moment(sd).format('LT');
    }

    render() {
        this.setState( {Body: `notify ${this.props.group.GroupName}`} );

        // Form list of Scheduled Notifications for group
        const ScheduledNotificationist = this.state.scheduledNotifications.map((record) =>
            <div className="row row-striped">
                <div className="col-xs-2">
                    <i title="Edit" className="glyphicon glyphicon-edit clickable"  onClick={() => this.openEditScheduledNotificationModal(record)} />
                    <i title="Delete from schedule" className="glyphicon glyphicon-remove-sign text-danger clickable"  onClick={() => this.openDeleteScheduledNotificationModal(record)} />
                </div>
                <div className="col-xs-4">{this.formatScheduleDate(record.scheduleDate)}</div>
                <div className="col-xs-6">{record.msg}</div>
            </div>
        );
        const NoScheduledNotificationist = <div className="row row-striped"><div className="col-xs-12">There are currently no Scheduled Notifications</div></div>;

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
                    <div className="col-xs-4">Scheduled Date: <input name="newScheduleDate" type="date" className="form-control emulator-input" value={this.state.newScheduleDate} onChange={this.handleInputChange} /></div>
                    <div className="col-xs-4">Scheduled Time: <input name="newScheduleTime" type="time" className="form-control emulator-input" value={this.state.newScheduleTime} onChange={this.handleInputChange} /></div>
                </div>
                <div className="row">
                    <div className="col-xs-12"><em>* To send at a later time, else message will be sent immediately</em></div>
                </div>

                <div className="row">
                    <div className="col-xs-12 notificationsHeaderStyle">
                        <i title="Schedule" className={"glyphicon clickable " + (this.state.scheduleHide ? 'glyphicon-plus' : 'glyphicon-minus')}  onClick={() => this.toggleScheduleHide()} /> <span>Scheduled Notifications ({this.state.scheduledNotifications.length})</span>
                    </div>
                </div>
                <div className={this.state.scheduleHide ? 'hidden' : 'row'}>
                    <div className="col-xs-offset-1 col-xs-11">
                        <div className="row">
                            <div className="col-xs-12 notificationsHeaderStyle"><span className="sub">Currently Scheduled Notifications</span></div>
                        </div>
                        {this.state.scheduledNotifications.length > 0 ? ScheduledNotificationist : NoScheduledNotificationist}
                    </div>
                </div>

                <Modal show={this.state.confirmSendModal} onHide={this.close}>
                    <Modal.Header className="bg-info">
                        <strong>Confirm Send Notification</strong>
                    </Modal.Header>

                    <Modal.Body>
                        <div className={this.state.sentMsg !== "" ? 'row visible' : 'row invisible'}>
                            <div className="col-md-12 red text-center">{this.state.sentMsg}</div>
                        </div>
                        <div className={this.state.sentMsg === "" ? 'visible' : 'invisible'} >
                            <div className="row">
                                <div className="col-md-4 text-right"><strong>Message:</strong></div>
                                <div className="col-md-8">{this.state.msgtext}</div>
                            </div>
                            <div className={"row " + (this.state.newScheduleDate === '' ? 'hidden' : '')}>
                                <div className="col-md-4 text-right"><strong>Scheduled date/time:</strong></div>
                                <div className="col-md-8">
                                    {this.formatScheduleDate(moment(this.state.newScheduleDate + " " + this.state.newScheduleTime, "YYYY-MM-DD HH:mi"))}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 text-right"><strong># Users:</strong></div>
                                <div className="col-md-8">{this.props.group.Users.length}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 text-right"><strong>Send Mediums:</strong></div>
                                <div className="col-md-8">{this.sendMediums()}</div>
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <div className="row">
                            <div className="col-md-12 pull-right">
                                <button className={"btn btn-primary" + (this.state.sentMsg !== '' ? ' hidden' : '') } disabled={this.state.sentMsg !== ""} onClick={() => this.handleSubmit()}>{this.state.newScheduleDate === '' ? 'Send' : 'Schedule'}</button>
                                <button className="btn btn-default" onClick={() => this.closeConfirmSendModal()}>{this.state.sentMsg !== '' ? 'Close' : 'Cancel'}</button>
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
                            <div className="col-md-4 text-right"><strong>Scheduled date/time:</strong></div>
                            <div className="col-md-8">{this.state.currentScheduledNotification ? this.formatScheduleDate(this.state.currentScheduledNotification.scheduleDate) : '' } </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4 text-right"><strong>Message:</strong></div>
                            <div className="col-md-8">{this.state.currentScheduledNotification ? this.state.currentScheduledNotification.msg : '' } </div>
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
                            <div className="col-md-4 text-right"><strong>Scheduled date/time:</strong></div>
                            <div className="col-md-4">
                                <input name="editScheduleDate" type="date" className="form-control emulator-input" defaultValue={this.state.currentScheduledNotification ? this.state.editScheduleDate : ''} onChange={this.handleInputChange} />
                            </div>
                            <div className="col-md-4">
                                <input name="editScheduleTime" type="time" className="form-control emulator-input" defaultValue={this.state.currentScheduledNotification ?  this.state.editScheduleTime : ''} onChange={this.handleInputChange} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4 text-right"><strong>Message:</strong></div>
                            <div className="col-md-8">
                                <input name="editMsg" type="text" className="form-control emulator-input" defaultValue={this.state.currentScheduledNotification ? this.state.editMsg : ''} onChange={this.handleInputChange} placeholder="Enter notification message here" />
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <div className="row">
                            <div className="col-md-12 pull-right">
                                <button className="btn btn-primary" disabled={!this.validEdit()} onClick={() => this.editScheduledNotification()} >Submit</button>
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
