import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { withFirebase } from '../Firebase';

import { AuthUserContext } from '../Session';
//import { PasswordForgetForm } from '../PasswordForget';
//import PasswordChangeForm from '../PasswordChange';
import { withAuthorization } from '../Session';

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

class AccountPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            bookings: []
        };
    }

    componentDidMount() {
        this.setState({ loading: true });

        var email_id_loc = document.getElementById("email_field").value;

        this.props.firebase.db.ref("bookings").orderByChild("email_id").equalTo(email_id_loc).on('value', snapshot => {
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
        this.props.firebase.bookings().off();
    }

    render() {
        const { bookings, loading } = this.state;

        const columnsBooking = [{
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
            <AuthUserContext.Consumer>
                {authUser => (
                    <div class="card" style={myDivStyle}>
                        <input type="text" name="email_id" readonly class="form-control-plaintext" id="email_field" value={authUser.email} />

                        <h5>My bookings</h5>
                        {loading && <div>Loading ...</div>}
                        <ReactTable
                            data={bookings} columns={columnsBooking} filterable='true' defaultPageSize='5'
                        />

                    </div>
                )}</AuthUserContext.Consumer>
        );
    }
}

const authCondition = authUser => !!authUser;

export default withAuthorization(authCondition)(AccountPage);
