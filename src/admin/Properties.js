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


import '../styles/index.css';
import '../styles/data-table.css';
import React from 'react';
import restAPI from '../service/restAPI';
import BootstrapTable from 'react-bootstrap-table-next';
import BaseComponent from '../BaseComponent';
import CommonUI from "../common/CommonUI";
import paginationFactory from "react-bootstrap-table2-paginator";
import {pageinationOptions} from "../common/pageinationOptions";
import cellEditFactory from "react-bootstrap-table2-editor";
// noinspection ES6CheckImport
import {
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    MDBModal,
    MDBModalBody,
    MDBInput,
    MDBIcon,
    Button
} from 'mdbreact';

class Properties extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            contents: [],
            insertName: null,
            insertContent: null,
            currentProperty: null
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInsertItem = this.handleInsertItem.bind(this);
        this.propertyToolbar = this.propertyToolbar.bind(this);
        this.deleteProperty = this.deleteProperty.bind(this);
    }

    componentWillMount() {
        super.componentWillMount();
        this.fetchContents();
    }

    fetchContents() {
        const self = this;
        restAPI({
            url: '../api/admin/content',
            data: this.state
        }).then(res => {

            self.setState(
                {contents: res.data.sort((a, b) => (a.Name.toLowerCase() > b.Name.toLowerCase()) ? 1 : -1)});
        }).catch(err => console.log(err));
    }


    handleContentDelete(remove) {
        restAPI({
            method: 'delete',
            url: '../api/admin/content',
            data: remove,
        }).then(function (res, me) {
            console.log(me);
        }).catch(function (err) {
            console.log(err)
        });
    }

    deleteProperty() {
        const itemId = this.state.currentProperty;
        const remove = {
            Name: itemId.Name
        };

        restAPI({
            method: 'delete',
            url: '../api/admin/content',
            data: remove,
        }).then(function (res, me) {
            console.log(me);
        }).catch(function (err) {
            console.log(err)
        });

        this.fetchContents();
        this.setState({
            deleteModal: false
        })
    }

    onAfterSaveCell(row /*, cellName, cellValue*/) {
        const update = {
            Name: row.Name,
            Content: row.Content
        };

        restAPI({
            method: 'put',
            url: '../api/admin/content',
            data: update,
        }).then(function (res, me) {
            console.log(me);
        }).catch(function (err) {
            console.log(err)
        });
    }


    handleContentInsert(insert) {
        restAPI({
            method: 'post',
            url: '../api/admin/content',
            data: insert,
        }).then(res => {
            console.log(res);
            this.setState( {insertName: null, insertContent: null} );
        }).catch(err => {
            console.log(err)
        });
    }

    handleInsertItem() {
        if (this.state.insertName) {
            this.setState({
                insertError: null
            });

            this.handleContentInsert({
                Name: this.state.insertName,
                Content: this.state.insertContent
            });
        } else {
            this.setState({
                insertError: "Name cannot be empty"
            });
        }

        this.fetchContents();
    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});
    }

    propertyToolbar(cell, row) {
        return (
            <div className="adminIcons">
                <i title="delete" className="glyphicon glyphicon-remove-sign text-danger clickable"
                   onClick={() => this.openDeleteModal(row)}/>
            </div>
        )
    }


    openDeleteModal(property) {
        this.setState({
            currentProperty: property,
            deleteModal: true
        })
    }

    closeDeleteModal() {
        this.setState({
            currentProperty: null,
            deleteModal: false
        })
    }


    render() {

        const columns = [
            {
                hidden: true,
                dataField: '_id',
                isKey: true
            }, {
                text: 'Name',
                dataField: 'Name',
                sort: true,
                width: '5%',
                sortCaret: CommonUI.ColumnSortCaret,
                editable: false
            },
            {
                text: 'Content',
                dataField: 'Content',
                sort: true,
                sortCaret: CommonUI.ColumnSortCaret,
                editable: true
            },
            {
                text: 'Manage',
                dataField: 'df1',
                isDummyField: true,
                width: '5%',
                formatter: this.propertyToolbar,
                editable: false,
                align: 'center'
            }
        ];


        return (
            <div>
                <Card>
                    <CardBody>
                        <CardTitle>Properties</CardTitle>

                        <Row>
                            <Col md={"2"}>
                                <MDBInput name="insertName" id="insertName"
                                          type="text"
                                          value={this.state.insertName || ''}
                                          label={"Name"}
                                          onChange={this.handleInputChange}/>
                            </Col>
                            <Col md={"6"}>
                                <MDBInput name="insertContent" id="insertContent"
                                          type="text"
                                          value={this.state.insertContent || ''}
                                          label={"Content"}
                                          onChange={this.handleInputChange}/>
                            </Col>
                            <Col md={"2"}>
                                <Button size={"sm"}
                                        onClick={this.handleInsertItem}
                                        disabled={!this.state.insertName || !this.state.insertContent}
                                        style={{marginTop: "1.5rem"}}>
                                    <MDBIcon icon="plus"/>&nbsp;Add</Button>
                            </Col>
                            <Col md={"2"} className="text-danger">
                                {this.state.insertError}>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={"9"}>
                                <BootstrapTable
                                    bootstrap4
                                    data={this.state.contents}
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


                <MDBModal isOpen={this.state.deleteModal} onHide={this.close}>
                    <MDBModalBody>
                        <div className="form-group">
                            <label>Delete property?</label>
                        </div>
                        <Row className="row">
                            <Col md={"3"}> </Col>
                            <Col md={"4"}>
                                <Button color="danger" onClick={() => this.deleteProperty()}>Delete
                                </Button>
                            </Col>
                            <Col md={"5"}>
                                <Button onClick={this.closeDeleteModal}>Cancel</Button>
                            </Col>
                        </Row>
                    </MDBModalBody>
                </MDBModal>
            </div>
        );
    }
}

export default Properties;
