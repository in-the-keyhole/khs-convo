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

import React, { Component } from 'react';
import $ from "jquery";

class UserList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: []
        }
        this.componentWillMount = this.componentWillMount.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    componentWillMount() {

        var url = 'api/admin';
        fetch(url)
            .then(function(response) {
            if (response.status >= 400) {
            throw new Error("Bad response from server");
            }
            return response.json();
            })
            .then( json => {
                console.log(json);
                this.setState({
                    users: json
                });
            });
    }

    deleteUser(id){
        console.log(id);

        // TODO Use axios
        $.ajax({
          url: 'api/admin',
          type: 'DELETE',
          data: id,
          dataType: 'json',
          cache: false,
          success: function(data) {
            console.log('User Deleted');
          },
          error: function(xhr, status, err) {
            console.log('delete ajax errr');
            console.error(this.props.url, status, err.toString());
          }.bind(this)
        });
    }

    render() {
        return (
            <div className="col-md-12">
                <div className="row">
                    <div className="col-md-2"><b>First Name</b></div>
                    <div className="col-md-2"><b>Last Name</b></div>
                    <div className="col-md-2"><b>Phone</b></div>
                </div>
            {this.state.users.map(user =>
                <div className="row" key={user._id}>
                    <div className="col-md-2">{user.FirstName}</div>
                    <div className="col-md-2">{user.LastName}</div>
                    <div className="col-md-2">{user.Phone}</div>
                    <div className="col-md-2"><button onClick={() => this.deleteUser({"Phone": user.Phone})} className="btn btn-danger">Delete</button></div>
                </div>
            )}
            </div>
        );
    }
}

export default UserList;
