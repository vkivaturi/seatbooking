import React, { Component } from 'react';
import ReactTable from 'react-table';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { ExportToCsv } from 'export-to-csv';

import 'react-table/react-table.css';
import { AuthUserContext, withAuthorization } from '../Session';
import AddRoute from './addroute.js';
import DeleteRoute from './deleteroute.js';
import UpdateRoute from './updateroute.js';

import { withFirebase } from '../Firebase';
//import * as ROUTES from '../../constants/routes';

const config = {
    admins: process.env.REACT_APP_ADMINS,
};

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

class AdminPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            bookings: [],
            pickup_date: '',
            route_trip: '',
            pickup_loc: '',
            drop_loc: '',

        };
    }

    componentWillUnmount() {
        this.props.firebase.users().off();
        this.props.firebase.bookings().off();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    }

    // Fetch bookings for the specific date - input date format is like 03-May
    fetchBookings = () => {
        //Reset firebase connection to trigger search again even if input has not changed
        this.props.firebase.bookings().off();

        this.props.firebase.db.ref("bookings").orderByChild("pickup_date").equalTo(this.state.pickup_date).on('value', snapshot => {
            const bookingsObject = snapshot.val();

            if (bookingsObject != null) {
                const bookingsList = Object.keys(bookingsObject).map(key => ({
                    ...bookingsObject[key],
                    uidbookingsid: key,
                }));

                this.setState({
                    bookings: bookingsList,
                });
            } else {
                this.setState({
                    bookings: [],
                });
            }
        });
    }

    //Function to download bookings data as a CSV file
    exportBookings = () => {
        const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true,
            showTitle: true,
            title: this.state.pickup_date + '-' + Date.now(),
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
            //headers: ['Status', 'Booking time', 'Phone number', 'Pickup date', 'Trip', 'Pickup location', 'Drop location', 'Status', 'Booking time']
        };

        const csvExporter = new ExportToCsv(options);

        csvExporter.generateCsv(JSON.stringify(this.state.bookings));
    }

    fetchUsers = () => {
        this.props.firebase.users().on('value', snapshot => {
            const usersObject = snapshot.val();
            if (usersObject != null) {
                const usersList = Object.keys(usersObject).map(key => ({
                    ...usersObject[key],
                    uid: key,
                }));

                this.setState({
                    users: usersList,
                });
            }

        });
    }

    render() {
        const { users, bookings } = this.state;

        const columnsUser = [{
            Header: 'Email',
            accessor: 'email',

        }, {
            Header: 'User name',
            accessor: 'username',

        }, {
            Header: 'Phone number',
            accessor: 'phone',

        }]

        const columnsBooking = [{
            Header: 'Email',
            accessor: 'email_id',

        }, {
            Header: 'User',
            accessor: 'username',

        }, {
            Header: 'Phone number',
            accessor: 'phone',

        }, {
            Header: 'Pickup date',
            accessor: 'pickup_date',

        }, {
            Header: 'Trip',
            accessor: 'route_trip',

        }, {
            Header: 'Pickup location',
            accessor: 'pickup_loc',

        }, {
            Header: 'Drop location',
            accessor: 'drop_loc',

        }, {
            Header: 'Status',
            accessor: 'booking_status',

        },
        {
            Header: 'Booking time',
            accessor: 'creation_date',

        }];
        
        //Disable download button if no bookings for the search criteria
        var isNoBookings = this.state.bookings.length === 0;

        return (
            <AuthUserContext.Consumer>
                {authUser => (
                    <div>
                        <div>
                            {config.admins.toUpperCase().indexOf(authUser.email.toUpperCase()) !== -1 ?
                                <Tabs defaultActiveKey="bookings">
                                    <Tab eventKey="bookings" title="Bookings">
                                        <div id="bookings">
                                            <div class="input-group mb-3">
                                                <input type="text" class="form-control" name="pickup_date" onChange={this.onChange} placeholder="Pickup date like 03-May" aria-describedby="basic-addon2" />
                                                <div class="input-group-append">
                                                    <button class="btn btn-primary border border-white" type="button" onClick={this.fetchBookings} >Search bookings</button>
                                                    <button class="btn btn-success border border-white" type="button" disabled={isNoBookings} onClick={this.exportBookings} >Download bookings</button>

                                                </div>
                                            </div>

                                            <ReactTable
                                                data={bookings} columns={columnsBooking} filterable='true' defaultPageSize='20'
                                            />
                                        </div>

                                    </Tab>
                                    <Tab eventKey="listusers" title="Users">
                                        <div class="card" style={myDivStyle} id="listusers">
                                            <div class="card-header">
                                                Registered users </div>
                                            <div class="card-body" >
                                                <button class="btn btn-primary btn-lg btn-block" onClick={this.fetchUsers}>
                                                    Fetch Users</button><br />
                                                <ReactTable
                                                    data={users} columns={columnsUser} filterable='true' defaultPageSize='20'
                                                />
                                            </div>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="addroute" title="Add route">
                                        <div class="card" style={myDivStyle} id="addroute">
                                            <div class="card-header">
                                                Add new route </div>
                                            <div class="card-body" >
                                                <AddRoute />
                                            </div>
                                        </div>
                                    </Tab>
                                    <Tab eventKey="updateroute" title="Update route">
                                        <div class="card" style={myDivStyle} id="updateroute">
                                            <div class="card-header">
                                                Update existing route </div>
                                            <div class="card-body" >
                                                <UpdateRoute />
                                            </div>
                                        </div>

                                    </Tab>
                                    <Tab eventKey="deleteroute" title="Delete route">
                                        <div class="card" style={myDivStyle} id="deleteroute">
                                            <div class="card-header">
                                                Delete existing route </div>
                                            <div class="card-body" >
                                                <DeleteRoute />
                                            </div>
                                        </div>

                                    </Tab>
                                </Tabs>
                                : <h4>You are not authorized to access this page</h4>}
                        </div>
                    </div>
                )}
            </AuthUserContext.Consumer>

        );
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(withFirebase(AdminPage));

//export default withFirebase(AdminPage);
