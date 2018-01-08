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
import ajax from '../util/ajax';
import { Modal  } from 'react-bootstrap';        
import '../styles/data-table.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import '../styles/index.css';

class Properties extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contents: [],
            insertName: null,
            insertContent: null,
            currentProperty:null
        }

        this.componentWillMount = this.componentWillMount.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInsertItem = this.handleInsertItem.bind(this);
        this.propertyToolbar = this.propertyToolbar.bind(this);
        this.deleteProperty = this.deleteProperty.bind(this);
    }

    componentWillMount() {
        this.fetchContents();
    }

    fetchContents() {
        var self = this;
        ajax({ 
            url:'../api/admin/content', 
            data: this.state
        }).then(function(res, me) {

            self.setState({ contents: res.data.sort(function (a,b){
                return  (a.Name.toLowerCase() > b.Name.toLowerCase()) ? 1 : -1;
            }) });
        }).catch(function(err){console.log(err)});
    }
 

    handleContentDelete(remove) {
        ajax({
            method:'delete',
            url:'../api/admin/content',
            data: remove,
        }).then(function(res, me) {
            console.log(me);
        }).catch(function(err){console.log(err)});
    }

    deleteProperty() {
        var itemId = this.state.currentProperty;
        var remove = {
            Name: itemId.Name 
        };
        
        ajax({
            method:'delete',
            url:'../api/admin/content',
            data: remove,
        }).then(function(res, me) {
            console.log(me);
        }).catch(function(err){console.log(err)});

        this.fetchContents();
        this.setState ({
            deleteModal: false 
        })
    }

    onAfterSaveCell(row, cellName, cellValue) {
        var update = {
            Name: row.Name,
            Content:row.Content
        }
 
        ajax({ 
            method:'put',
            url:'../api/admin/content', 
            data: update,
        }).then(function(res, me) {
            console.log(me);
        }).catch(function(err){console.log(err)});
    } 


    handleContentInsert(insert) {
            ajax({
                method:'post',
                url:'../api/admin/content',
                data: insert,
            }).then(function(res, me) {
                console.log(me);
            }).catch(function(err){console.log(err)});
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
                    <i title="delete" className="glyphicon glyphicon-remove-sign text-danger clickable"  onClick={() => this.openDeleteModal(row)}  />
                </div>  
        )
    }
   

    openDeleteModal(property){ this.setState( { 
        currentProperty: property,
        deleteModal: true
    })}

    closeDeleteModal(){ this.setState({ 
        currentProperty: null,        
        deleteModal: false 
    })}
  

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12"><h1>Properties</h1></div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <input name="insertName"id="insertName" className="form-control" type="text" value={this.state.insertName} onChange={this.handleInputChange} placeholder="Name" />
                    </div>
                    <div className="col-md-4">
                        <input name="insertContent"id="insertContent" className="form-control" type="text" value={this.state.insertContent} onChange={this.handleInputChange} placeholder="Content" />
                    </div>
                    <div className="col-md-1 text-success glyphicon glyphicon-floppy-save clickable" onClick={ this.handleInsertItem }/>
                    <div className="col-md-2 text-danger">{this.state.insertError}</div>
                </div>


                <Modal show={this.state.deleteModal} onHide={this.close}>
                    <Modal.Body>
                        <div className="form-group">
                            <label>Are you sure you want to delete this property?</label>
                        </div>
                        <div className="row">
                             <div className="col-md-3"> </div>
                             <div className="col-md-4"> <button className="btn btn-danger"  onClick={() => this.deleteProperty()} >Delete</button> </div>
                             <div className="col-md-5"> <button className="btn btn-default" onClick={() => this.closeDeleteModal()}>Cancel</button>   </div>                 
                        </div> 
                    </Modal.Body>
                </Modal>
                <div className="col-md-12 list">
                    <div className="row">
                        <BootstrapTable 
                            data={ this.state.contents } 
                            pagination
                            cellEdit={ {
                                mode: 'click',
                                blurToSave: true,
                                afterSaveCell: this.onAfterSaveCell
                            }}>
                            <TableHeaderColumn dataField='_id' isKey hidden>ID</TableHeaderColumn>
                            <TableHeaderColumn dataField='Name' editable={ false } >Property</TableHeaderColumn>
                            <TableHeaderColumn dataField='Content' >Value</TableHeaderColumn>
                            <TableHeaderColumn width="60" editable={ false } dataFormat={this.propertyToolbar}></TableHeaderColumn>
                        </BootstrapTable>
                    </div>
                </div>  
            </div>
        );
    }
}

export default Properties;
