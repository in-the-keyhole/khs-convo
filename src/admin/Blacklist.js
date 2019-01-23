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
import '../styles/data-table.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { Modal  } from 'react-bootstrap';
import BaseComponent from '../BaseComponent';

class Blacklist extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            numbers: [],
            currentItem:null,
            insertNumber: null,
            insertNotes: null
        }

        this.componentWillMount = this.componentWillMount.bind(this);
        this.handleInsertItem = this.handleInsertItem.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.blackListToolbar = this.blackListToolbar.bind(this);
    }

    componentWillMount() {
        super.componentWillMount();
        this.fetchBlacklist();
    }

    fetchBlacklist() {
        var self = this;
        ajax({
            url:'../api/admin/blacklist',
            data: this.state
        }).then(function(res, me) {
            console.log(me);
            self.setState({ numbers: res.data.sort(function(a,b){
                return (a.phone.toLowerCase() > b.phone.toLowerCase()) ? 1 : -1;
            }) });
        }).catch(function(err){console.log(err)});
    }

    handleBlacklistInsert(insert) {
        ajax({
            method:'post',
            url:'../api/admin/blacklist',
            data: insert,
        }).then(function(res, me) {
            console.log(me);
        }).catch(function(err){console.log(err)});

        this.setState( { editing: null} );
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
        } else {
            this.setState({
                insertError: "Phone number cannot be empty"
                });
        }

        this.fetchBlacklist();
    }

    handleInputChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});
    }

    openDeleteModal(item){ this.setState( {
        currentItem: item,
        deleteModal: true
    })}


    onAfterSaveCell(row, cellName, cellValue) {
        var update = {
            phone: row.phone,
            [cellName]: cellValue
        }

        ajax({
            method:'put',
            url:'../api/admin/blacklist',
            data: update,
        }).then(function(res, me) {
            console.log(me);
        }).catch(function(err){console.log(err)});
    }

    deleteItem() {
      var item = this.state.currentItem;
     var remove ={
       phone: item.phone,
       notes: item.notes

     }
    ajax({
        method:'delete',
        url:'../api/admin/blacklist',
        data: remove,
    }).then(function(res, me) {
        console.log(me);
    }).catch(function(err){console.log(err)});

        this.fetchBlacklist();
        this.setState ({
            deleteModal: false
        })
    }

    closeDeleteModal(){ this.setState({
        currentItem: null,
        deleteModal: false
    })}

    blackListToolbar(cell, row) {
        return (
                <div className="adminIcons">
                     <i title="delete" className="glyphicon glyphicon-remove-sign text-danger clickable"  onClick={() => this.openDeleteModal(row)}  />
                </div>
        )
    }

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12"><h1>Blacklist</h1></div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <input name="insertNumber"id="insertNumber" className="form-control" type="text" value={this.state.insertNumber || ''} onChange={this.handleInputChange} placeholder="Phone" />
                    </div>
                    <div className="col-md-4">
                        <input name="insertNotes"id="insertNotes" className="form-control" type="text" value={this.state.insertNotes || ''} onChange={this.handleInputChange} placeholder="Notes" />
                    </div>
                    <div className="col-md-1 text-success glyphicon glyphicon-floppy-save clickable" onClick={ this.handleInsertItem }/>
                    <div className="col-md-2 text-danger">{this.state.insertError}</div>
                </div>
                <div className="row">
                   <div className="col-md-12">
                      <div className="row">
                        <div className="col-md-2"><b>Phone</b></div>
                        <div className="col-md-4"><b>Notes</b></div>
                      </div>
                    <div className="col-md-12 list">
                        <div className="row">
                            <BootstrapTable
                                data={ this.state.numbers }
                                //insertRow={ true }
                                pagination
                                cellEdit={ {
                                    mode: 'click',
                                    blurToSave: true,
                                    afterSaveCell: this.onAfterSaveCell
                                }}>
                                <TableHeaderColumn dataField='phone' width="15%"  isKey>Phone</TableHeaderColumn>
                                <TableHeaderColumn dataField='notes' width="70%" >Notes</TableHeaderColumn>
                                <TableHeaderColumn width="15%" editable={ false } dataFormat={this.blackListToolbar}></TableHeaderColumn>
                            </BootstrapTable>
                        </div>
                       </div>
                    </div>

                    <Modal show={this.state.deleteModal} onHide={this.close}>
                        <Modal.Body>
                            <div className="form-group">
                                <label>Are you sure you want to delete this?</label>
                            </div>
                            <div className="row">
                                <div className="col-md-3"></div>
                                <div className="col-md-4"> <button className="btn btn-danger"  onClick={() => this.deleteItem()} >Delete</button> </div>
                                <div className="col-md-5"> <button className="btn btn-default" onClick={() => this.closeDeleteModal()}>Cancel</button>  </div>
                            </div>
                        </Modal.Body>
                    </Modal>

                </div>
            </div>
        );
    }
}

export default Blacklist;
