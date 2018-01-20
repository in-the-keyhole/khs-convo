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
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css

class ConfirmAlert extends Component {

    submit = () => {
        confirmAlert({
          title: 'Confirm to delete',                        // Title dialog
          message: 'Are you sure you wish to delete?',       // Message dialog
          childrenElement: () => <div>Custom UI</div>,       // Custom UI or Component
          confirmLabel: 'Confirm',                           // Text button confirm
          cancelLabel: 'Cancel',                             // Text button cancel
          onConfirm: () => alert('Action after Confirm'),    // Action after Confirm
          onCancel: () => alert('Action after Cancel'),      // Action after Cancel
        })
      };

      render() {
        return (
          <div className="container">
            <button onClick={this.submit}>Confirm dialog</button>
          </div>
        );
      }
    }

export default ConfirmAlert
