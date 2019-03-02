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
    Button,
    Card,
    CardBody,
    CardTitle,
    Col,
    MDBIcon,
    MDBInput,
    MDBModal,
    MDBModalBody,
    MDBModalFooter,
    MDBModalHeader,
    MDBTable,
    MDBTableBody,
    MDBTableHead,
    Row,
    toast
} from 'mdbreact';
import moment from 'moment';

// === Manifest constants

const EnterKey = 13;
const DefaultToPhone = '9132703506';
const DefaultFromPhone = '9195550123';


// === Helper components

const IconEdit = () => <MDBIcon style={{color: "blue"}} icon={"edit"}/>;


const IconDelete = () => <MDBIcon style={{color: "red"}} icon={"minus-circle"}/>;


const NoScheduledNotificationList = () =>
    <Row><Col><span style={{fontWeight: "300", fontSize: "0.8rem"}}> (No Scheduled Notifications)</span></Col></Row>;


// === Utility functions

const formatScheduleDateTime = (sd) => (`${moment(sd).format('L hh:mm a')}`);

const formatScheduleDate = (sd) => (`${moment(sd).format('L')}`);

const formatScheduleTime = (sd) => (`${moment(sd).format('hh:mm a')}`);

const createScheduleDate = (tmpDate, tmpTime) => {
    const scheduleTimeExists = tmpTime !== 'undefined' && !isEmpty(tmpTime);
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
};

const isEmpty = obj => !Object.keys(obj).length;


/**
 * This pure function creates a string of comma-separated values governed by group media boolean flags.
 * Examples: "SMS, Email", or "SMS" or "Email, Slack", or empty string, or ...
 *
 * @param group (object containing media flags)
 * @returns string
 */
const sendingMedia = group => {
    const {checkSMS, checkEmail, checkSlack} = group;

    const initialAccumulator = '';
    let currentSeparator = '';

    return [
        {bool: checkSMS, value: 'SMS'},
        {bool: checkEmail, value: 'Email'},
        {bool: checkSlack, value: 'Slack'}
    ]
        .filter(obj => obj.bool)
        .reduce((accumulator, current) => {
            accumulator += currentSeparator + current.value;
            currentSeparator = ', ';
            return accumulator;
        }, initialAccumulator);
};


/**
 * The actual NotifyEmulator component
 */
class NotifyEmulator extends BaseComponent {

    constructor(props) {
        super(props);

        this.state = {
            group: props.group,
            scheduledNotifications: [],
            msgtext: '',
            sentMsg: '',
            Body: `notify ${props.group.GroupName} `,
            To: DefaultToPhone,
            From: props.phone || DefaultFromPhone,
            confirmSendModal: false,
            editScheduledNotificationModal: false,
            deleteScheduledNotificationModal: false,
            scheduleHide: true,
            newScheduleDate: '',
            newScheduleTime: ''
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.onConversationKeypress = this.onConversationKeypress.bind(this);
        this.openConfirmSendModal = this.openConfirmSendModal.bind(this);
        this.closeConfirmSendModal = this.closeConfirmSendModal.bind(this);
        this.toggleScheduleHide = this.toggleScheduleHide.bind(this);
        this.closeEditScheduledNotificationModal = this.closeEditScheduledNotificationModal.bind(this);
        this.editScheduledNotification = this.editScheduledNotification.bind(this);
        this.deleteScheduledNotification = this.deleteScheduledNotification.bind(this);
        this.closeDeleteScheduledNotificationModal = this.closeDeleteScheduledNotificationModal.bind(this);
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

        const tmpScheduleDate = createScheduleDate(this.state.newScheduleDate, this.state.newScheduleTime);
        const sentMsgText = !isNaN(tmpScheduleDate) ? 'Message Scheduled' : 'Message Sent';

        const payload = {
            Body: `notify ${this.props.group.GroupName} ${this.state.msgtext}`,
            From: this.state.From,
            To: this.state.To,
            scheduleDate: tmpScheduleDate
        };

        restAPI({
            method: 'POST',
            url: '/api/convo',
            data: payload,
            headers: {"token": this.props.credentials.apitoken}
        }).then(() => {
            toast.success(sentMsgText);
            this.setState({
                msgtext: '',
                sentMsg: sentMsgText,
                scheduleHide: true,
                newScheduleDate: '',
                newScheduleTime: ''
            });

            // self.getConversationsForPhone();
            this.fetchScheduledNotifications();
            this.closeConfirmSendModal();
        }).catch(err => console.log(err));

    }


    fetchScheduledNotifications() {

        restAPI({
            method: 'get',
            url: '/api/notify/schedulednotification',
            params: {'group': this.state.group.GroupName}
        }).then(res => {
            this.setState({
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
            // Prevent lagging state:
            window.setTimeout(() => {
                this.setState({
                    group: nextProps.group,
                    Body: `notify ${nextProps.group.GroupName} `,
                    msgtext: '',
                    sentMsg: '',
                    newScheduleDate: '',
                    newScheduleTime: '',
                    scheduledNotifications: []
                });

                this.fetchScheduledNotifications();
            }, 0);
        }
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

        restAPI({
            method: 'delete',
            url: '/api/notify/schedulednotification',
            data: this.state.currentScheduledNotification
        }).then(() => {
            const deletedFilteredOut = this.state.scheduledNotifications.filter((item) => {
                return item._id !== this.state.currentScheduledNotification._id;
            });
            this.setState({
                scheduledNotifications: deletedFilteredOut,
                scheduleHide: true
            });

            this.closeDeleteScheduledNotificationModal();
            toast.success('Notification message deleted');
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
        csn.scheduleDate = createScheduleDate(this.state.editScheduleDate, this.state.editScheduleTime);
        csn.msg = this.state.editMsg;

        restAPI({
            method: 'put',
            url: '/api/notify/schedulednotification',
            data: csn
        }).then(() => {
            this.setState({
                currentScheduledNotification: {},
                editScheduleDate: '',
                editScheduleTime: '',
                editMsg: ''
            });
            this.fetchScheduledNotifications();
            this.closeEditScheduledNotificationModal();

        }).catch(err => console.log(err));
    }


    /**
     * Send is valid if: there is a message, there is at least one sending medium, and there is either a complete
     * date-time or none.
     * @returns {boolean}
     */
    validConfirmSend() {
        return this.state.msgtext &&
            (this.props.group.checkSMS || this.props.group.checkEmail || this.props.group.checkSlack) &&
            this.props.group.Users.length &&
            (!(this.state.scheduleTime ^ this.state.scheduleDate));
    }


    /**
     * Edit allowed if there is an edit message and there is either a complete
     * date-time or none.
     * @returns {boolean}
     */
    validEdit() {
        return this.state.editMsg && (!(this.state.scheduleTime ^ this.state.scheduleDate));
    }


    toggleScheduleHide() {
        this.setState({
            scheduleHide: !this.state.scheduleHide,
            scheduleDate: '',
            scheduleTime: ''
        });
    }


    modalConfirmSend() {
        const formattedTime = formatScheduleTime(`${this.state.newScheduleDate} ${this.state.newScheduleTime}`);
        const maybeHideWhen = formattedTime.includes('Invalid') ? {display: "none"} : {};

        const textCreateOrSend = this.state.newScheduleDate ? 'Schedule' : 'Send';

        return (

            <MDBModal isOpen={this.state.confirmSendModal}>
                <div className={"modal-wrapper"}>

                    <MDBModalHeader>{textCreateOrSend} Notification?</MDBModalHeader>

                    <MDBModalBody>
                        <Row>
                            <Col md={"4"} className="text-right modal-label">Message</Col>
                            <Col md={"8"} className={"modal-value"}>{this.state.msgtext}</Col>
                        </Row>

                        <div style={maybeHideWhen}>
                            <Row>
                                <Col md={"4"} className="text-right modal-label">Date</Col>
                                <Col md={"8"}
                                     className={"modal-value"}>{formatScheduleDate(this.state.newScheduleDate)}</Col>
                            </Row>
                            <Row>
                                <Col md={"4"} className="text-right modal-label">Time</Col>
                                <Col md={"8"} className={"modal-value"}>{formattedTime}</Col>
                            </Row>
                        </div>

                        <Row>
                            <Col md={"4"} className="text-right modal-label"># Users</Col>
                            <Col md={"8"} className={"modal-value"}>{this.props.group.Users.length}</Col>
                        </Row>
                        <Row>
                            <Col md={"4"} className="text-right modal-label">Media</Col>
                            <Col md={"8"} className={"modal-value"}>{sendingMedia(this.props.group)}</Col>
                        </Row>
                    </MDBModalBody>

                    <MDBModalFooter>
                        <Row>
                            <Col md={"12"} className="pull-right">
                                <Button color={"primary"} onClick={this.handleSubmit}>{textCreateOrSend}</Button>
                                <Button color={"red"} onClick={this.closeConfirmSendModal}>Cancel</Button>
                            </Col>
                        </Row>
                    </MDBModalFooter>
                </div>
            </MDBModal>
        )
    };


    modalDeleteScheduledNotification() {

        return (
            <MDBModal isOpen={this.state.deleteScheduledNotificationModal}>
                <div className={"modal-wrapper"}>
                    <MDBModalHeader>Delete Notification?</MDBModalHeader>

                    <MDBModalBody>
                        <Row>
                            <Col md={"4"} className="text-right modal-label">Date</Col>
                            <Col md={"8"} className={"modal-value"}>{this.state.currentScheduledNotification
                                ? formatScheduleDate(this.state.currentScheduledNotification.scheduleDate) : ''}</Col>
                        </Row>
                        <Row>
                            <Col md={"4"} className="text-right modal-label">Time</Col>
                            <Col md={"8"} className={"modal-value"}>{this.state.currentScheduledNotification
                                ? formatScheduleTime(this.state.currentScheduledNotification.scheduleTime) : ''}</Col>
                        </Row>
                        <Row>
                            <Col md={"4"} className="text-right modal-label">Message</Col>
                            <Col md={"8"} className={"modal-value"}>{this.state.currentScheduledNotification
                                ? this.state.currentScheduledNotification.msg : ''}</Col>
                        </Row>
                    </MDBModalBody>

                    <MDBModalFooter>
                        <Row className="row">
                            <Col md={"12"} className="pull-right">
                                <Button color={"primary"}
                                        onClick={this.deleteScheduledNotification}>Delete
                                </Button>
                                <Button color={"red"}
                                        onClick={this.closeDeleteScheduledNotificationModal}>Cancel
                                </Button>
                            </Col>
                        </Row>
                    </MDBModalFooter>
                </div>
            </MDBModal>
        );
    }


    modalEditScheduledNotification() {
        return (
            <MDBModal isOpen={this.state.editScheduledNotificationModal}>
                <div className={"modal-wrapper"}>
                    <MDBModalHeader>Edit Notification</MDBModalHeader>

                    <MDBModalBody>
                        <Row>
                            <Col md={"4"} className={"modal-value"}>
                                <MDBInput name="editScheduleDate" type="date"
                                          className="emulator-input"
                                          value={this.state.currentScheduledNotification
                                              ? this.state.editScheduleDate : ''}
                                          onChange={this.handleInputChange}
                                          label={"Scheduled Date"}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={"4"} className={"modal-value"}>
                                <MDBInput name="editScheduleTime" type="time"
                                          className="emulator-input"
                                          value={this.state.currentScheduledNotification
                                              ? this.state.editScheduleTime : ''}
                                          onChange={this.handleInputChange}
                                          label={"Scheduled Time"}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={"12"} className={"modal-value"}>
                                <label htmlFor="notificationEditMsg" className={"modal-label"}>Message</label>
                                <textarea name="editMsg" id={"notificationEditMsg"} className="form-control"
                                          style={{height: "5rem"}}
                                          value={this.state.currentScheduledNotification
                                              ? this.state.editMsg : ''}
                                          onChange={this.handleInputChange}
                                />
                            </Col>
                        </Row>
                    </MDBModalBody>

                    <MDBModalFooter>
                        <Row>
                            <Col md={"12"} className="pull-right">
                                <Button color={"primary"} disabled={!this.validEdit()}
                                        onClick={this.editScheduledNotification}>Save</Button>
                                <Button color={"red"}
                                        onClick={this.closeEditScheduledNotificationModal}>Cancel</Button>
                            </Col>
                        </Row>
                    </MDBModalFooter>
                </div>
            </MDBModal>
        );
    }


    rowMessageSubmit() {
        return (
            <Row>
                <Col xs={"8"}>
                    <MDBInput name="msgtext" type="text" className="form-control emulator-input" autoFocus
                              value={this.state.msgtext} onChange={this.handleInputChange}
                              onKeyPress={this.onConversationKeypress}
                              label="Notification message"/>
                </Col>
                <Col xs={"4"}>
                    <Button size={"sm"} color={"light"} disabled={!this.validConfirmSend()}
                            onClick={this.openConfirmSendModal}><MDBIcon icon="check"/>&nbsp;Submit</Button>
                </Col>
            </Row>
        )
    }


    rowDateTime() {
        return (
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
        )
    }


    rowSchedule() {
        const wantHidden = this.state.scheduleHide ? {display: "none"} : {};
        const show = <span><MDBIcon icon="eye" /> Show </span>;
        const hide = <span><MDBIcon icon="eye-slash" /> Hide </span>;

        return (
            <Fragment>
                <Row>
                    <Col xs={"12"}>
                        <Row>
                            <Col>
                                <label>
                                    <Button color={"light"} onClick={this.toggleScheduleHide} size={"sm"}>
                                        {this.state.scheduleHide ? show : hide }
                                        ({this.state.scheduledNotifications.length})
                                        scheduled notifications
                                    </Button>
                                </label>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row style={wantHidden}>
                    <Col xs={"12"}>
                        <Row>
                            <Col>
                                {this.state.scheduledNotifications.length
                                    ? this.scheduledNotificationList()
                                    : <NoScheduledNotificationList/>
                                }
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Fragment>
        )
    }


    /**
     * Collects list of Scheduled Notifications for group
     */
    scheduledNotificationList() {
        return (
            <Fragment>
                <Row>
                    <Col xs={"12"}>
                        <span style={{fontWeight: 200, fontSize: "0.9rem"}}>Deferred for later sending:</span>
                    </Col>
                </Row>
                <MDBTable small striped>
                    <MDBTableHead>
                        <tr>
                            <th/>
                            <th/>
                            <th>Timestamp</th>
                            <th>Message</th>
                        </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                        {this.scheduledNotificationListBody()}
                    </MDBTableBody>
                </MDBTable>
            </Fragment>
        )
    }


    /**
     * Renders the scheduledNotifications to a table body
     *
     * @returns {*[]}
     */
    scheduledNotificationListBody() {

        const schedlineItemStyle = {fontSize: "0.98rem", fontFamily: "monospace", color: "#666"};

        return this.state.scheduledNotifications.map((sn, key) =>
            <tr key={key}>
                <td onClick={() => this.openEditScheduledNotificationModal(sn)}><IconEdit/></td>
                <td onClick={() => this.openDeleteScheduledNotificationModal(sn)}><IconDelete/></td>
                <td>
                    <span style={schedlineItemStyle}>{formatScheduleDateTime(sn.scheduleDate)}</span>
                </td>
                <td>
                    <span style={schedlineItemStyle}>{sn.msg}</span>
                </td>
            </tr>
        )
    }


    render() {

        return (
            <Fragment>
                <Card>
                    <CardBody>
                        <CardTitle>Message</CardTitle>
                        {this.rowMessageSubmit()}
                        {this.rowDateTime()}
                        {this.rowSchedule()}
                    </CardBody>
                </Card>

                {this.modalConfirmSend()}
                {this.modalDeleteScheduledNotification()}
                {this.modalEditScheduledNotification()}

            </Fragment>
        )
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(NotifyEmulator);
