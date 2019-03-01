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
    MDBInput,
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
        this.resetState();

        this.componentWillMount = this.componentWillMount.bind(this);
        this.renderItemOrEditField = this.renderItemOrEditField.bind(this);
        this.handleEditItem = this.handleEditItem.bind(this);
        this.handleInsertItem = this.handleInsertItem.bind(this);
        this.toggleEditing = this.toggleEditing.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDeleteItem = this.handleDeleteItem.bind(this);
        this.onAfterSaveCell = this.onAfterSaveCell.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
    }


    resetState() {
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
        const that = this;
        restAPI({
            method: 'post',
            url: '../api/tailwater/insert',
            data: insert,
        }).then(() => {
            this.fetchTailwaters();
            window.setTimeout(()=> that.resetState())
        }).catch((err) =>
            console.log(err)
        );

        // this.setState({
        //     insertID: null,
        //     insertLocation: null,
        //     insertType: null,
        //     insertState: null,
        //     insertFlow: null,
        //     insertName: null
        // });

        // this.setState({editing: null});
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

    managementToolbar(cell, row) {
        const that = this;
        return (
            <div className="btn-group" role="toolbar" aria-label="management">
                <div onClick={() => that.openDeleteModal(row)}>
                    <MDBIcon style={{marginLeft: '0.5rem', color: 'red'}} size={'lg'} icon={"minus-circle"}/>
                </div>
            </div>
        )
    }


    /**
     * CellValue is, a Blackist record, including _id. This methods  updates any of its fields except _id.
     * eg. PUT a bookstrap table cell edit's "cellValue". The API will update its copy.
     *
     * @param row
     * @param cellName
     * @param cellValue
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


    renderItemOrEditField(loc) {
        if (this.state.editing === loc.id) {
            // Handle rendering our edit fields here.
            return <Fragment>
                <Row>
                    <Col md={"2"}>{loc.id}</Col>
                    <Col md={"2"}>
                        <MDBInput
                            type="text"
                            className="form-control"
                            ref={`location_${loc.id}`}
                            name="location"
                            defaultValue={loc.location}
                        />
                    </Col>
                    <Col md={"1"}>
                        <MDBInput
                            type="text"
                            className="form-control"
                            ref={`type_${loc.id}`}
                            name="type"
                            defaultValue={loc.type}
                        />
                    </Col>
                    <Col md={"1"}>
                        <MDBInput
                            type="text"
                            className="form-control"
                            ref={`state_${loc.id}`}
                            name="state"
                            defaultValue={loc.state}
                        />
                    </Col>
                    <Col md={"1"}>
                        <MDBInput
                            type="text"
                            className="form-control"
                            ref={`flowData_${loc.id}`}
                            name="flowData"
                            defaultValue={loc.flowData.toString()}
                        />
                    </Col>
                    <Col md={"2"}>
                        <MDBInput
                            type="text"
                            className="form-control"
                            ref={`name_${loc.id}`}
                            name="name"
                            defaultValue={loc.name}
                        />
                    </Col>
                    <Col md={"1"} className="clickable text-success"
                         onClick={this.handleEditItem}><MDBIcon size={"lg"} icon="save"/></Col>
                    <Col md={"1"} className="clickable text-danger"
                         onClick={this.openDeleteModal}><MDBIcon icon="minus-circle"/></Col>
                </Row>

                <MDBModal show={this.state.deleteModal}>
                    <MDBModalBody>
                        <MDBModalHeader>Delete?</MDBModalHeader>
                        <MDBModalFooter>
                            <Button color={"red"} style={{width: "100%"}}
                                    onClick={this.handleDeleteItem}>Delete</Button>
                            <Button color={"light"} style={{width: "100%"}}
                                    onClick={this.closeDeleteModal}>Cancel</Button>
                        </MDBModalFooter>
                    </MDBModalBody>
                </MDBModal>

            </Fragment>;

        } else {
            return <Row>
                <Col md={"2"}>{loc.id}</Col>
                <Col md={"2"}>{loc.location}</Col>
                <Col md={"1"}>{loc.type}</Col>
                <Col md={"1"}>{loc.state}</Col>
                <Col md={"1"}>{loc.flowData.toString()}</Col>
                <Col md={"2"}>{loc.name}</Col>
                <Col md={"1"} className="clickable text-primary"
                     onClick={this.toggleEditing.bind(null, loc.id)}><MDBIcon icon="edit"/></Col>
            </Row>
        }
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
                text: 'Manage',
                dataField: 'df1',
                isDummyField: true,
                width: '5%',
                formatter: this.managementToolbar,
                editable: false,
                align: 'center',
                headerAlign: 'center'
            }
        ];

        const data = this.state.locations;

        return (
            <Fragment>
                <MDBCard>
                    <MDBCardBody>
                        <MDBCardTitle>Tailwaters</MDBCardTitle>
                        <Row>
                            <Col md={"2"} className="text-danger">
                            </Col>
                        </Row>
                        <Row>
                            <Col md={"10"}>
                                <BootstrapTable
                                    bootstrap4
                                    data={data}
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
                        </Row>
                    </MDBCardBody>
                </MDBCard>

                <MDBModal size={"sm"} isOpen={this.state.deleteModal}>
                    <div className={"modal-wrapper"}>
                        <MDBModalBody>
                            <MDBModalHeader>Delete Tailwaters Item?</MDBModalHeader>
                            <Row><Col sm={"1"}>&nbsp;</Col><Col>{this.state.currentItem
                                ? `ID: ${this.state.currentItem.phone}` : ''}</Col></Row>
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
