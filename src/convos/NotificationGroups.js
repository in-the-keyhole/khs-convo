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
import {Modal} from 'react-bootstrap';
import '../styles/data-table.css';
import BootstrapTable from 'react-bootstrap-table-next';
import GroupUserList from './GroupUserList';
import BaseComponent from '../BaseComponent';// noinspection ES6CheckImport
import {
    Container,
    Row,
    Col,
    Button,
    Card,
    CardBody,
    CardTitle,
    MDBIcon
} from 'mdbreact';
import {connect} from "react-redux";
import paginationFactory from 'react-bootstrap-table2-paginator';
// import cellEditFactory, {Type} from 'react-bootstrap-table2-editor';
// import {pageinationOptions} from "../common/pageinationOptions";


class NotificationGroups extends BaseComponent {

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            GroupName: '',
            group: '',
            currentGroup: {
                GroupName: '',
                users: []
            },
            showUserList: false

        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.groupToolbar = this.groupToolbar.bind(this);
        this.openAddGroupModal = this.openAddGroupModal.bind(this);
        this.deleteGroup = this.deleteGroup.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.showGroupUsers = this.showGroupUsers.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.closeAddGroupModal = this.closeAddGroupModal.bind(this);
        //this.deleteUser = this.deleteUser.bind(this);

    }

    addGroup(event) {
        event.preventDefault();

        const add = {
            GroupName: this.state.GroupName,
            checkSMS: true,
            checkEmail: false,
            checkSlack: false,
            Users: [],

        };

        restAPI({
            method: 'post',
            url: '/api/notify/group',
            data: add
        }).then(res => {
            this.showGroupUsers(res.data);
            this.closeAddGroupModal();
            this.fetchGroups();

        }).catch(err => console.log(err));
    }

    fetchGroups() {
        restAPI({
            method: 'get',
            url: '/api/notify/group',
            data: this.state
        }).then(res => (
            this.setState({users: res.data})
        )).catch(err => console.log(err));
    }

    onAfterSaveGroup(row, cellName, cellValue) {

        const update = {
            uuid: row.uuid,
            [cellName]: cellValue
        };

        restAPI({
            method: 'put',
            url: '/api/notify/group',
            data: update,
        }).then(() => {
            this.fetchGroups();
        }).catch((err) => console.log(err));
    }

    deleteGroup() {
        console.log(this.state.currentGroup);
        restAPI({
            method: 'delete',
            url: '/api/notify/group',
            data: this.state.currentGroup
        }).then(() => {

            this.showGroupUsers({GroupName: ''});
            this.closeDeleteModal();
            this.fetchGroups();

        }).catch(err => console.log(err));

    }


    componentWillMount() {
        super.componentWillMount();
        this.fetchGroups();
    }


    handleInputChange(event) {
        const target = event.target;
        this.setState({
            [target.name]: target.value,
            errorMsg: ''
        });
    }


    showGroupUsers(row) {
        //console.log(row);
        this.setState({
            currentGroup: row,
            showUserList: true,
            group: 'User list for ' + row.GroupName

        });
    }


    openDeleteModal(group) {
        this.setState({
            currentGroup: group,
            deleteModal: true
        })
    }


    closeDeleteModal() {
        this.setState({
            deleteModal: false
        })
    }


    openAddGroupModal() {
        this.setState({addGroupModal: true})
    }


    closeAddGroupModal() {
        this.setState({addGroupModal: false})
    }


    groupToolbar(cell, row) {
        return (
            <div className="adminIcons">
                <i title="View Group" className="glyphicon glyphicon-cog clickable"
                   onClick={this.showGroupUsers(row)}/>
                <i title="Delete Group" className="glyphicon glyphicon-remove-sign text-danger clickable"
                   onClick={this.openDeleteModal(row)}/>
            </div>
        )
    }


    static groupUsers(cell, row) {
        return (
            <div className="groupListUserCount">{row.Users.length}</div>
        )
    }


    render() {


        /*
         <TableHeaderColumn dataField='uuid' isKey hidden>ID</TableHeaderColumn>
         <TableHeaderColumn width="60%" dataField='GroupName'>Group Name</TableHeaderColumn>
         <TableHeaderColumn width="20%" dataAlign="center" dataField='Users' editable={false}
                            dataFormat={NotificationGroups.groupUsers}># Users</TableHeaderColumn>
         <TableHeaderColumn width="20%" dataAlign="center" editable={false} dataFormat={this.groupToolbar}> </TableHeaderColumn>
         */

        const columns = [
            {
                hidden: true,
                dataField: '_id',
            },
            {
                hidden: true,
                dataField: 'uuid',
                isKey: true
            },
            {
                text: 'Group Name',
                dataField: 'GroupName',
                width: "60%",
                sort: true
            },
            {
                text: 'Users',
                dataField: 'Users',
                width: "20%",
                sort: true
            }
        ];

        return (

            <Fragment>
                <Card>
                    <CardBody>
                        <CardTitle>Groups</CardTitle>
                        <Row>
                            <Col md={"8"}>

                                <Row>
                                    <Col md={"9"}> </Col>
                                    <Col md={"3"}>
                                        <Button size={"md"} color={"light"} style={{width: "100%"}}
                                            onClick={this.openAddGroupModal}>
                                            <MDBIcon icon="plus-circle"/>&nbsp;Add Group</Button>
                                    </Col>
                                </Row>

                                <Row className="row list">
                                    <Col>
                                        <BootstrapTable
                                            bootstrap4
                                            data={this.state.users}
                                            columns={columns}
                                            keyField={'uuid'}
                                            pagination={paginationFactory()}
                                            //insertRow={ true }
                                            noDataIndication="No groups"

                                            cellEdit={{
                                                mode: 'click',
                                                blurToSave: true,
                                                afterSaveCell: this.onAfterSaveGroup
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </Col>

                            <Col md={"4"} className="col-md-offset-1">
                                <GroupUserList group={this.state.currentGroup}/>
                            </Col>
                        </Row>

                    </CardBody>
                </Card>

                <Modal show={this.state.addGroupModal} onHide={this.close}>
                    <Modal.Body>
                        <form className="form" onSubmit={this.addGroup}>

                            <Container>
                                <Row>

                                    <Col md={"3"}>
                                        <div className="form-group">
                                            <input
                                                name="GroupName"
                                                id="GroupName"
                                                className="form-control"
                                                type="text"
                                                required="required"
                                                value={this.state.GroupName}
                                                onChange={this.handleInputChange}
                                                placeholder="Group Name"/>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={"12"}>
                                        <input className="btn btn-primary" type="submit" value="Add Group"/>
                                        <Button color={"dark"} onClick={this.closeAddGroupModal}>Cancel
                                        </Button>
                                    </Col>
                                </Row>
                            </Container>
                        </form>
                    </Modal.Body>
                </Modal>

                <Modal show={this.state.deleteModal} onHide={this.close}>
                    <Modal.Body>
                        <div className="form-group">
                            <label>Are you sure you want to delete this?</label>
                        </div>
                        <Row>
                            <Col md={"3"}> </Col>
                            <Col md={"4"}>
                                <Button color={"danger"} onClick={this.deleteGroup}>Delete</Button>
                            </Col>
                            <Col md={"5"}>
                                <Button color={"light"} onClick={this.closeDeleteModal}>Cancel</Button>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>

            </Fragment>
        )
    }
}


const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(NotificationGroups);
