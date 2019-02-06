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


import React from "react";
import {Legend, RadialBar, RadialBarChart, Tooltip} from "recharts";
import CustomTooltip from "./CustomTooltips";
import renderLegend from './renderLegend';

const createReactClass = require('create-react-class');

const HoverChart = createReactClass({
    getDefaultProps: function () {
        return {
            desc: React.string,
            data: React.array,
            dataKey: React.string
        };
    },
    render() {
        const {dataKey, data, desc} = this.props;

        console.log(`HoverChart props`, this.props);

        return (
            <RadialBarChart width={500} height={500} cx={150} cy={150} innerRadius={20}
                            barCategoryGap={10} outerRadius={140} barSize={20} data={data}>
                <RadialBar minAngle={15} background clockWise={true} dataKey={dataKey}/>
                <Legend wrapperStyle={{top: 25, right: 0, left: 0, bottom: 0}} iconSize={10}
                        top={10} layout='vertical' content={renderLegend}/>
                <Tooltip content={<CustomTooltip desc={desc}/>}/>
            </RadialBarChart>
        );
    }
});

export default HoverChart;
