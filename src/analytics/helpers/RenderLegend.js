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
import React from "react";

/**
 * This fragment is a rendered tooltip legend used by  HoverChart -> CustomTooltips
 *
 * @param props
 * @returns legend render-fragment
 */
const RenderLegend = ({payload}) => (

        <ul className={"legend"}><span>Items</span>
            {
                payload.map((entry, index) => (
                    <li key={`item-${index}`}>
                        <div className={"legend-col-1"} style={{backgroundColor: entry.payload.fill}}/>
                        <div className={"legend-col-2"}>{entry.value} - {entry.payload.count}</div>
                    </li>
                ))
            }
        </ul>
);

export default RenderLegend;
