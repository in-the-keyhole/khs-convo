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

import React from 'react';
import restAPI from '../service/restAPI';
import { Modal  } from 'react-bootstrap';
import BaseComponent from '../BaseComponent';

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
        }

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
        var self = this;
        restAPI({
            url:'../api/tailwater',
            data: this.state,
            cache: false
        }).then(function(res, me) {
            self.setState({ locations: res.data });
        }).catch(function(err){console.log(err)});
    }

    handleTailwaterInsert(insert) {
        var that = this;
        restAPI({
            method:'post',
            url:'../api/tailwater/insert',
            data: insert,
        }).then(function(res, me) {
            that.fetchTailwaters();
        }).catch(function(err){console.log(err)});
        this.setState( { insertID: null,
            insertLocation: null,
            insertType: null,
            insertState: null,
            insertFlow: null,
            insertName: null } );
        this.setState( { editing: null } );
        this.fetchTailwaters();
    }

    handleTailwaterUpdate(update) {
        var that = this;
        restAPI({
            method:'post',
            url:'../api/tailwater/update',
            data: update,
        }).then(function(res, me) {
            that.fetchTailwaters();
        }).catch(function(err){console.log(err)});

        this.setState( { editing: null } );
        this.fetchTailwaters();
    }

    handleTailwaterDelete(remove) {
        var that = this;
        restAPI({
            method:'delete',
            url:'../api/tailwater',
            data: remove,
        }).then(function(res, me) {
            that.closeDeleteModal();
            that.fetchTailwaters();
        }).catch(function(err){console.log(err)});
        this.closeDeleteModal();
        this.fetchTailwaters();
    }

    toggleEditing( itemId ) {
        this.setState( { editing: itemId } );
    }

    handleEditItem() {
        let itemId = this.state.editing;

        this.handleTailwaterUpdate({
        id: itemId,
        location: this.refs[ `location_${ itemId }` ].value,
        type: this.refs[ `type_${ itemId }` ].value,
        state: this.refs[ `state_${ itemId }` ].value,
        flowData: this.refs[ `flowData_${ itemId }` ].value === 'true' ? true : false,
        name: this.refs[ `name_${ itemId }` ].value
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
            flowData: this.state.insertFlow === 'true' ? true : false,
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

        this.handleTailwaterDelete({
        id: itemId,
        location: this.refs[ `location_${ itemId }` ].value,
        type: this.refs[ `type_${ itemId }` ].value,
        state: this.refs[ `state_${ itemId }` ].value,
        flowData: this.refs[ `flowData_${ itemId }` ].value,
        name: this.refs[ `name_${ itemId }` ].value
        });
    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});
    }

    closeDeleteModal(){
        this.setState( { deleteModal: false })
    }

    openDeleteModal(){
        this.setState( { deleteModal: true })
    }

    renderItemOrEditField(loc) {
        if ( this.state.editing === loc.id ) {
        // Handle rendering our edit fields here.
            return <div className="row">
                    <div className="col-md-2">{loc.id}</div>
                    <div className="col-md-2">
                        <input
                        type="text"
                        className="form-control"
                        ref={ `location_${ loc.id }` }
                        name="location"
                        defaultValue={ loc.location }
                        />
                    </div>
                    <div className="col-md-1">
                        <input
                        type="text"
                        className="form-control"
                        ref={ `type_${ loc.id }` }
                        name="type"
                        defaultValue={ loc.type }
                        />
                    </div>
                    <div className="col-md-1">
                        <input
                        type="text"
                        className="form-control"
                        ref={ `state_${ loc.id }` }
                        name="state"
                        defaultValue={ loc.state }
                        />
                    </div>
                    <div className="col-md-1">
                        <input
                        type="text"
                        className="form-control"
                        ref={ `flowData_${ loc.id }` }
                        name="flowData"
                        defaultValue={ loc.flowData.toString() }
                        />
                    </div>
                    <div className="col-md-2">
                        <input
                        type="text"
                        className="form-control"
                        ref={ `name_${ loc.id }` }
                        name="name"
                        defaultValue={ loc.name }
                        />
                    </div>
                    <div className="glyphicon glyphicon-floppy-save clickable text-success col-md-1" onClick={ this.handleEditItem }/>
                    <div className="glyphicon glyphicon-remove clickable text-danger col-md-1" onClick={() => this.openDeleteModal()}/>

                        <Modal show={this.state.deleteModal} onHide={this.close}>
                            <Modal.Body>
                                <div className="form-group">
                                    <label>Are you sure you want to delete this?</label>
                                </div>
                                <div className="row">
                                    <div className="col-md-3"> </div>
                                    <div className="col-md-4">  <button className="btn btn-danger"  onClick={() => this.handleDeleteItem()} >Delete</button> </div>
                                    <div className="col-md-5">  <button className="btn btn-default" onClick={() => this.closeDeleteModal()}>Cancel</button></div>
                                </div>
                            </Modal.Body>
                        </Modal>
                </div>;

        } else {
        return <div className="row">
                    <div className="col-md-2">{loc.id}</div>
                    <div className="col-md-2">{loc.location}</div>
                    <div className="col-md-1">{loc.type}</div>
                    <div className="col-md-1">{loc.state}</div>
                    <div className="col-md-1">{loc.flowData.toString()}</div>
                    <div className="col-md-2">{loc.name}</div>
                    <div className="glyphicon glyphicon-edit clickable text-primary col-md-1" onClick={ this.toggleEditing.bind(null, loc.id) }/>
                </div>;
        }
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12"><h1>Tailwaters</h1></div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <input name="insertID"id="insertID" className="form-control" type="text" value={this.state.insertID} onChange={this.handleInputChange} placeholder="ID" />
                    </div>
                    <div className="col-md-2">
                        <input name="insertLocation"id="insertLocation" className="form-control" type="text" value={this.state.insertLocation} onChange={this.handleInputChange} placeholder="Location" />
                    </div>
                    <div className="col-md-1">
                        <input name="insertType"id="insertType" className="form-control" type="text" value={this.state.insertType} onChange={this.handleInputChange} placeholder="Type" />
                    </div>
                    <div className="col-md-1">
                        <input name="insertState"id="insertState" className="form-control" type="text" value={this.state.insertState} onChange={this.handleInputChange} placeholder="State" />
                    </div>
                    <div className="col-md-1">
                        <input name="insertFlow"id="insertFlow" className="form-control" type="text" value={this.state.insertFlow} onChange={this.handleInputChange} placeholder="Flow" />
                    </div>
                    <div className="col-md-2">
                        <input name="insertName"id="insertName" className="form-control" type="text" value={this.state.insertName} onChange={this.handleInputChange} placeholder="Name" />
                    </div>
                    <div className="col-md-1 text-success glyphicon glyphicon-floppy-save clickable" onClick={ this.handleInsertItem }/>
                    <div className="col-md-2 text-danger">{this.state.insertError}</div>
                </div>
                <div className="col-md-12">
                    <div className="row">
                        <div className="col-md-2"><b>Id</b></div>
                        <div className="col-md-2"><b>Location</b></div>
                        <div className="col-md-1"><b>Type</b></div>
                        <div className="col-md-1"><b>State</b></div>
                        <div className="col-md-1"><b>Flow</b></div>
                        <div className="col-md-2"><b>Name</b></div>
                    </div>
                {this.state.locations.map(loc => {
                    return this.renderItemOrEditField(loc);
                })}
                </div>
            </div>
        );
    }
}

export default Tailwater;
