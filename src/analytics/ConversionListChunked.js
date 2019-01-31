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
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {customTotal} from '../common/pageinationOptions';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";
import restAPI from '../service/restAPI';
import CommonUI from '../common/CommonUI';
// noinspection ES6CheckImport
import {Card, CardBody, CardTitle, Col, Row} from 'mdbreact';

/*const columns = [{
    dataField: 'id',
    text: 'Product ID'
}, {
    dataField: 'name',
    text: 'Product Name'
}, {
    dataField: 'price',
    text: 'Product Price'
}];

const products = [
    {id: '1', name: 'Product 1', price: '$123.45'},
    {id: '2', name: 'Product 2', price: '$33.99'},
    {id: '3', name: 'Product 3', price: `9.99`},
    {id: '11', name: 'Product 11', price: '$123.45'},
    {id: '21', name: 'Product 21', price: '$33.99'},
    {id: '31', name: 'Product 12', price: `9.99`},
    {id: '12', name: 'Product 12', price: '$123.45'},
    {id: '22', name: 'Product 22', price: '$33.99'},
    {id: '32', name: 'Product 32', price: `9.99`},
    {id: '14', name: 'Product 14', price: '$123.45'},
    {id: '44', name: 'Product 44', price: '$33.99'},
    {id: '34', name: 'Product 34', price: `9.99`},
    {id: '15', name: 'Product 15', price: '$123.45'},
    {id: '25', name: 'Product 25', price: '$33.99'},
    {id: '35', name: 'Product 35', price: `9.99`},
    {id: '16', name: 'Product 16', price: '$123.45'},
    {id: '26', name: 'Product 26', price: '$33.99'},
    {id: '36', name: 'Product 36', price: `9.99`},
];*/

//====== Column formatting functions ============
const _slicer = (arg, maxLen) => arg ? arg.toString().slice(0, maxLen) : '';

const phoneNumberFormatter =  arg => _slicer(arg, 20);

const questionFormatter = arg => _slicer(arg, 26);

const answerFormatter = arg => {
    const maxLen = 75;
    const val = arg ? arg.toString() : '';
    return val.length > maxLen ? `${_slicer(val, maxLen)} ...` : val;
};

//====== Table declarations
const columns = [
    {
        text: '_id',
        hidden: true,
        dataField: '_id',
        isKey: true
    },
    {
        text: 'Date',
        dataField: 'date',
        sort: true,
        sortCaret: CommonUI.ColumnSortCaret
    },
    {
        text: 'Phone',
        dataField: 'phone',
        formatter: (phoneNumberFormatter),
        sort: true,
        sortCaret: CommonUI.ColumnSortCaret
    },
    {
        text: 'Question',
        dataField: 'question',
        formatter: (questionFormatter),
        sort: true,
        sortCaret: CommonUI.ColumnSortCaret
    },
    {
        text: 'Answer',
        dataField: 'answer',
        formatter: (answerFormatter),
        sort: true,
        sortCaret: CommonUI.ColumnSortCaret
    },
    {
        text: 'word',
        hidden: true,
        dataField: 'word',
    }
];

const RemotelyPaginatedTable = (
    {data, page, sizePerPage, onTableChange, totalSize, showTotal, paginationTotalRenderer}) => (
    <Card>
        <CardBody>
            <CardTitle>Analytics</CardTitle>
            <Row><Col>Conversations</Col></Row>
            <Row>
                <Col>
                    <BootstrapTable
                        remote
                        keyField="_id"
                        data={data}
                        columns={columns}
                        pagination={paginationFactory(
                            {page, sizePerPage, totalSize, showTotal, paginationTotalRenderer})}
                        onTableChange={onTableChange}
                    />
                </Col>
            </Row>
        </CardBody>
    </Card>
);


class ConversionListChunked extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            data: [],
            sizePerPage: 10,
            totalSize: 0,
            showTotal: true,
            onTableChange: this.onTableChange,
            paginationTotalRenderer: customTotal
        };
    }


    componentWillMount() {
        super.componentWillMount();
        this.fetchDataCount();
    }

    componentDidMount() {
        // Kick in the first chunk
        this.onTableChange('pagination', {page: 1, sizePerPage: this.state.sizePerPage})
    }

    fetchDataCount() {
        restAPI({
            url: '../api/convo/getconvocount',
            data: this.state
        }).then(res => {
            this.setState({
                totalSize: res.data
            });
        }).catch(err => console.log(err));
    }


    onTableChange = (type, {page, sizePerPage}) => {
        const currentIndex = (page - 1) * sizePerPage;
        restAPI({
            url: `../api/convo/getconvochunk?skipCount=${currentIndex}&limitCount=${sizePerPage}`,
            data: this.state
        }).then(res => {
            this.setState(() => ({
                page,
                data: res.data,
                sizePerPage,
            }));
            console.log(`fetchConversationsByChunk after`, this.state);
        }).catch(err => console.log(err));
    };


    render() {
        const {data, sizePerPage, page, totalSize, showTotal, onTableChange, paginationTotalRenderer} = this.state;
        return (
            <RemotelyPaginatedTable
                data={data}
                page={page}
                sizePerPage={sizePerPage}
                totalSize={totalSize}
                showTotal={showTotal}
                onTableChange={onTableChange}
                paginationTotalRenderer={paginationTotalRenderer}
            />
        );
    }
}


const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(ConversionListChunked);
