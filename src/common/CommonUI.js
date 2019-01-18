/*
 * Copyright (c) 2019 Keyhole Software LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import React from 'react';
import {MDBIcon} from 'mdbreact';

class CommonUI {

    static ColumnSortCaret(order) {
        const caretColor = {color: 'LightGray'};
        let caret;

        if (!order) {
            caret = <span>&nbsp;<MDBIcon style={caretColor} icon="caret-down"/>
                <MDBIcon style={caretColor} icon="caret-up"/></span>
        } else if (order === 'asc') {
            caret = <span>&nbsp;<MDBIcon style={caretColor} icon="caret-up"/></span>
        } else if (order === 'desc') {
            caret = <span>&nbsp;<MDBIcon style={caretColor} icon="caret-down"/></span>
        }
        return caret;
    };

}

export default CommonUI;
