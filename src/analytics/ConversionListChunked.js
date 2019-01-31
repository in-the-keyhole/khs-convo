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

const defaultSorted = [{
    dataField: 'date',
    order: 'desc'
}];

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
                        defaultSorted={ defaultSorted }
                        pagination={paginationFactory(
                            {page, sizePerPage, totalSize, showTotal, paginationTotalRenderer})}
                        onTableChange={onTableChange}
                    />
                </Col>
            </Row>
        </CardBody>
    </Card>
);


/**
 * This component renders the converastion list in remotely paged sections.
 */
class ConversionListChunked extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            data: [],
            sizePerPage: 10,
            totalSize: 0,
            showTotal: true,
            paginationTotalRenderer: customTotal,
            sortField: 0,
            sortOrder: 'desc'
        };

        this.onTableChange = this.onTableChange.bind(this);
    }


    /**
     * All URL-driven components should call super here. Our Redux credential mechanism will
     * kick us back to login if an aunathenticated user invokes the URL for this component.
     * Initial data load if that succeeds.
     */
    componentWillMount() {
        super.componentWillMount();
        this.fetchDataCount();
    }


    /**
     * This causes the initial remote data chunk to render after mounting.
     */
    componentDidMount() {
        // Render the first chunk
        this.onTableChange('pagination', {page: 1, sizePerPage: this.state.sizePerPage})
    }


    /**
     * Asynchronously updates the total data (convo) record count: state.totalSize.
     */
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


    paginationHandler = ({page, sizePerPage}) => {

        const currentIndex = (page - 1) * sizePerPage;
        restAPI({
            url: `../api/convo/getconvochunk?skipCount=${currentIndex}&limitCount=${sizePerPage}`,
            data: this.state
        }).then(res => {
            this.setState(() => ({
                page,
                data: res.data,
                sizePerPage
            }));
            console.log(`paginationHandler after`, this.state);
        }).catch(err => console.log(err));
    };


    sortHandler = ( {page, sizePerPage, sortField, sortOrder} ) => {

        // The table uses asc / desc. Mongo uses 1/-1
        const mongoSortOrder =  sortOrder === 'asc' ? 1 : -1;
        const currentIndex = (page - 1) * sizePerPage;
        restAPI({
            url: `../api/convo/getconvochunk?skipCount=${currentIndex}&limitCount=${sizePerPage}&sortField=${sortField}&sortOrder=${mongoSortOrder}`,
            data: this.state
        }).then(res => {
            this.setState(() => ({
                page,
                data: res.data,
                sizePerPage
            }));
            console.log(`sortHandler after`, this.state);
        }).catch(err => console.log(err));

    };


    /**
     * See https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/table-props.html#ontablechange-function
     * Specify the onTableChange prop on a React BootStrap Table 2
     *
     * Allowed values of type, a key to newState
     *      - filter
     *      - pagination
     *      - sort
     *      - cellEdit
     *
     *  Shape of newSate
     *
     *   {
     *       page,  // newest page
     *       sizePerPage,  // newest sizePerPage
     *       sortField,  // newest sort field
     *       sortOrder,  // newest sort order
     *       filters, // an object which have current filter status per column
     *       data, // when you enable remote sort, you may need to base on data to sort if data is filtered/searched
     *       cellEdit: {  // You can only see this prop when type is cellEdit
     *           rowId,
     *           dataField,
     *           newValue
     *   }
     *
     * @param type as listed above
     * @param newState next React state to be set
     */
    onTableChange = (type, {page, sizePerPage, sortField, sortOrder, data}) => {
        if (type === 'pagination'){
            this.paginationHandler( {page, sizePerPage} );
        } else if (type === 'sort'){
            this.sortHandler( {page, sizePerPage, sortField, sortOrder, data} );
        }
    };


    /**
     * A required override for a React class-based component. It ... renders
     * @returns {*}
     */
    render() {
        const {data, sizePerPage, page, totalSize, showTotal, paginationTotalRenderer} = this.state;
        return (
            <RemotelyPaginatedTable
                data={data}
                page={page}
                sizePerPage={sizePerPage}
                totalSize={totalSize}
                showTotal={showTotal}
                onTableChange={this.onTableChange}
                paginationTotalRenderer={paginationTotalRenderer}
            />
        );
    }
}


const mapStateToProps = state => ({credentials: state.credentials});
export default connect(mapStateToProps)(ConversionListChunked);
