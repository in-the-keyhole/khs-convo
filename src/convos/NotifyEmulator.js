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

import React, {Fragment} from 'react';
import restAPI from '../service/restAPI';
import '../styles/emulator.css';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";
// noinspection ES6CheckImport
import {
    Row,
    Col,
    Button,
    Card,
    CardBody,
    CardTitle,
    MDBIcon,
    MDBInput,
    MDBModal,
    MDBModalBody,
    MDBModalHeader,
    MDBModalFooter
} from 'mdbreact';

const moment = require('moment');

const EnterKey = 13;

class NotifyEmulator extends BaseComponent {

    constructor(props) {
        super(props);

        this.state = {
            scheduledNotifications: [],
            msgtext: "",
            sentMsg: "",
            Body: "notify " + props.group.GroupName + " ",
            To: "9132703506",
            From: props.phone,
            confirmSendModal: false,
            scheduleHide: true,
            newScheduleDate: '',
            newScheduleTime: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.onConversationKeypress = this.onConversationKeypress.bind(this);
    }


    handleInputChange(event) {
        const target = event.target;
        this.setState({
            [target.name]: target.value,
            sentMsg: ''
        });
    }


    onConversationKeypress(ev) {
        const key = ev.keyCode || ev.which;
        if (key === EnterKey) {
            this.handleSubmit(ev);
        }
        return false;
    }


    handleSubmit(ev) {
        ev.preventDefault();

        const tmpScheduleDate = NotifyEmulator.createScheduleDate(this.state.newScheduleDate, this.state.newScheduleTime);
        const sentMsgText = !isNaN(tmpScheduleDate) ? 'Message Scheduled' : 'Message Sent';

        const payload = {
            Body: `notify ${this.props.group.GroupName} ${this.state.msgtext}`,
            From: this.state.From,
            To: this.state.To,
            scheduleDate: tmpScheduleDate
        };

        const self = this;
        restAPI({
            method: 'POST',
            url: '/api/convo',
            data: payload,
            headers: {"token": this.props.credentials.apitoken}
        }).then(() => {
            self.setState({
                msgtext: "",
                sentMsg: sentMsgText,
                scheduleHide: true,
                newScheduleDate: '',
                newScheduleTime: ''
            });

            // self.getConversationsForPhone();
            self.fetchScheduledNotifications();

        }).catch(function (err) {
            console.log(err)
        });

    }


    fetchScheduledNotifications() {
        const self = this;
        restAPI({
            method: 'get',
            url: '/api/notify/schedulednotification',
            params: {'group': self.props.group.GroupName}
        }).then(res => {
            self.setState({
                scheduledNotifications: res.data,
            });

        }).catch(err => console.log(err));
    }


    componentWillMount() {
        super.componentWillMount();
        this.fetchScheduledNotifications();
    }


    componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);
        if (nextProps.group !== this.props.group) {
            this.setState({group: nextProps.group});
            this.fetchScheduledNotifications();
        }
    }


    static createScheduleDate(tmpDate, tmpTime) {
        const scheduleTimeExists = tmpTime !== 'undefined' && !NotifyEmulator.IsEmpty(tmpTime);
        const requestScheduleDate = tmpDate;
        let requestScheduleTime = '';

        if (scheduleTimeExists) {
            requestScheduleTime = tmpTime;
        } else {
            const now = new Date();
            requestScheduleTime = now.getHours() + ':' + now.getMinutes();
        }

        const dateParts = requestScheduleDate.split('-');
        const timeParts = requestScheduleTime.split(':');

        return new Date(dateParts[0], parseInt(dateParts[1]) - 1, dateParts[2],
            parseInt(timeParts[0]), parseInt(timeParts[1]), 0);
    }


    static IsEmpty(obj) {
        return Object.keys(obj).length === 0;
    }


    openConfirmSendModal() {
        this.setState({confirmSendModal: true});
    }


    closeConfirmSendModal() {
        this.setState({confirmSendModal: false});
    }


    openDeleteScheduledNotificationModal(sn) {
        this.setState({
            currentScheduledNotification: sn,
            deleteScheduledNotificationModal: true
        });
    }


    closeDeleteScheduledNotificationModal() {
        this.setState({deleteScheduledNotificationModal: false});
    }


    deleteScheduledNotification() {
        const self = this;

        restAPI({
            method: 'delete',
            url: '/api/notify/schedulednotification',
            data: self.state.currentScheduledNotification
        }).then(() => {
            const deletedFilteredOut = self.state.scheduledNotifications.filter(function (item) {
                return item._id !== self.state.currentScheduledNotification._id;
            });
            self.setState({
                scheduledNotifications: deletedFilteredOut,
                scheduleHide: true
            });

            self.closeDeleteScheduledNotificationModal();
        }).catch(err => console.log(err));
    }


    openEditScheduledNotificationModal(sn) {
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
        csn.scheduleDate = NotifyEmulator.createScheduleDate(this.state.editScheduleDate, this.state.editScheduleTime);
        csn.msg = this.state.editMsg;

        const self = this;
        restAPI({
            method: 'put',
            url: '/api/notify/schedulednotification',
            data: csn
        }).then(() => {
            self.setState({
                currentScheduledNotification: {},
                editScheduleDate: '',
                editScheduleTime: '',
                editMsg: ''
            });
            self.fetchScheduledNotifications();
            self.closeEditScheduledNotificationModal();

        }).catch(err => console.log(err));
    }


    validConfirmSend() {
        let isValid = true;

        if (!this.state.msgtext) {
            isValid = false;
        }
        if (!this.props.group.checkSMS && !this.props.group.checkEmail && !this.props.group.checkSlack) {
            isValid = false;
        }
        if (this.props.group.Users.length === 0) {
            isValid = false;
        }
        if (this.state.scheduleDate && !this.state.scheduleTime) {
            isValid = false;
        }
        if (this.state.scheduleTime && !this.state.scheduleDate) {
            isValid = false;
        }

        return isValid;
    }


    validEdit() {
        let isValid = true;

        if (!this.state.editMsg) {
            isValid = false;
        }
        if (this.state.editScheduleDate && !this.state.editScheduleTime) {
            isValid = false;
        }
        if (this.state.editScheduleTime && !this.state.editScheduleDate) {
            isValid = false;
        }

        return isValid;
    }

    // No such word as "mediums". sendMedia would be better
    sendMediums() {
        let str = '';
        if (this.props.group.checkSMS) {
            str = 'SMS';
        }
        if (this.props.group.checkEmail) {
            if (str !== '') {
                str += ', ';
            }
            str += 'Email';
        }
        if (this.props.group.checkSlack) {
            if (str !== '') {
                str += ', ';
            }
            str += 'Slack';
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


    static formatScheduleDate(sd) {
        return moment(sd).format('L') + ' @ ' + moment(sd).format('LT');
    }


    render() {
        // this.setState( {Body: `notify ${this.props.group.GroupName}`} );   // <==============  move out of render and uncommnet

        // Form list of Scheduled Notifications for group
        const ScheduledNotificationist = this.state.scheduledNotifications.map((record) =>
            <Row className="row-striped">
                <Col xs={"2"}>
                    <i title="Edit" className="glyphicon glyphicon-edit clickable"
                       onClick={() => this.openEditScheduledNotificationModal(record)}/>
                    <i title="Delete from schedule" className="glyphicon glyphicon-remove-sign text-danger clickable"
                       onClick={() => this.openDeleteScheduledNotificationModal(record)}/>
                </Col>
                <Col xs={"4"}>{NotifyEmulator.formatScheduleDate(record.scheduleDate)}</Col>
                <Col xs={"6"}>{record.msg}</Col>
            </Row>
        );

        const NoScheduledNotificationist = (
            <Row className={"row-striped"}>
                <Col xs={"12"}>No Scheduled Notifications</Col>
            </Row>
        );

        return (
            <Fragment>
                <Card>
                    <CardBody>
                        <CardTitle>Message</CardTitle>
                        <Row>
                            <Col xs={"10"}>
                                <MDBInput name="msgtext" type="text" className="form-control emulator-input" autoFocus
                                          value={this.state.msgtext} onChange={this.handleInputChange}
                                          onKeyPress={this.onConversationKeypress}
                                          label="Notification message"/>
                            </Col>
                            <Col xs={"2"}>
                                <Button size={"sm"} color={"light"} disabled={!this.validConfirmSend()}
                                        onClick={this.openConfirmSendModal}>Confirm
                                </Button>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={"6"}>Scheduled Date: <MDBInput name="newScheduleDate" type="date"
                                                                    className="form-control emulator-input"
                                                                    value={this.state.newScheduleDate}
                                                                    onChange={this.handleInputChange}/></Col>
                            <Col xs={"6"}>Scheduled Time: <MDBInput name="newScheduleTime" type="time"
                                                                    className="form-control emulator-input"
                                                                    value={this.state.newScheduleTime}
                                                                    onChange={this.handleInputChange}/></Col>
                        </Row>
                        <Row>
                            <Col xs={"12"}>
                                <em>* Deferred for sending later</em>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={"12"} className="notificationsHeaderStyle">
                                <span onClick={() => this.toggleScheduleHide()}>
                                    Schedule&nbsp;
                                    <MDBIcon icon={this.state.scheduleHide ? 'circle-plus' : 'circle-minus'}/>
                                    &nbsp;Scheduled Notifications ({this.state.scheduledNotifications.length})</span>
                            </Col>
                        </Row>
                        <Row className={this.state.scheduleHide ? 'hidden' : ''}>
                            <Col xs={"11"}>
                                <Row>
                                    <Col xs={"12"} className="notificationsHeaderStyle">
                                        <span className="sub">Scheduled Notifications</span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        {
                                            this.state.scheduledNotifications.length > 0
                                                ? ScheduledNotificationist
                                                : NoScheduledNotificationist
                                        }
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <MDBModal show={this.state.confirmSendModal} onHide={this.close}>

                    <MDBModalHeader>Confirm Send Notification</MDBModalHeader>

                    <MDBModalBody>

                        <div className={this.state.sentMsg !== "" ? 'row visible' : 'row invisible'}>
                            <div className="col-md-12 red text-center">{this.state.sentMsg}</div>
                        </div>
                        <div className={this.state.sentMsg === "" ? 'visible' : 'invisible'}>
                            <div className="row">
                                <div className="col-md-4 text-right"><strong>Message:</strong></div>
                                <div className="col-md-8">{this.state.msgtext}</div>
                            </div>
                            <div className={"row " + (this.state.newScheduleDate === '' ? 'hidden' : '')}>
                                <div className="col-md-4 text-right"><strong>Scheduled date/time:</strong></div>
                                <div className="col-md-8">
                                    {NotifyEmulator.formatScheduleDate(moment(this.state.newScheduleDate + " " + this.state.newScheduleTime, "YYYY-MM-DD HH:mi"))}
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
                    </MDBModalBody>

                    <MDBModalFooter>
                        <div className="row">
                            <div className="col-md-12 pull-right">
                                <button
                                    className={"btn btn-primary" + (this.state.sentMsg !== '' ? ' hidden' : '')}
                                    disabled={this.state.sentMsg !== ""}
                                    onClick={() => this.handleSubmit()}>{this.state.newScheduleDate === '' ? 'Send' : 'Schedule'}</button>
                                <button className="btn btn-default"
                                        onClick={() => this.closeConfirmSendModal()}>{this.state.sentMsg !== '' ? 'Close' : 'Cancel'}</button>
                            </div>
                        </div>
                    </MDBModalFooter>
                </MDBModal>

                <MDBModal show={this.state.deleteScheduledNotificationModal} onHide={this.close}>
                    <MDBModalHeader>Confirm Delete Scheduled Notification</MDBModalHeader>

                    <MDBModalBody>
                        <div className="form-group">
                            <label>Are you sure you want to delete this?</label>
                        </div>

                        <div className="row">
                            <div className="col-md-4 text-right"><strong>Scheduled date/time:</strong></div>
                            <div
                                className="col-md-8">{this.state.currentScheduledNotification ? NotifyEmulator.formatScheduleDate(this.state.currentScheduledNotification.scheduleDate) : ''} </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4 text-right"><strong>Message:</strong></div>
                            <div
                                className="col-md-8">{this.state.currentScheduledNotification ? this.state.currentScheduledNotification.msg : ''} </div>
                        </div>
                    </MDBModalBody>

                    <MDBModalFooter>
                        <div className="row">
                            <div className="col-md-12 pull-right">
                                <button className="btn btn-danger"
                                        onClick={() => this.deleteScheduledNotification()}>Delete
                                </button>
                                <button className="btn btn-default"
                                        onClick={() => this.closeDeleteScheduledNotificationModal()}>Cancel
                                </button>
                            </div>
                        </div>
                    </MDBModalFooter>
                </MDBModal>

                <MDBModal show={this.state.editScheduledNotificationModal} onHide={this.close}>
                    <MDBModalHeader>Edit Scheduled Notification</MDBModalHeader>

                    <MDBModalBody>
                        <div className="row">
                            <div className="col-md-4 text-right"><strong>Scheduled date/time:</strong></div>
                            <div className="col-md-4">
                                <input name="editScheduleDate" type="date"
                                       className="form-control emulator-input"
                                       defaultValue={this.state.currentScheduledNotification ? this.state.editScheduleDate : ''}
                                       onChange={this.handleInputChange}/>
                            </div>
                            <div className="col-md-4">
                                <input name="editScheduleTime" type="time"
                                       className="form-control emulator-input"
                                       defaultValue={this.state.currentScheduledNotification ? this.state.editScheduleTime : ''}
                                       onChange={this.handleInputChange}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4 text-right"><strong>Message:</strong></div>
                            <div className="col-md-8">
                                <input name="editMsg" type="text" className="form-control emulator-input"
                                       defaultValue={this.state.currentScheduledNotification ? this.state.editMsg : ''}
                                       onChange={this.handleInputChange}
                                       placeholder="Enter notification message here"/>
                            </div>
                        </div>
                    </MDBModalBody>

                    <MDBModalFooter>
                        <div className="row">
                            <div className="col-md-12 pull-right">
                                <button className="btn btn-primary" disabled={!this.validEdit()}
                                        onClick={() => this.editScheduledNotification()}>Submit
                                </button>
                                <button className="btn btn-default"
                                        onClick={() => this.closeEditScheduledNotificationModal()}>Cancel
                                </button>
                            </div>
                        </div>
                    </MDBModalFooter>
                </MDBModal>

            </Fragment>
        )
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(NotifyEmulator);
