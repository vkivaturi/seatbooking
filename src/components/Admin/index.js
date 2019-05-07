import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { AuthUserContext, withAuthorization } from '../Session';
import AddRoute from './addroute.js';
import ModifyRoute from './modifyroute.js';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const config = {
    admins: process.env.REACT_APP_ADMINS,
};

const INITIAL_STATE = {
    route_trip: '',
    pickup_loc: '',
    drop_loc: '',
    error: null,
    successMessageAddRoute: '',
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
            Header: 'Booking time',
            accessor: 'creation_date',

        }];

        const {
            route_trip,
            pickup_loc,
            drop_loc,
            successMessageAddRoute
        } = this.state;

        var isInvalidAdd = route_trip === '' || pickup_loc === '' || drop_loc === '';

        return (

            <div>
                <div><AddRoute /></div>
                <div><ModifyRoute /></div>

                <h5>Seat bookings</h5>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" name="pickup_date" onChange={this.onChange} placeholder="Pickup date like 03-May" aria-describedby="basic-addon2" />
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="button" onClick={this.fetchBookings} >Search bookings</button>
                    </div>
                </div>

                <ReactTable
                    data={bookings} columns={columnsBooking} filterable='true' defaultPageSize='20'
                />

                <hr />


                <hr />
                <h5>Registeres users</h5>
                <button class="btn btn-primary btn-lg btn-block" onClick={this.fetchUsers}>
                    Fetch Users</button>
                <ReactTable
                    data={users} columns={columnsUser} filterable='true' defaultPageSize='20'
                />
            </div>
        );
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AdminPage);

//export default withFirebase(AdminPage);
