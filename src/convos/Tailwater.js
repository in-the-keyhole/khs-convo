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
import BaseComponent from '../BaseComponent';
// noinspection ES6CheckImport
import {
    Row,
    Col,
    Button,
    MDBIcon,
    MDBModal,
    MDBModalBody,
    MDBModalHeader,
    MDBModalFooter,
    MDBCard,
    MDBCardBody,
    MDBCardTitle,
    toast
} from 'mdbreact';
import CommonUI from "../common/CommonUI";
import paginationFactory from "react-bootstrap-table2-paginator";
import {pageinationOptions} from "../common/pageinationOptions";
import cellEditFactory from "react-bootstrap-table2-editor";
import BootstrapTable from 'react-bootstrap-table-next';

class Tailwater extends BaseComponent {
    constructor(props) {
        super(props);

        this.state = {
            locations: [],
            editing: null,
            insertID: null,
            insertLocation: null,
            insertType: null,
            insertState: null,
            insertFlow: null,
            insertName: null,
            insertError: null
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.handleEditItem = this.handleEditItem.bind(this);
        this.handleInsertItem = this.handleInsertItem.bind(this);
        this.toggleEditing = this.toggleEditing.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDeleteItem = this.handleDeleteItem.bind(this);
        this.onAfterSaveCell = this.onAfterSaveCell.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.fetchTailwaters = this.fetchTailwaters.bind(this);
    }


    componentWillMount() {
        super.componentWillMount();
        this.fetchTailwaters();
    }


    fetchTailwaters() {
        restAPI({
            url: '../api/tailwater',
            data: this.state,
            cache: false
        }).then((res) => {
            this.setState({locations: res.data});
        }).catch((err) => console.log(err));
    }


    handleTailwaterInsert(insert) {
        restAPI({
            method: 'post',
            url: '../api/tailwater/insert',
            data: insert,
        }).then(() => {
            this.fetchTailwaters();
        }).catch((err) =>
            console.log(err)
        );

        this.setState({
            editing: null,
            insertID: null,
            insertLocation: null,
            insertType: null,
            insertState: null,
            insertFlow: null,
            insertName: null
        });

        // this.fetchTailwaters();
    }


    handleTailwaterUpdate(update) {
        const that = this;
        restAPI({
            method: 'put',
            url: '../api/tailwater/update',
            data: update,
        }).then(function () {
            that.fetchTailwaters();
        }).catch((err) => {
            console.log(err)
        });

        this.setState({editing: null});
        this.fetchTailwaters();
    }


    handleTailwaterDelete(remove) {
        const that = this;
        restAPI({
            method: 'delete',
            url: '../api/tailwater',
            data: remove,
        }).then(function () {
            that.closeDeleteModal();
            that.fetchTailwaters();
        }).catch(function (err) {
            console.log(err)
        });
        this.closeDeleteModal();
        this.fetchTailwaters();
    }


    toggleEditing(itemId) {
        this.setState({editing: itemId});
    }


    handleEditItem() {
        const itemId = this.state.editing;

        // noinspection JSDeprecatedSymbols
        this.handleTailwaterUpdate({
            id: itemId,
            location: this.refs[`location_${itemId}`].value,
            type: this.refs[`type_${itemId}`].value,
            state: this.refs[`state_${itemId}`].value,
            flowData: this.refs[`flowData_${itemId}`].value === 'true',
            name: this.refs[`name_${itemId}`].value
        });
    }


    handleInsertItem() {
        if (this.state.insertID) {
            this.setState({
                insertError: null
            });

            this.handleTailwaterInsert({
                id: this.state.insertID,
                location: this.state.insertLocation,
                type: this.state.insertType,
                state: this.state.insertState,
                flowData: this.state.insertFlow === 'true',
                name: this.state.insertName
            });
        } else {
            this.setState({
                insertError: "ID cannot be empty"
            });
        }
    }


    handleDeleteItem() {
        let itemId = this.state.editing;

        // noinspection JSDeprecatedSymbols
        this.handleTailwaterDelete({
            id: itemId,
            location: this.refs[`location_${itemId}`].value,
            type: this.refs[`type_${itemId}`].value,
            state: this.refs[`state_${itemId}`].value,
            flowData: this.refs[`flowData_${itemId}`].value,
            name: this.refs[`name_${itemId}`].value
        });
    }


    handleInputChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});
    }


    closeDeleteModal() {
        this.setState({deleteModal: false})
    }


    openDeleteModal(item) {
        console.log(`row`, item);
        this.setState({
            currentItem: item,
            deleteModal: true
        })
    }


    /**
     * CellValue is, a Blackist record, including _id. This methods  updates any of its fields except _id.
     * eg. PUT a bookstrap table cell edit's "cellValue". The API will update its copy.
     *
     * @param row -- mongo id
     * @param cellName -- mongo id
     * @param cellValue -- entire table row object
     */
    onAfterSaveCell(row, cellName, cellValue) {
        restAPI({
            method: 'put',
            url: '../api/tailwater/update',
            data: cellValue,
        }).then((res) => {
            console.log(res);
            toast.success(`Cell updated.`)
        }).catch(err => console.log(err));
    }


/*    openAddRecordModal() {
        this.setState(
            {

            });
    }


    closeAddRecordModal() {
        console.log('closeAddUserModal');
        this.setState(
            {

            });
    }


    modalAddRecord() {
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
    }*/


    managementToolbar(cell, row, rowIndex, tailwaters) {
        return <div className="btn-group" role="toolbar" aria-label="management">
            <div onClick={() => tailwaters.openDeleteModal(row)}>
                <MDBIcon style={{marginLeft: '0.5rem', color: 'red'}} size={'lg'} icon={"minus-circle"}/>
            </div>
        </div>
    }


    render() {

        const columns = [
            {
                hidden: true,
                dataField: '_id',
                isKey: true
            },
            {
                text: 'ID',
                dataField: 'id',
                sort: true,
                width: '5%',
                sortCaret: CommonUI.ColumnSortCaret,
                editable: true
            }, {
                text: 'Location',
                dataField: 'location',
                sort: true,
                width: '5%',
                sortCaret: CommonUI.ColumnSortCaret,
                editable: true
            },
            {
                text: 'Type',
                dataField: 'type',
                sort: true,
                width: '5%',
                sortCaret: CommonUI.ColumnSortCaret,
                editable: true
            },
            {
                text: 'State',
                dataField: 'state',
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret,
                editable: true
            },
            {
                text: 'Flow',
                dataField: 'flowData',
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret,
                editable: true
            },
            {
                text: 'Name',
                dataField: 'name',
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret,
                editable: true
            },
            {
                text: '',
                dataField: 'df1',
                isDummyField: true,
                width: '5%',
                formatter: this.managementToolbar,
                formatExtraData: this,
                editable: false,
                align: 'center',
                headerAlign: 'center'
            }
        ];


        return (
            <Fragment>
                <MDBCard>
                    <MDBCardBody>
                        <MDBCardTitle>Tailwaters</MDBCardTitle>

                        <Row>
                            <Col md={"10"}>
                                <BootstrapTable
                                    bootstrap4
                                    data={this.state.locations}
                                    columns={columns}
                                    keyField={'_id'}
                                    insertRow={true}
                                    pagination={paginationFactory(pageinationOptions)}
                                    cellEdit={cellEditFactory({
                                        mode: 'click',
                                        blurToSave: true,
                                        afterSaveCell: this.onAfterSaveCell
                                    })}
                                    striped
                                    hover
                                    condensed
                                />
                            </Col>

                            <Col md={"2"}>
                                <Row><Col><Button size={"md"} style={{width: "100%"}} color={"light"}
                                                  ><MDBIcon icon="plus-circle"/>
                                                  &nbsp;Add Item</Button></Col></Row>
                            </Col>
                        </Row>
                    </MDBCardBody>
                </MDBCard>

                <MDBModal size={"sm"} isOpen={this.state.deleteModal}>
                    <div className={"modal-wrapper"}>
                        <MDBModalBody>
                            <MDBModalHeader>Delete Tailwaters Item?</MDBModalHeader>
                            <Row><Col sm={"1"}>&nbsp;</Col><Col>{this.state.currentItem
                                ? `ID: ${this.state.currentItem.id}` : ''}</Col></Row>
                            <MDBModalFooter>
                                <Button size={"sm"} color={"danger"} onClick={this.deleteItem}>Yes</Button>
                                <Button size={"sm"} onClick={this.closeDeleteModal}>No</Button>
                            </MDBModalFooter>
                        </MDBModalBody>
                    </div>
                </MDBModal>
            </Fragment>
        )


    }
}

export default Tailwater;
