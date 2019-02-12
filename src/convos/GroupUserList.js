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
import _ from "lodash";
import restAPI from '../service/restAPI';
import NotifyEmulator from './NotifyEmulator';
import {Checkbox} from 'react-bootstrap';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";
// noinspection ES6CheckImport
import {
    Row,
    Col,
    Card,
    CardBody,
    CardTitle
} from 'mdbreact';

class GroupUserList extends BaseComponent {
    constructor(props) {
        super(props);
        console.log('GroupUserList credentials', props.credentials);

        this.state = {
            availableUsers: [],
            mailingList: this.props.group.Users,
            groupName: this.props.group.GroupName
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.addUser = this.addUser.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    putGroup(group, reloadUsers) {
        if (reloadUsers === undefined) {
            reloadUsers = true;
        }

        restAPI({
            method: 'put',
            url: '/api/notify/group',
            data: group,
        }).then(() => {
            if (reloadUsers) {
                this.fetchUsers();
            } else {
                this.setState({});
            }
        }).catch(err => console.log(err));
    }


    fetchUsers() {
        restAPI({
            url: '/api/admin',
            data: this.state
        }).then(res => {
            this.setState({
                availableUsers: res.data
            });
        }).catch(err => console.log(err));
    }


    addUser(event) {
        const selectedUser = _.find(this.state.availableUsers, {'uuid': event.target.value});

        if (selectedUser) {
            const userExists = _.find(this.props.group.Users, {'uuid': event.target.value}) !== undefined;

            if (!userExists) {
                const newUser = {
                    uuid: selectedUser.uuid,
                    Name: selectedUser.Name,
                    Username: selectedUser.Username
                };
                const group = this.props.group;
                group.Users.push(newUser);

                this.putGroup(group);

            }

            this.setState({user: ""});
        }
    }

    addAllUsers(/*event*/) {
        const group = this.props.group;
        group.Users = _.map(this.state.availableUsers, _.partialRight(_.pick, ['uuid', 'Name', 'Username']));

        this.putGroup(group);
    }

    deleteUser(userId) {
        const group = this.props.group;
        const list = group.Users;

        _.pullAllBy(list, [{'uuid': userId}], 'uuid');

        _.map(list, 'uuid');

        group.Users = list;

        this.putGroup(group);
    }


    componentWillMount() {
        super.componentWillMount();
        this.fetchUsers();
    }


    componentWillReceiveProps() {
        // this.setState(this.props);
    }


    handleChange(evt) {
        let group = this.props.group;
        group[evt.target.name] = evt.target.checked
        this.putGroup(group, false)
    }


    render() {
        if (!this.props.group.GroupName) {
            return null;
        }

        const MailingList = this.props.group.Users.map((user) =>
            <div className="row row-striped">
                <div className="col-xs-1"><i title="Remove from list"
                                             className="glyphicon glyphicon-remove-sign text-danger clickable"
                                             onClick={() => this.deleteUser(user.uuid)}/></div>
                <div className="col-xs-4">{user.Name}</div>
                <div className="col-xs-6">{user.Username}</div>
            </div>
        );

        const selectUsers = this.state.availableUsers.map((user) =>
            <option key={user.uuid} value={user.uuid}>{user.Name} - {user.Username}</option>
        );

        return (
            <Fragment>
                <Card>
                    <CardBody>
                        <CardTitle>{this.props.group.GroupName}</CardTitle>

                        <NotifyEmulator group={this.props.group}/>

                        <Row className="row">
                            <Col md={"12"}  className="notificationsHeaderStyle"><span>Send To</span></Col>
                        </Row>
                        <Row className="row">
                            <Col md={"3"}>
                                <Checkbox name="checkSMS" checked={this.props.group.checkSMS}
                                          onChange={this.handleChange}>SMS</Checkbox>
                            </Col>
                            <Col md={"3"}>
                                <Checkbox name="checkEmail" checked={this.props.group.checkEmail}
                                          onChange={this.handleChange}>Email</Checkbox>
                            </Col>
                            <Col md={"3"}>
                                <Checkbox name="checkSlack" checked={this.props.group.checkSlack}
                                          onChange={this.handleChange}>Slack
                                    ({this.props.credentials.slackchannel})</Checkbox>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={"12"} className="notificationsHeaderStyle">
                                <span>Users ({this.props.group.Users.length})</span></Col>
                        </Row>
                        <Row className="row">
                            <Col xs={"12"}>
                                <select value={this.state.user} className="form-control emulator-input"
                                        onChange={this.addUser}>
                                    <option value="">Select user to add to list OR click 'Add All' button</option>
                                    {selectUsers}
                                </select>
                            </Col>
                            <Col xs={"2"}>
                                <button className="btn btn-default" onClick={() => this.addAllUsers()}>Add All</button>
                            </Col>
                        </Row>

                        <Row className="row">
                            <div className={this.props.group.Users.length > 0 ? 'col-xs-offset-1 col-xs-11' : 'hidden'}>
                                <Row className="row">
                                    <Col xd={"12"} className="notificationsHeaderStyle"><span className="sub">Currently assigned Users to Group</span>
                                    </Col>
                                </Row>
                                {MailingList}
                            </div>
                        </Row>
                    </CardBody>
                </Card>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(GroupUserList);
