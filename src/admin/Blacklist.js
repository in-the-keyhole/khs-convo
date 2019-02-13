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

import '../styles/data-table.css';
import React, {Fragment} from 'react';
import restAPI from '../service/restAPI';
import cellEditFactory from 'react-bootstrap-table2-editor';
// import filterFactory /*, { textFilter, selectFilter }*/ from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import BootstrapTable from 'react-bootstrap-table-next';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";
import {pageinationOptions} from "../common/pageinationOptions";
// noinspection ES6CheckImport
import {
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    MDBModal,
    MDBModalBody,
    MDBModalHeader,
    MDBModalFooter,
    MDBInput,
    MDBIcon,
    Button,
    toast
} from 'mdbreact';
import CommonUI from "../common/CommonUI";

class Blacklist extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            numbers: [],
            currentItem: null,
            insertNumber: null,
            insertNotes: null
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.handleInsertItem = this.handleInsertItem.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.blackListToolbar = this.blackListToolbar.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.onAfterSaveCell = this.onAfterSaveCell.bind(this);
    }


    componentWillMount() {
        super.componentWillMount();
        this.fetchBlacklist();
    }


    fetchBlacklist() {
        const self = this;
        restAPI({
            url: '../api/admin/blacklist',
            data: this.state
        }).then((res) => {
            self.setState({
                numbers: res.data.sort((a, b) => {
                    return (a.phone.toLowerCase() > b.phone.toLowerCase()) ? 1 : -1;
                })
            });
        }).catch((err) => console.log(err));
    }


    handleBlacklistInsert(insert) {
        restAPI({
            method: 'post',
            url: '../api/admin/blacklist',
            data: insert,
        }).then( res => {
            console.log(res);
            toast.success(`Blacklisted phone number "${insert.phone}"`);
        }).catch((err) => console.log(err));

        this.setState({editing: null});
    }


    handleInsertItem() {
        if (this.state.insertNumber) {
            this.setState({
                insertError: null
            });

            this.handleBlacklistInsert({
                phone: this.state.insertNumber,
                notes: this.state.insertNotes
            });
            this.setState({insertNumber: null, insertNotes: null});
        } else {
            this.setState({
                insertError: "Phone number cannot be empty"
            });
            toast.warning(this.state.insertError);
        }

        this.fetchBlacklist();
    }


    handleInputChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});
    }


    openDeleteModal(item) {
        console.log(`row`, item);
        this.setState({
            currentItem: item,
            deleteModal: true
        })
    }


    closeDeleteModal() {
        this.setState({
            currentItem: null,
            deleteModal: false
        })
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
            url: '../api/admin/blacklist',
            data: cellValue,
        }).then((res) => {
            console.log(res);
        }).catch((err) => console.log(err));
    }


    deleteItem() {
        const item = this.state.currentItem;
        // Omit _id. we want to remove all copies of the input phone number.
        const record = {};
        record.phone = item.phone;
        record.notes = item.notes;

        restAPI({
            method: 'delete',
            url: '../api/admin/blacklist',
            data: record
        }).then( res => {
            console.log(`deleteItem`, res);
            toast.info(`Deleted phone "${record.phone}"`);
        }).catch( err => console.log(err));

        this.fetchBlacklist();
        this.setState({
            deleteModal: false
        })
    }


    blackListToolbar(cell, row) {
        return (
            <div className="btn-group" role="toolbar" aria-label="management">
                <div onClick={() => this.openDeleteModal(row)}>
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
                isKey: true
            }, {
                text: 'Phone',
                dataField: 'phone',
                sort: true,
                width: '5%',
                sortCaret: CommonUI.ColumnSortCaret,
                editable: true
            },
            {
                text: 'Notes',
                dataField: 'notes',
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret,
                editable: true
            },
            {
                text: 'Manage',
                dataField: 'df1',
                isDummyField: true,
                width: '5%',
                formatter: this.blackListToolbar,
                editable: false,
                align: 'center',
                headerAlign: 'center'
            }
        ];


        /* Data shape: */
        //
        // const data = [
        //     {_id: 124, phone: '408 225-7933', notes: 'Lorem Batman mock ...'},
        //     {_id: 661, phone: '919 555-1234', notes: 'Lorem empson mock ...'},
        //     {_id: 1444, phone: '930 555-4567', notes: 'Lorem bacon mock ...'}
        // ];
        //

        const data = this.state.numbers;

        return (
            <Fragment>
                <Card>
                    <CardBody>
                        <CardTitle>Phone Number Blacklist</CardTitle>
                        <Row>
                            <Col md={"2"}>
                                <MDBInput name="insertNumber" id="insertNumber"
                                          value={this.state.insertNumber || ''}
                                          onChange={this.handleInputChange}
                                          autoFocus
                                          label={"Enter phone"}/>
                            </Col>
                            <Col md={"6"}>
                                <MDBInput name="insertNotes" id="insertNotes"
                                          value={this.state.insertNotes || ''}
                                          onChange={this.handleInputChange}
                                          label={"Enter Notes"}/>
                            </Col>
                            <Col md={"2"}>
                                <Button size={"md"} color={"light"} style={{marginTop: "1.5rem", width: "100%", fontSize: "0.8rem"}}
                                        onClick={() => this.handleInsertItem()}
                                        disabled={!this.state.insertNumber || !this.state.insertNotes}>
                                    <MDBIcon icon="plus-circle"/>&nbsp;Add Phone</Button>
                            </Col>
                            <Col md={"2"} className="text-danger">
                                <span>{this.state.insertError}</span>
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
                                />
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <MDBModal size={"sm"} isOpen={this.state.deleteModal} onHide={this.close}>
                    <MDBModalBody>
                        <MDBModalHeader>Delete Blacklist Item?</MDBModalHeader>
                        <Row><Col sm={"1"}>&nbsp;</Col><Col>{this.state.currentItem
                            ? `Phone: ${this.state.currentItem.phone}` : ''}</Col></Row>
                        <MDBModalFooter>
                            <Button size={"sm"} color={"danger"} onClick={() => this.deleteItem()}>Yes</Button>
                            <Button size={"sm"} onClick={() => this.closeDeleteModal()}>No</Button>
                        </MDBModalFooter>
                    </MDBModalBody>
                </MDBModal>
            </Fragment>
        )

    }

}

const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(Blacklist);

