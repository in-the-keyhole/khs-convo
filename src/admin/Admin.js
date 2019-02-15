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

import React, {Fragment} from 'react';
import restAPI from '../service/restAPI';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, {textFilter, selectFilter} from 'react-bootstrap-table2-filter';
import BootstrapTable from 'react-bootstrap-table-next';
import CommonUI from '../common/CommonUI';
import {pageinationOptions} from '../common/pageinationOptions';
// noinspection ES6CheckImport
import {
    Card,
    CardBody,
    CardTitle,
    Container,
    Button,
    Row,
    Col,
    MDBIcon,
    MDBInput,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    toast
} from 'mdbreact';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";

let phoneFilter;
let firstNameFilter;
let lastNameFilter;
let userNameFilter;
let statusFilter;


const clearFilters = () => {
    phoneFilter('');
    firstNameFilter('');
    lastNameFilter('');
    userNameFilter('');
    statusFilter('');
};

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
        this.addUserHandler = this.addUserHandler.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.userToolbar = this.userToolbar.bind(this);
        this.openAddUserModal = this.openAddUserModal.bind(this);
        this.onAfterSaveCell = this.onAfterSaveCell.bind(this);
    }


    addUserHandler(event) {
        event.preventDefault();

        // UI checks duplicate emails, but API should catch it regardless. It is the final arbiter.
        if (this.state.ConfirmEmail !== this.state.Email) {
            const msg = `Mismatch; ${this.state.Email} // ${this.state.ConfirmEmail}`;
            this.setState( { errorMsg: msg} );
            toast.error(msg);

        } else {

            const newUser = {
                UserName: '',
                FirstName: this.state.FirstName,
                LastName: this.state.LastName,
                Phone: this.state.Phone,
                Email: this.state.Email,
                ConfirmEmail: this.state.ConfirmEmail,
                Status: this.state.Status,
                Name: `${this.state.FirstName} ${this.state.LastName}`,
                basePath: window.location.origin
            };

            restAPI({
                method: 'post',
                url: '/api/admin',
                data: newUser
            }).then( res => {
                if (res.data && res.data === 'dupe') {

                    this.setState({errorMsg: `"${newUser.Email}" previously registered.`});
                    toast.error(this.state.errorMsg);

                } else if (res.data && res.data === 'your email addresses are not the same') {
                    // Alas, string literal above must exactly match server's rendition.

                    this.setState({errorMsg: 'Email addresses do not match'});
                    toast.error(this.state.errorMsg);

                } else {

                    this.setState({errorMsg: ''});
                    this.closeAddUserModal();
                    this.fetchUsers();
                    toast.success(`Added user ${newUser.FirstName} ${newUser.LastName}`);

                }

            }).catch(err => {
                console.log(err)
            });
        }
    }


    fetchUsers(){
        restAPI({
            url:'/api/admin',
            data: this.state
        }).then( res => {
            this.setState({
                users: res.data.sort(function (a, b) {
                    return (a.FirstName.toLowerCase() > b.FirstName.toLowerCase()) ? 1 : -1;
                }),
                FirstName: '',
                LastName: '',
                Phone: '',
                Email: '',
                ConfirmEmail: '',
                Status: 'active'
            });

        }).catch( err =>  console.log(err));
    }

    componentWillMount() {
        super.componentWillMount();
        this.fetchUsers();
    }


    sendRegistrationEmail() {
        const creds = {
            uuid: this.state.currentUser.uuid,
            RegistrationEmail: this.state.registrationEmail,
            basePath: window.location.origin
        };

        restAPI({
            method: 'post',
            url: '/api/admin/sendRegistrationEmail',
            data: creds
        }).then( res => {
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

        restAPI({
            method: 'put',
            url: '../api/admin',
            data: update,
        }).catch( err => console.log(err) );
    }


    deleteUser() {
        const user = this.state.currentUser;
        const {firstName, lastName} = this.state;
        user.Status = 'removed';

        restAPI({
            method: 'put', // delete?
            url: '/api/admin',
            data: user
        }).then(() => {
            this.fetchUsers();
            this.closeDeleteModal();
            toast.info(`Removed user ${firstName} ${lastName}`);
        }).catch( err => console.log(err));

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


    openDeleteModal(row) {
        console.log('openDeleteModal', row);
        this.setState({
            currentUser: row,
            firstName: row.FirstName,
            lastName: row.LastName,
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
        this.setState(
            {
                addUserModal: true,
                UserName: '',
                FirstName: '',
                LastName: '',
                Phone: '',
                Email: '',
                ConfirmEmail: '',
                Status: 'active',
                errorMsg: ''

            });
    }


    closeAddUserModal() {
        console.log('closeAddUserModal');
        this.setState(
            {
                addUserModal: false,
                UserName: '',
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
                    <MDBIcon style={{marginRight: '0.5rem', color: 'gray'}} size={'lg'} icon={"envelope"}/>
                </div>
                <div onClick={() => self.openDeleteModal(row)}>
                    <MDBIcon style={{marginLeft: '0.5rem', color: 'red'}} size={'lg'} icon={"minus-circle"}/>
                </div>
            </div>
        )
    }


    modalAddUser() {
        return (
            <Modal size={"lg"} isOpen={this.state.addUserModal} onHide={this.close}>
                <form onSubmit={this.addUserHandler}>
                    <ModalBody>
                        <ModalHeader>Add User</ModalHeader>
                        <Container>
                            <Row>
                                <Col>
                                    <p className="text-danger">{this.state.errorMsg}</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={"4"}>
                                    <MDBInput
                                        name="FirstName"
                                        id="FirstName"
                                        className="form-control"
                                        type="text"
                                        required
                                        value={this.state.FirstName}
                                        onChange={this.handleInputChange}
                                        label="First Name"/>
                                </Col>
                                <Col md={"5"}>
                                    <MDBInput
                                        name="LastName"
                                        id="LastName"
                                        className="form-control"
                                        type="text"
                                        required
                                        value={this.state.LastName}
                                        onChange={this.handleInputChange}
                                        label="Last Name"/>
                                </Col>
                                <Col md={"3"}>
                                    <MDBInput name="Phone" id="Phone" className="form-control" type="text" required
                                              value={this.state.Phone} onChange={this.handleInputChange}
                                              label="Phone Number"/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={"6"}>

                                    <MDBInput name="Email" id="Email" className="form-control" type="email" required
                                              value={this.state.Email} onChange={this.handleInputChange}
                                              label="Email"/>
                                </Col>
                                <Col md={"6"}>
                                    <MDBInput name="ConfirmEmail" id="ConfirmEmail" className="form-control"
                                              type="email" required="required" value={this.state.ConfirmEmail}
                                              onChange={this.handleInputChange} label="Confirm Email"/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={"3"}>
                                    <label style={{marginTop: '0.2rem', fontWeight: '300'}} htmlFor="addStatus">User
                                        Type:</label>
                                </Col>
                                <Col md={"3"}>
                                    <select id="addStatus" className="form-control" name="Status"
                                            style={{fontWeight: '300', fontFamily: "Roboto, sans-serif"}}
                                            value={this.state.Status} onChange={this.handleInputChange}>
                                        <option value={"active"}>active</option>
                                        <option value={"admin"}>admin</option>
                                    </select>
                                </Col>
                            </Row>
                        </Container>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            size={"sm"}
                            color={"primary"}
                            type={"submit"}
                        ><MDBIcon icon="plus"/>&nbsp;Add&nbsp;User</Button>
                        <Button size={"sm"} onClick={() => this.closeAddUserModal()}>Cancel</Button>
                    </ModalFooter>
                </form>
            </Modal>
        );
    }


    modalCredentials() {
        return (
            <Modal isOpen={this.state.credentialsModal} onHide={this.close}>
                <ModalBody>
                    <ModalHeader>Send Registration Email</ModalHeader>
                    <MDBInput autoComplete="off"
                              name="registrationEmail"
                              id="registrationEmail"
                              type="email"
                              required="required"
                              value={this.state.registrationEmail || ''}
                              onChange={this.handleInputChange}
                              label="Email"/>
                    <div className="red">{this.state.errorMsg}</div>

                    <ModalFooter/>
                    <Button color={"primary"} onClick={() => this.sendRegistrationEmail()}>Send Registration
                        Email
                    </Button>
                    <Button onClick={() => this.closeCredentialsModal()}>Cancel</Button>
                </ModalBody>
            </Modal>
        );
    }


    modalDelete() {
        return (
            <Modal isOpen={this.state.deleteModal} onHide={this.close}>
                <ModalBody>
                    <ModalHeader> Delete User?</ModalHeader>
                    <Row><Col md={"1"}>&nbsp;</Col><Col>{this.state.firstName}&nbsp;{this.state.lastName}</Col></Row>
                    <ModalFooter>
                        <Button color={"danger"} onClick={() => this.deleteUser()}>Yes</Button>
                        <Button onClick={() => this.closeDeleteModal()}>No</Button>
                    </ModalFooter>
                </ModalBody>
            </Modal>
        );
    }


    render() {
        // Note: textFilter searching commented-out.
        const data = {
            columns: [
                {
                    hidden: true,
                    dataField: 'uuid',
                    isKey: true
                },
                {
                    text: 'First Name',
                    filter: textFilter({ caseSensitive: true, getFilter: filter => (firstNameFilter = filter) }),
                    dataField: 'FirstName',
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: 'Last Name',
                    dataField: 'LastName',
                    filter: textFilter({ caseSensitive: true, getFilter: filter => (lastNameFilter = filter) }),
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: 'Phone',
                    dataField: 'Phone',
                    filter: textFilter({ getFilter: filter => (phoneFilter = filter) }),
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: 'Status',
                    dataField: 'Status',
                    attrs: {width: '100px'},
                    filter: selectFilter( {options: {'active': 'active', 'admin': 'admin'},  getFilter: filter => (statusFilter = filter) } ),
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: 'Username',
                    dataField: 'Username',
                    filter: textFilter({ caseSensitive: true, getFilter: filter => (userNameFilter = filter) }),
                    sort: true,
                    sortCaret: CommonUI.ColumnSortCaret
                },
                {
                    text: "Manage",
                    dataField: 'df1',
                    isDummyField: true,
                    formatter: this.userToolbar,
                    editable: false,
                    align: 'center',
                    headerAlign: 'center'
                }
            ],

            rows: this.state.users

        };


        // TODO enable add button per filters;  clear inputs after add

        return (
            <Fragment>

                {this.modalAddUser()}
                {this.modalCredentials()}
                {this.modalDelete()}

                <Card>
                    <CardBody>
                        <CardTitle>Administer Users</CardTitle>
                        <Row>
                            <Col md={"10"}>
                                <BootstrapTable
                                    bootstrap4
                                    keyField={'uuid'}
                                    data={data.rows}
                                    columns={data.columns}
                                    defaultSorted={[{dataField: 'name', order: 'desc'}]}
                                    noDataIndication="No matching users"
                                    pagination={paginationFactory(pageinationOptions)}
                                    filter={filterFactory()}
                                    cellEdit={cellEditFactory({
                                        mode: 'click',
                                        blurToSave: true,
                                        afterSaveCell: this.onAfterSaveCell
                                    })}
                                />

                            </Col>
                            <Col md={"2"}>
                                <Row><Col><Button size={"md"} style={{width: "100%"}} color={"light"}
                                      onClick={ clearFilters }><MDBIcon icon="times-circle"/>&nbsp;Reset Filter</Button></Col></Row>
                                <Row><Col><Button size={"md"} style={{width: "100%"}} color={"light"}
                                      onClick={ this.openAddUserModal }><MDBIcon icon="plus-circle"/>&nbsp;Add User</Button></Col></Row>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(Admin);
