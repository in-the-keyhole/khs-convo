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
    Container,
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

        this.state = {
            locations: [],
            editing: '',

            insertID: '',
            insertLocation: '',
            insertType: '',
            insertState: '',
            insertFlow: '',
            insertName: '',

            insertError: '',
            addItemModal: false
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
        this.openAddItemModal = this.openAddItemModal.bind(this);
        this.closeAddItemModal = this.closeAddItemModal.bind(this);
        this.modalAddItem = this.modalAddItem.bind(this);
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


    handleTailwaterInsert(item) {
        restAPI({
            method: 'post',
            url: '../api/tailwater/insert',
            data: item,
        }).then(() => {
            this.closeAddItemModal();
            this.fetchTailwaters();
            toast.success(`Inserted new item ${item.id}`);
        }).catch((err) =>
            console.log(err)
        );

        this.setState({
            editing: '',
            insertID: '',
            insertLocation: '',
            insertType: '',
            insertState: '',
            insertFlow: '',
            insertName: ''
        });

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

        this.setState({editing: ''});
        this.fetchTailwaters();
    }


    handleTailwaterDelete(remove) {
        const that = this;
        restAPI({
            method: 'delete',
            url: '../api/tailwater',
            data: remove,
        }).then( () => {
            that.closeDeleteModal();
            that.fetchTailwaters();
            toast.success(`Deleted item ${remove.id}`);
        }).catch( err => {
            console.log(err)
        });
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


    handleInsertItem(event) {
        event.preventDefault();

        if (this.state.insertID) {
            this.setState({
                insertError: ''
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
            const msg = 'ID cannot be empty';
            this.setState({
                insertError: msg
            });
            toast.error(msg);
        }
    }


    handleDeleteItem() {
        const it = this.state.currentItem;

        // noinspection JSDeprecatedSymbols
        this.handleTailwaterDelete({
            id: it.id,
            location: it.location,
            type: it.type,
            state: it.state,
            flowData: it.flowData,
            name: it.name
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


    modelDeleteItem() {
        return (
            <MDBModal size={"sm"} isOpen={this.state.deleteModal}>
                <div className={"modal-wrapper"}>
                    <MDBModalBody>
                        <MDBModalHeader>Delete Tailwaters Item?</MDBModalHeader>
                        <Row><Col sm={"1"}>&nbsp;</Col><Col>{this.state.currentItem
                            ? `ID: ${this.state.currentItem.id}` : ''}</Col></Row>
                        <MDBModalFooter>
                            <Button size={"sm"} color={"success"} onClick={this.handleDeleteItem}>Yes</Button>
                            <Button size={"sm"} color={"danger"} onClick={this.closeDeleteModal}>No</Button>
                        </MDBModalFooter>
                    </MDBModalBody>
                </div>
            </MDBModal>
        )

    }


    openAddItemModal() {
        this.setState(
            {addItemModal: true}
        );
    }


    closeAddItemModal() {
        this.setState(
            {addItemModal: false}
        );
    }


    modalAddItem() {

        return (
            <MDBModal size={"sm"} isOpen={this.state.addItemModal}>
                <div className={"modal-wrapper"}>
                    <form onSubmit={this.handleInsertItem}>

                        <MDBModalBody>
                            <MDBModalHeader>Add Tailwater Item</MDBModalHeader>
                            <Container>
                                <Row>
                                    <Col>
                                        <p className="text-danger">{this.state.errorMsg}</p>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={"4"}>
                                        <MDBInput
                                            name="insertID"
                                            required
                                            type={"text"}
                                            value={this.state.insertID}
                                            onChange={this.handleInputChange}
                                            label="ID"/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={"4"}>
                                        <MDBInput
                                            name="insertLocation"
                                            required
                                            type={"text"}
                                            value={this.state.insertLocation}
                                            onChange={this.handleInputChange}
                                            label="Location"/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={"3"}>
                                        <MDBInput
                                            name="insertType"
                                            required
                                            type={"text"}
                                            value={this.state.insertType}
                                            onChange={this.handleInputChange}
                                            label="Type"/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={"3"}>
                                        <MDBInput
                                            name="insertState"
                                            required
                                            type={"text"}
                                            value={this.state.insertState}
                                            onChange={this.handleInputChange}
                                            label="State"/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={"3"}>
                                        <MDBInput
                                            name="insertFlow"
                                            required
                                            type={"text"}
                                            value={this.state.insertFlow}
                                            onChange={this.handleInputChange}
                                            label="Flow"/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={"12"}>
                                        <MDBInput
                                            name="insertName"
                                            required
                                            type={"text"}
                                            value={this.state.insertName}
                                            onChange={this.handleInputChange}
                                            label="Name"/>
                                    </Col>
                                </Row>

                            </Container>
                        </MDBModalBody>

                        <MDBModalFooter>
                            <Button
                                size={"sm"}
                                color={"primary"}
                                type={"submit"}
                            ><MDBIcon icon="plus"/>&nbsp;Add&nbsp;Item</Button>
                            <Button
                                size={"sm"}
                                color={"danger"}
                                onClick={this.closeAddItemModal}> Cancel</Button>
                        </MDBModalFooter>
                    </form>
                </div>
            </MDBModal>
        );
    }


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
                                                  onClick={this.openAddItemModal}
                                ><MDBIcon icon="plus-circle"/>
                                    &nbsp;Add Item</Button></Col></Row>
                            </Col>
                        </Row>
                    </MDBCardBody>
                </MDBCard>

                {this.modelDeleteItem()}

                {this.modalAddItem()}

            </Fragment>
        )


    }
}

export default Tailwater;
