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
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import {customTotal} from '../common/pageinationOptions';
import BaseComponent from '../BaseComponent';
import {connect} from "react-redux";
import restAPI from '../service/restAPI';
import CommonUI from '../common/CommonUI';
// noinspection ES6CheckImport
import {Card, CardBody, CardTitle, Col, Row} from 'mdbreact';


//====== Column formatting functions ============
const _slicer = (arg, maxLen) => arg ? arg.toString().slice(0, maxLen) : '';

const phoneNumberFormatter =  arg => _slicer(arg, 12);

const questionFormatter = arg => _slicer(arg, 24);

const answerFormatter = arg => {
    const maxLen = 35; //75;
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
        sortCaret: CommonUI.ColumnSortCaret,
        filter: textFilter()
    },
    {
        text: 'Phone',
        dataField: 'phone',
        formatter: (phoneNumberFormatter),
        sort: true,
        sortCaret: CommonUI.ColumnSortCaret,
        filter: textFilter()
    },
    {
        text: 'Question',
        dataField: 'question',
        formatter: (questionFormatter),
        sort: true,
        sortCaret: CommonUI.ColumnSortCaret,
        filter: textFilter()
    },
    {
        text: 'Answer',
        dataField: 'answer',
        formatter: (answerFormatter),
        sort: true,
        sortCaret: CommonUI.ColumnSortCaret,
        filter: textFilter()
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
                        filter={ filterFactory() }
                    />
                </Col>
            </Row>
        </CardBody>
    </Card>
);


/**
 * This component renders the converastion list in remotely paged sections.
 */
class ConversationsList extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            data: [],
            sizePerPage: 10,
            totalSize: 0,
            showTotal: true,
            paginationTotalRenderer: customTotal,
            sortField: 'date',
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
     * Kicks the initial remote data chunk to render after mounting.
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


    /**
     * This delegate implements client interface to service-based sort and pagination.
     * Each current has the same logic. so ... they use this common delegate.
     * @param page
     * @param sizePerPage
     * @param sortField
     * @param sortOrder
     */
    tableChangeHelper = ({page, sizePerPage, sortField, sortOrder}) => {

        // Maintain whatever sortorder is in the state. If none, used date/-1 (descending)
        // The table uses asc / desc. Mongo uses 1/-1
        const mongoSortOrder =  sortOrder === 'asc' ? 1 : -1;
        const currentIndex = (page - 1) * sizePerPage;
        restAPI({
            url: `../api/convo/getconvochunk?skipCount=${currentIndex}&limitCount=${sizePerPage}&sortField=${sortField || 'date'}&sortOrder=${mongoSortOrder}`,
            data: this.state
        }).then(res => {
            this.setState(() => ({
                page,
                data: res.data,
                sizePerPage
            }));
            console.log(`tableChangeHelper after`, this.state);
        }).catch(err => console.log(err));
    };


    paginationHandler = ({page, sizePerPage, sortField, sortOrder}) => (this.tableChangeHelper({page, sizePerPage, sortField, sortOrder}));


    sortHandler = ({page, sizePerPage, sortField, sortOrder}) => (this.tableChangeHelper({page, sizePerPage, sortField, sortOrder}));


    filterHandler = ({page, sizePerPage, sortField, sortOrder, filters}) => {

        // 1. Create a MongoDB composite "AND-"query from the filters -- encode to base 64.
        const queryBase64 = (obj => {
            const q = {};

            for (const v in obj) {
                if (obj.hasOwnProperty(v)) {
                    q[v] = obj[v].filterVal;
                }
            }

            console.log(`query:`, q);

            const json = JSON.stringify(q);
            const b64 =   Buffer.from(json).toString('base64');

            console.log(`query in base64:`, b64);
            return b64

        })(filters);

        // 2. Get the filtered data, maintaining sortorder and pagination.

        // Maintain any sortorder found in the state. If none, default to field date with order-1 (descending)
        // The table uses asc / desc. Mongo uses 1/-1
        const mongoSortOrder =  sortOrder === 'asc' ? 1 : -1;
        const currentIndex = (page - 1) * sizePerPage;
        // Adds filters=${queryBase64}&
        const url = `../api/convo/getconvochunk?filters=${queryBase64}&skipCount=${currentIndex}&limitCount=${sizePerPage}&sortField=${sortField || 'date'}&sortOrder=${mongoSortOrder}`;
        console.log(url);

        restAPI({
            url: url,
            data: this.state
        }).then(res => {
            const v = res.data;
            this.setState(() => ({
                page,
                data: v.data,
                sizePerPage,
                skipCount: v.skipCount,
                limitCount: v.limitCounts,
                totalSize: v.totalSize
            }));
            console.log(`tableChangeHelper after`, this.state);
        }).catch(err => console.log(err));

    };


/*    filterHandler = ({ filters }) => {
        setTimeout(() => {
            const result = products.filter((row) => {
                let valid = true;
                for (const dataField in filters) {
                    const { filterVal, filterType, comparator } = filters[dataField];

                    if (filterType === 'TEXT') {
                        if (comparator === Comparator.LIKE) {
                            valid = row[dataField].toString().indexOf(filterVal) > -1;
                        } else {
                            valid = row[dataField] === filterVal;
                        }
                    }
                    if (!valid) break;
                }
                return valid;
            });
            this.setState(() => ({
                data: result
            }));
        }, 2000);
    };*/


    /**
     * This is the Big Kahuna for table server-implemented page sorting, pagination, and filtering.
     * It can route to cell edit code, as well, if implemented.
     *
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
    onTableChange = (type, {page, sizePerPage, sortField, sortOrder, filters}) => {
        if (type === 'pagination'){
            this.paginationHandler( {page, sizePerPage, sortField, sortOrder} );
        } else if (type === 'sort'){
            this.sortHandler( {page, sizePerPage, sortField, sortOrder} );
        } else if (type === 'filter') {
            console.log(`>>>>> We have  filters`, filters);
            /*  Here's filter set. Each item should be AND clause. LIKE done by regex: /426/
                {
                    answer: {filterVal: "you", filterType: "TEXT", comparator: "LIKE", caseSensitive: false}
                    date: {filterVal: "T17", filterType: "TEXT", comparator: "LIKE", caseSensitive: false}
                    phone: {filterVal: "426", filterType: "TEXT", comparator: "LIKE", caseSensitive: false}
                    question: {filterVal: "111", filterType: "TEXT", comparator: "LIKE", caseSensitive: false}
                }
            */
            this.filterHandler( {page, sizePerPage, sortField, sortOrder, filters} );
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
export default connect(mapStateToProps)(ConversationsList);
