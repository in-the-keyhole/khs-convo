/*
Copyright (c) 2017 Keyhole Software LLC

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
// import AddUser from './AddUser.js';
// import UserList from './UserList';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory /*, { textFilter, selectFilter }*/ from 'react-bootstrap-table2-filter';
import BootstrapTable from 'react-bootstrap-table-next';
import CommonUI from '../common/CommonUI';
import {
    Card,
    CardBody,
    CardTitle,
    Container,
    Button,
    Row,
    Col,
    // Input,
    MDBIcon,
    Modal,
    ModalBody,
    // ModalHeader,
    // ModalFooter
} from 'mdbreact';
import BaseComponent from '../BaseComponent';

class Admin extends BaseComponent {

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            registrationEmail: '',
            currentUser: '',
            errorMsg: ''
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.addUser = this.addUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.userToolbar = this.userToolbar.bind(this);
    }


    addUser(event) {
        const add = {
            FirstName: this.state.FirstName,
            LastName: this.state.LastName,
            Phone: this.state.Phone,
            Email: this.state.Email,
            ConfirmEmail: this.state.ConfirmEmail,
            Status: this.state.Status,
            Name: this.state.FirstName + ' ' + this.state.LastName,
            basePath: window.location.origin
        };

        ajax({
            method:'post',
            url:'/api/admin',
            data: add
        }).then( (res) => {

            if (res && res.data && res.data === 'The email address is already registered') {
                this.setState({
                    errorMsg: 'The email address is already registered.'
                })
            } else if (res && res.data && res.data === 'The email addresses do not match') {
                this.setState({
                    errorMsg: 'The email addresses do not match'
                })
            } else {
                this.setState({
                    errorMsg: ''
                });
                this.closeAddUserModal()
                this.fetchUsers();
            }


        }).catch(function(err){
            console.log(err)});
            event.preventDefault();
        }


    fetchUsers(){
        ajax({
            url:'/api/admin',
            data: this.state
        }).then( (res) => {
            this.setState({
                users: res.data.sort(function(a,b){
                    return   (a.FirstName.toLowerCase() > b.FirstName.toLowerCase()) ? 1 : -1;
                }),
                FirstName: '',
                LastName: '',
                Phone: '',
                Email:'',
                ConfirmEmail:'',
                Status: 'active'
             });

        }).catch(function(err){
            console.log(err);
        });
    }

    componentWillMount() {
        if (super.componentWillMount()) {
            this.fetchUsers();
        }
    }

    sendRegistrationEmail() {
        const creds = {
            uuid: this.state.currentUser.uuid,
            RegistrationEmail: this.state.registrationEmail,
            basePath: window.location.origin
        };

        ajax({
            method: 'post',
            url: '/api/admin/sendRegistrationEmail',
            data: creds
        }).then((res) => {
            console.log(res);
            if (res) {
                this.closeCredentialsModal();
            } else {
                this.setState({
                    errorMsg: 'Please check this email address'
                });
            }
        })
    }


    onAfterSaveCell(row, cellName, cellValue) {
        const update = {
            uuid: row.uuid,
            [cellName]: cellValue
        };

        ajax({
            method: 'put',
            url: '../api/admin',
            data: update,
        }).catch(function (err) {
                console.log(err)
            }
        );
    }


    deleteUser(){
        const user = this.state.currentUser;
        user.Status = 'removed';

        ajax({
            method:'put',
            url:'/api/admin',
            data: user
        }).then( (res) => {
            this.fetchUsers();
            this.closeDeleteModal();
        }).catch(function(err){console.log(err)});

    }


    handleInputChange(event) {
        const target = event.target;
        this.setState({
            [target.name]: target.value,
            errorMsg: ''
        });
    }


    openCredentialsModal(user) {
        console.log('openCredentialsModal');
        this.setState({
            currentUser: user,
            credentialsModal: true
        });
    }


    closeCredentialsModal() {
        console.log('closeCredentialsModal');
        this.setState({
            currentUser: '',
            credentialsModal: false
        });
    }


    openDeleteModal(user) {
        console.log('openDeleteModal');
        this.setState({
            currentUser: user,
            deleteModal: true
        });
    }


    closeDeleteModal() {
        console.log('closeDeleteModal');
        this.setState({
            currentUser: '',
            deleteModal: false
        });
    }


    openAddUserModal() {
        console.log('openAddUserModal');
        this.setState({addUserModal: true});
    }


    closeAddUserModal() {
        console.log('closeAddUserModal');
        this.setState(
            {
                addUserModal: false,
                FirstName: '',
                LastName: '',
                Phone: '',
                Email: '',
                ConfirmEmail: '',
                Status: 'active',
                errorMsg: ''

            });
    }


    userToolbar(cell, row) {
        const self = this;
        return (
            <div className="btn-group" role="toolbar" aria-label="management">
                <div onClick={() => self.openCredentialsModal(row)}>
                    <MDBIcon style={{marginRight: '0.5rem', color: 'gray'}} size={'lg'} icon={"lock"}/>
                </div>
                <div onClick={() => self.openDeleteModal(row)}>
                    <MDBIcon style={{marginLeft: '0.5rem', color: 'red'}} size={'lg'} icon={"ban"}/>
                </div>
            </div>
        )
    }


    modalAddUser() {
        return (
            <Modal isOpen={this.state.addUserModal} onHide={this.close}>

                <ModalBody>
                    <form className="form" onSubmit={this.addUser}>

                        <Container>

                            <Row>
                                <Col md={"12"}>
                                    <p className="text-danger">{this.state.errorMsg}</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={"3"}>
                                    <div className="form-group">
                                        <input
                                            name="FirstName"
                                            id="FirstName"
                                            className="form-control"
                                            type="text"
                                            required
                                            value={this.state.FirstName}
                                            onChange={this.handleInputChange}
                                            placeholder="First Name" />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            name="LastName"
                                            id="LastName"
                                            className="form-control"
                                            type="text"
                                            required
                                            value={this.state.LastName}
                                            onChange={this.handleInputChange}
                                            placeholder="Last Name" />
                                    </div>

                                    <div className="form-group">
                                        <input name="Phone" id="Phone" className="form-control" type="text" required value={this.state.Phone} onChange={this.handleInputChange} placeholder="Phone Number" />
                                    </div>
                                </Col>


                                <Col md={"3"}>

                                    <div className="form-group">
                                        <input name="Email" id="Email" className="form-control" type="email" required value={this.state.Email} onChange={this.handleInputChange} placeholder="Email" />
                                    </div>

                                    <div className="form-group">
                                        <input name="ConfirmEmail" id="ConfirmEmail" className="form-control" type="email" required="required"   value={this.state.ConfirmEmail} onChange={this.handleInputChange} placeholder="Confirm Email" />
                                    </div>

                                    <div className="form-group">

                                        <div className="row">
                                            <div className="col-md-4">
                                                <label> <h5>User Type</h5></label>
                                            </div>
                                            <div className="col-md-8">

                                                <select id="addStatus"    className="form-control" name="Status" value={this.state.Status} onChange={this.handleInputChange}>
                                                    <option   value="active">active</option>
                                                    <option   value="admin">admin</option>
                                                </select>
                                            </div>

                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={"1"}> </Col>
                                <Col md={"2"}> <Button  type="submit">Add User</Button></Col>
                                <Col md={"9"}> <Button   onClick={()=> this.closeAddUserModal()}>Cancel</Button> </Col>
                            </Row>
                        </Container>
                    </form>
                </ModalBody>
            </Modal>
        );
    }

    modalCredentials() {
        return (
            <Modal isOpen={this.state.credentialsModal} onHide={this.close}>
                <ModalBody>
                    <div className="form-group">
                        <input autoComplete="off"
                               name="registrationEmail"
                               id="registrationEmail"
                               className="form-control"
                               type="email"
                               required="required"
                               value={this.state.registrationEmail}
                               onChange={this.handleInputChange} placeholder="Email" />
                    </div>
                    <div className="red">{this.state.errorMsg}</div>

                    <button className="btn btn-primary" onClick={() => this.sendRegistrationEmail()} >Send Registration Email</button>
                    <button className="btn btn-default" onClick={() => this.closeCredentialsModal()} >Cancel</button>
                </ModalBody>
            </Modal>
        );
    }

    modalDelete() {
        return (
            <Modal isOpen={this.state.deleteModal} onHide={this.close}>
                <ModalBody>
                    <div className="form-group">
                        <label>Delete?</label>
                    </div>
                    <Row>
                        <Col md={"3"}> </Col>
                        <Col md={"4"}> <button className="btn btn-danger"  onClick={() => this.deleteUser()} >Delete</button> </Col>
                        <Col md={"5"}> <button className="btn btn-default" onClick={() => this.closeDeleteModal()}>Cancel</button>   </Col>
                    </Row>
                </ModalBody>
            </Modal>
        );
    }


    render() {
        // Note: textFilter commented-out. It results in a confusing grid without much value added. My opinion. @lem
        const data = {
            columns: [
                {
                    hidden: true,
                    dataField: 'uuid',
                    isKey: true
                },
                {
                    text: 'First Name',
                    // filter: textFilter({ caseSensitive: true }),
                    dataField: 'FirstName',
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: 'Last Name',
                    dataField: 'LastName',
                    // filter: textFilter({ caseSensitive: true }),
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: 'Phone',
                    dataField: 'Phone',
                    // filter: textFilter(),
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: 'Status',
                    dataField: 'Status',
                    attrs: { width: '100px'},
                    // filter: selectFilter( {options: {'active': 'active', 'admin': 'admin'} } ),
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: 'Username',
                    dataField: 'Username',
                    // filter: textFilter({ caseSensitive: true }),
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: "Manage",
                    dataField: 'df1',
                    isDummyField: true,
                    formatter: this.userToolbar,
                    editable: false,
                    align: 'center'
                }
            ],

            rows: this.state.users

        };


        return (
            <Col>
                { this.modalAddUser() }
                { this.modalCredentials() }
                { this.modalDelete() }

                <Card>
                    <CardBody>
                        <CardTitle>Administer Users</CardTitle>

                        <Row>
                            <Col md={"9"}>
                                <BootstrapTable
                                    bootstrap4
                                    keyField={'uuid'}
                                    data={ data.rows }
                                    columns={ data.columns }
                                    defaultSorted={ [{dataField: 'name', order: 'desc'}] }
                                    noDataIndication="No matching users"
                                    pagination={ paginationFactory( { showTotal: true } ) }
                                    filter={ filterFactory() }
                                    cellEdit={ cellEditFactory({
                                        mode: 'click',
                                        blurToSave: true,
                                        afterSaveCell: this.onAfterSaveCell
                                    }) }
                                />

                            </Col>

                            <Col>
                                <Button size={"sm"} onClick={() => this.openAddUserModal()}><MDBIcon icon="user-plus" />&nbsp;New User</Button>
                            </Col>
                        </Row>

                        {/*<Row>
                            <Col>
                                <hr />
                                <BootstrapTable
                                    data={this.state.users}
                                    //insertRow={ true }
                                    pagination
                                    cellEdit={{
                                        mode: 'click',
                                        blurToSave: true,
                                        afterSaveCell: this.onAfterSaveCell
                                    }}>
                                    <TableHeaderColumn dataField='uuid' isKey hidden>ID</TableHeaderColumn>
                                    <TableHeaderColumn dataField='FirstName' dataSort={true} filter={{type: 'TextFilter'}}>First
                                        Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField='LastName' dataSort={true} filter={{type: 'TextFilter'}}>Last
                                        Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField='Phone' dataSort={true}
                                                       filter={{type: 'TextFilter'}}>Phone</TableHeaderColumn>
                                    <TableHeaderColumn width="120" dataField='Status'
                                                       filter={{type: 'TextFilter'}}
                                                       dataSort={true}
                                                       editable={{type: 'select', options: {values: ['active', 'admin']}}}
                                    >Status</TableHeaderColumn>
                                    <TableHeaderColumn width="300" dataField='Username' dataSort={true}
                                                       filter={{type: 'TextFilter'}}>Username</TableHeaderColumn>
                                    <TableHeaderColumn width="60" editable={false}
                                                       dataFormat={this.userToolbar}></TableHeaderColumn>

                                </BootstrapTable>
                            </Col>
                        </Row>*/}

                    </CardBody>
                </Card>
            </Col>
        )
    }
}

export default Admin;
