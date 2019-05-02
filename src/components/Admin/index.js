import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

import { withFirebase } from '../Firebase';

class AdminPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            users: [],
            bookings: []
        };
    }

    componentDidMount() {
        this.setState({ loading: true });

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

        this.props.firebase.bookings().on('value', snapshot => {
            const bookingsObject = snapshot.val();

            if (bookingsObject != null) {

                const bookingsList = Object.keys(bookingsObject).map(key => ({
                    ...bookingsObject[key],
                    uidbookingsid: key,
                }));

                this.setState({
                    bookings: bookingsList,
                });
            }
        });

        this.setState({
            loading: false,
        });

    }

    componentWillUnmount() {
        this.props.firebase.users().off();
        this.props.firebase.bookings().off();

    }

    render() {
        const { users, bookings, loading } = this.state;

        const columnsUser = [{
            Header: 'User id',
            accessor: 'uid' // String-based value accessors!
        }, {
            Header: 'Email',
            accessor: 'email',

        }, {
            Header: 'User name',
            accessor: 'username',

        }]

        const columnsBooking = [{
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

        }]

        return (

            <div>
                <h5>Seat bookings</h5>
                {loading && <div>Loading ...</div>}
                <ReactTable
                    data={bookings} columns={columnsBooking} filterable='true' defaultPageSize='10'
                />

                <h5>Registeres users</h5>
                {loading && <div>Loading ...</div>}
                <ReactTable
                    data={users} columns={columnsUser} filterable='true' defaultPageSize='10'
                />
            </div>
        );
    }
}

export default withFirebase(AdminPage);
