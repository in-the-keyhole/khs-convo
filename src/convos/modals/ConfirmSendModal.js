/*
 * Copyright (c) 2019 Keyhole Software LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

import {Button, Col, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader, Row} from "../NotifyEmulator";
import {Fragment} from "react";
import React from "react";
import moment from 'moment';

export function ConfirmSendModal(props) {
    const {
        confirmSendModal,
        close,
        sentMsg,
        msgtext,
        newScheduleDate,
        users,
        sendingMedia,
        handleSubmit,
        closeConfirmSendModal} = props;

    return (
        <Fragment>
            <MDBModal isOpen={confirmSendModal} onHide={close} size={"lg"}>

                <MDBModalHeader>Confirm Notification</MDBModalHeader>

                <MDBModalBody>

                    <Row className={sentMsg !== '' ? 'row visible' : 'row invisible'}>
                        <Col md="{12}" className="red text-center">{sentMsg}</Col>
                    </Row>
                    <div className={sentMsg === '' ? 'visible' : 'invisible'}>
                        <Row className="row">
                            <Col md={"4"} className="text-right">Message:</Col>
                            <Col md={"8"}>{msgtext}</Col>
                        </Row>
                        <Row className={newScheduleDate === '' ? 'hidden' : ''}>
                            <Col md={"4"} className="text-right">When:</Col>
                            <Col md={"8"}>
                                {NotifyEmulator.formatScheduleDate(
                                    moment(
                                        `${newScheduleDate} ${newScheduleTime}`,
                                        'YYYY-MM-DD HH:mi'))}
                            </Col>
                        </Row>
                        <Row className="row">
                            <Col md={"4"} className="text-right"># Users:</Col>
                            <Col md={"8"}>{users.length}</Col>
                        </Row>
                        <Row className="row">
                            <Col md={"4"} className="text-right">Media:</Col>
                            <Col md={"8"}>{sendingMedia()}</Col>
                        </Row>
                    </div>
                </MDBModalBody>

                <MDBModalFooter>
                    <Row>
                        <Col md={"12"} className="pull-right">
                            <Button color={"primary"}
                                    className={sentMsg !== '' ? ' hidden' : ''}
                                    disabled={sentMsg}
                                    onClick={handleSubmit}>{newScheduleDate === '' ? 'Send' : 'Schedule'}</Button>
                            <Button color={"red"}
                                    onClick={closeConfirmSendModal}>{sentMsg !== '' ? 'Close' : 'Cancel'}</Button>
                        </Col>
                    </Row>
                </MDBModalFooter>
            </MDBModal>
        </Fragment>
    );

}
