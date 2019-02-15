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
    Container,
    Row,
    Col,
    Button,
    MDBModal,
    MDBModalBody,
    MDBModalHeader,
    MDBModalFooter
} from 'mdbreact';

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
        this.renderItemOrEditField = this.renderItemOrEditField.bind(this);
        this.handleEditItem = this.handleEditItem.bind(this);
        this.handleInsertItem = this.handleInsertItem.bind(this);
        this.toggleEditing = this.toggleEditing.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDeleteItem = this.handleDeleteItem.bind(this);
    }

    componentWillMount() {
        super.componentWillMount();
        this.fetchTailwaters();
    }


    fetchTailwaters() {
        const self = this;
        restAPI({
            url: '../api/tailwater',
            data: this.state,
            cache: false
        }).then((res) => {
            self.setState({locations: res.data});
        }).catch((err) => console.log(err));
    }


    handleTailwaterInsert(insert) {
        const that = this;
        restAPI({
            method: 'post',
            url: '../api/tailwater/insert',
            data: insert,
        }).then(() => {
            that.fetchTailwaters();
        }).catch((err) =>
            console.log(err)
        );

        this.setState({
            insertID: null,
            insertLocation: null,
            insertType: null,
            insertState: null,
            insertFlow: null,
            insertName: null
        });

        this.setState({editing: null});
        this.fetchTailwaters();
    }


    handleTailwaterUpdate(update) {
        const that = this;
        restAPI({
            method: 'post',
            url: '../api/tailwater/update',
            data: update,
        }).then(function () {
            that.fetchTailwaters();
        }).catch(function (err) {
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

    openDeleteModal() {
        this.setState({deleteModal: true})
    }

    renderItemOrEditField(loc) {
        if (this.state.editing === loc.id) {
            // Handle rendering our edit fields here.
            return <Fragment>
                <Row>
                    <Col md={"2"}>{loc.id}</Col>
                    <Col md={"2"}>
                        <input
                            type="text"
                            className="form-control"
                            ref={`location_${loc.id}`}
                            name="location"
                            defaultValue={loc.location}
                        />
                    </Col>
                    <Col md={"1"}>
                        <input
                            type="text"
                            className="form-control"
                            ref={`type_${loc.id}`}
                            name="type"
                            defaultValue={loc.type}
                        />
                    </Col>
                    <Col md={"1"}>
                        <input
                            type="text"
                            className="form-control"
                            ref={`state_${loc.id}`}
                            name="state"
                            defaultValue={loc.state}
                        />
                    </Col>
                    <Col md={"1"}>
                        <input
                            type="text"
                            className="form-control"
                            ref={`flowData_${loc.id}`}
                            name="flowData"
                            defaultValue={loc.flowData.toString()}
                        />
                    </Col>
                    <Col md={"2"}>
                        <input
                            type="text"
                            className="form-control"
                            ref={`name_${loc.id}`}
                            name="name"
                            defaultValue={loc.name}
                        />
                    </Col>
                    <div className="glyphicon glyphicon-floppy-save clickable text-success col-md-1"
                         onClick={this.handleEditItem}/>
                    <div className="glyphicon glyphicon-remove clickable text-danger col-md-1"
                         onClick={() => this.openDeleteModal()}/>
                </Row>

                <MDBModal show={this.state.deleteModal} onHide={this.close}>
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
                <Col md={"1"} className="glyphicon glyphicon-edit clickable text-primary"
                     onClick={this.toggleEditing.bind(null, loc.id)}/>
            </Row>;
        }
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col md={"12"}><h1>Tailwaters</h1></Col>
                </Row>
                <Row>
                    <Col md={"2"}>
                        <input name="insertID" id="insertID" className="form-control" type="text"
                               value={this.state.insertID} onChange={this.handleInputChange} placeholder="ID"/>
                    </Col>
                    <Col md={"2"}>
                        <input name="insertLocation" id="insertLocation" className="form-control" type="text"
                               value={this.state.insertLocation} onChange={this.handleInputChange}
                               placeholder="Location"/>
                    </Col>
                    <Col md={"1"}>
                        <input name="insertType" id="insertType" className="form-control" type="text"
                               value={this.state.insertType} onChange={this.handleInputChange} placeholder="Type"/>
                    </Col>
                    <Col md={"1"}>
                        <input name="insertState" id="insertState" className="form-control" type="text"
                               value={this.state.insertState} onChange={this.handleInputChange} placeholder="State"/>
                    </Col>
                    <Col md={"1"}>
                        <input name="insertFlow" id="insertFlow" className="form-control" type="text"
                               value={this.state.insertFlow} onChange={this.handleInputChange} placeholder="Flow"/>
                    </Col>
                    <Col md={"2"}>
                        <input name="insertName" id="insertName" className="form-control" type="text"
                               value={this.state.insertName} onChange={this.handleInputChange} placeholder="Name"/>
                    </Col>
                    <Col md={"1"} className="text-success glyphicon glyphicon-floppy-save clickable"
                         onClick={this.handleInsertItem}/>
                    <Col md={"2"} className="text-danger">{this.state.insertError}</Col>
                </Row>
                <Col md={"12"} className="col-md-12">
                    <Row>
                        <div className="col-md-2"><b>Id</b></div>
                        <div className="col-md-2"><b>Location</b></div>
                        <div className="col-md-1"><b>Type</b></div>
                        <div className="col-md-1"><b>State</b></div>
                        <div className="col-md-1"><b>Flow</b></div>
                        <div className="col-md-2"><b>Name</b></div>
                    </Row>
                    {this.state.locations.map(loc => {
                        return this.renderItemOrEditField(loc);
                    })}
                </Col>
            </Container>
        );
    }
}

export default Tailwater;
