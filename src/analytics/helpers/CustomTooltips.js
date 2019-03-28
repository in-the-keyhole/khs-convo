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


import '../../styles/index.css';
import React from 'react';

const CustomTooltip = (({active, type, payload, label, desc}) =>

        active ?
            <div className="custom-tooltip">
                <p className="desc">{desc || "Empty"}</p>
                <p className="name">{`${payload ? payload[0].payload.name : "Empty"}`}
                    - {`${payload ? payload[0].payload.count : "0"}`}</p>
            </div>
            : <p>Empty</p>

);


export default CustomTooltip;

