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

import React from 'react';
import _ from "lodash";
import restAPI from '../service/restAPI';
import NotifyEmulator from './NotifyEmulator';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";
// noinspection ES6CheckImport
import {
    MDBIcon,
    MDBInput,
    Button,
    Row,
    Col,
    Card,
    CardBody,
    CardTitle
} from 'mdbreact';
import BootstrapTable from 'react-bootstrap-table-next';
import CommonUI from "../common/CommonUI";
import paginationFactory from "react-bootstrap-table2-paginator";
import {pageinationOptions} from "../common/pageinationOptions";


const managementToolbar = (cell, row, rowIndex, context) => {

    return <div className="btn-group" role="toolbar" aria-label="management">
        <div onClick={() => context.deleteUser(row.uuid)}>
            <MDBIcon style={{marginLeft: '0.5rem', color: 'red'}} size={'lg'} icon={"minus-circle"}/>
        </div>
    </div>
};


const SendList = props => {
    const {
        users,
        context
    } = props;

    const columns = [
        {
            hidden: true,
            dataField: 'uuid',
            isKey: true
        },
        {
            text: 'Name',
            dataField: 'Name',
            sort: true,
            sortCaret: CommonUI.ColumnSortCaret,
            editable: true
        },
        {
            text: 'Manage',
            dataField: 'df1',
            isDummyField: true,
            width: '5%',
            formatter: managementToolbar,
            formatExtraData: context,
            editable: false,
            align: 'center',
            headerAlign: 'center'
        }
    ];

    return <Row>
        <Col>
            <BootstrapTable
                bootstrap4
                data={users}
                columns={columns}
                keyField={'uuid'}
                insertRow={false}
                pagination={paginationFactory(pageinationOptions)}
                striped
                hover
                condensed
            />
        </Col>
    </Row>;

};


const UserOptionList = props => {
    const {
        availableUsers
    } = props;

    return availableUsers.map(user => (
        <option key={user.uuid} value={user.uuid}>{user.Name} - {user.Username}</option>
    ));
};


class GroupUserList extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            availableUsers: [],
            mailingList: this.props.group.Users,
            groupName: this.props.group.GroupName
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.addUser = this.addUser.bind(this);
        this.addAllUsers = this.addAllUsers.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }


    putGroup(group, reloadUsers) {
        if (!reloadUsers) {
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

            this.setState({user: ''});
        }
    }


    addAllUsers(/*event*/) {
        const group = this.props.group;
        // noinspection JSValidateTypes
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


    handleChange(evt) {
        let group = this.props.group;
        group[evt.target.name] = evt.target.checked;
        this.putGroup(group, false)
    }


    sendingPanel() {

        return (
            <Card>
                <CardBody>
                    <CardTitle>Send</CardTitle>

                    <Row>
                        <Col md={"12"} className="notificationsHeaderStyle"><span>Network</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={"3"}>
                            <MDBInput type={"checkbox"} name="checkSMS" checked={this.props.group.checkSMS}
                                      label={"SMS"}
                                      onChange={this.handleChange}/>
                        </Col>
                        <Col md={"3"}>
                            <MDBInput type={"checkbox"} name="checkEmail" checked={this.props.group.checkEmail}
                                      label={"Email"}
                                      onChange={this.handleChange}/>
                        </Col>
                        <Col md={"6"}>
                            <MDBInput type={"checkbox"} name="checkSlack" checked={this.props.group.checkSlack}
                                      label={`Slack ${this.props.credentials.slackchannel}`}
                                      onChange={this.handleChange}/>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={"12"} className="notificationsHeaderStyle">
                            <span>User Selection ({this.props.group.Users.length})</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={"8"}>
                            <select value={this.state.user} className="form-control emulator-input"
                                    onChange={this.addUser}>
                                <option value="">&minus; choose user to add &minus;</option>
                                <UserOptionList availableUsers={this.state.availableUsers}/>
                            </select>
                        </Col>
                        <Col xs={"4"}>
                            <Button size={"sm"} color={"light"} onClick={this.addAllUsers}>Add All</Button>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={"12"} className={this.props.group.Users.length > 0 ? '' : 'hidden'}>
                            <Row>
                                <Col xs={"12"} className="notificationsHeaderStyle">
                                    <span className="sub">Group Members</span>
                                </Col>
                            </Row>

                            <SendList context={this} users={this.props.group.Users}/>

                        </Col>
                    </Row>
                </CardBody>
            </Card>
        );

    }


    render() {
        if (!this.props.group.GroupName) {
            return null;
        }

        return (
            <Card>
                <CardBody>
                    <CardTitle>Group {this.props.group.GroupName}</CardTitle>

                    <NotifyEmulator group={this.props.group}/>
                    <br/>
                    {this.sendingPanel()}

                </CardBody>
            </Card>
        )
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(GroupUserList);
