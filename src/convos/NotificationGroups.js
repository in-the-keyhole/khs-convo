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
import '../styles/data-table.css';
import BootstrapTable from 'react-bootstrap-table-next';
import GroupUserList from './GroupUserList';
import BaseComponent from '../BaseComponent';
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
    MDBModalFooter,
    toast
} from 'mdbreact';
import {connect} from "react-redux";
import paginationFactory from 'react-bootstrap-table2-paginator';
import CommonUI from "../common/CommonUI";
// import cellEditFactory, {Type} from 'react-bootstrap-table2-editor';
// import {pageinationOptions} from "../common/pageinationOptions";


const selectRow = {
    mode: 'radio',
    clickToSelect: true,
    style: { backgroundColor: '#c8c8e6' }
};

/**
 * This component prompts for a new group name. A submiission triggers the creation API.
 *
 * @param props
 * @returns {*}
 * @constructor
 */
const AddGroupModal = props => {

    const {
        isOpen,
        fnDoClose,
        fnAddGroup,
        fnHandleInputChange,
        fnCloseAddGroupModal,
        valueGroupName
    } = props;

    return (
        <MDBModal size={"sm"} isOpen={isOpen} onHide={fnDoClose}>
            <MDBModalBody>
                <MDBModalHeader>Add Group Item</MDBModalHeader>
                <form className="form" onSubmit={fnAddGroup}>
                    <MDBInput
                        name="GroupName"
                        id="GroupName"
                        type="text"
                        required="required"
                        value={valueGroupName}
                        onChange={fnHandleInputChange}
                        label={"Group Name"}/>
                    <MDBModalFooter>
                        <Button size={"md"} type={"submit"}><MDBIcon icon={"plus-circle"}/>&nbsp;Add</Button>
                        <Button size={"md"} color={"red"} onClick={fnCloseAddGroupModal}>Cancel</Button>
                    </MDBModalFooter>
                </form>
            </MDBModalBody>
        </MDBModal>
    );
};


/**
 * This component renders a go/no[-go confirmaiton pop-up for delete. It triggers the delete upon user confirmation.
 *
 * @param props
 * @returns {*}
 * @constructor
 */
const DeleteGroupModal = props => {

    const {
        fnDeleteModal,
        fnDoClose,
        fnDeleteGroup,
        fnCloseDeleteModal
    } = props;

    return (
        <MDBModal size={"sm"} isOpen={fnDeleteModal} onHide={fnDoClose}>
            <MDBModalBody>
                <MDBModalHeader>Confirm</MDBModalHeader>
                <label>Delete group items?</label>

                <MDBModalFooter>
                    <Button size={"md"} color={"danger"} onClick={fnDeleteGroup}>Delete</Button>
                    <Button size={"md"} color={"light"} onClick={fnCloseDeleteModal}>Cancel</Button>
                </MDBModalFooter>
            </MDBModalBody>
        </MDBModal>
    );
};


/**
 * The is the root component for rendering notification groups.
 */
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
        this.manageToolbar = this.manageToolbar.bind(this);
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
        }).then((res) => {
            this.closeAddGroupModal();
            this.fetchGroups();
            toast.success(`Added group "${add.GroupName}"`);
            this.setState({GroupName: ''});

            window.setTimeout(() => this.showGroupUsers(res.data),0);

        }).catch(err => console.log(err));
    }

    fetchGroups() {
        restAPI({
            method: 'get',
            url: '/api/notify/group',
            data: this.state
        }).then(res => {
            console.log(`user groups`, res.data);
            this.setState({ users: res.data });
        }).catch(err => console.log(err));
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

            // this.showGroupUsers({GroupName: ''});
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
        this.setState({addGroupModal: true});
        console.log("openAddGroupModel");
    }


    closeAddGroupModal() {
        this.setState({addGroupModal: false});
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


    manageToolbar(cell, row) {
        const self = this;
        return (
            <div className="btn-group" role="toolbar" aria-label="management">
                <div onClick={() => self.openDeleteModal(row)}>
                    <MDBIcon style={{marginLeft: '0.5rem', color: 'red'}} size={'lg'} icon={"minus-circle"}/>
                </div>
            </div>
        )
    }


    render() {

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
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'User Count',
                dataField: 'Users.length',
                width: "5%",
                align: 'center',
                headerAlign: 'center',
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret
            },
            {
                text: 'Manage',
                dataField: 'df1',
                isDummyField: true,
                width: '5%',
                formatter: this.manageToolbar,
                editable: false,
                align: 'center',
                headerAlign: 'center'
            }
        ];


        return (

            <Fragment>
                <Card>
                    <CardBody>
                        <CardTitle>Groups</CardTitle>
                        <Row>
                            <Col md={"6"}>

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
                                            noDataIndication="No groups"
                                            selectRow={selectRow}
                                            cellEdit={{
                                                mode: 'click',
                                                blurToSave: true,
                                                afterSaveCell: this.onAfterSaveGroup
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </Col>

                            <Col md={"6"}>
                                <GroupUserList group={this.state.currentGroup}/>
                            </Col>
                        </Row>

                    </CardBody>
                </Card>

                <AddGroupModal
                    isOpen={this.state.addGroupModal}
                    fnDoClose={this.close}
                    fnAddGroup={this.addGroup}
                    fnHandleInputChange={this.handleInputChange}
                    fnCloseAddGroupModal={this.closeAddGroupModal}
                    valueGroupName={this.state.GroupName}
                />

                <DeleteGroupModal
                    fnDeleteModal={this.state.deleteModal}
                    fnDoClose={this.close}
                    fnDeleteGroup={this.deleteGroup}
                    fnCloseDeleteModal={this.closeDeleteModal}
                />

            </Fragment>
        )
    }
}


const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(NotificationGroups);
