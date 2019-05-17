import React, { Component } from 'react';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';
import { AuthUserContext, withAuthorization } from '../Session';

import Table from 'react-bootstrap/Table';

const config = {
    admins: process.env.REACT_APP_ADMINS,
};

const INITIAL_STATE = {
    error: null,
    successMessageCancelBooking: '',
    selected_booking: '',
};

//Add route with pickup and destination locations
class CancelBooking extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bookings: [],
            pickup_date: '',
            route_capacity: '',
            selected_booking: '',
            email_id: '',
        };
    }

    componentDidMount() {
        //Fetch user details corresponding to the email id. Could not find a better way
        var email_id_loc = document.getElementById("email_field").value;
        this.setState({ email_id: email_id_loc });
    }

    componentWillUnmount() {
        this.props.firebase.bookings().off();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
        this.setState({ successMessageCancelBooking: '' });
        this.setState({ error: '' });
    }

    onCancelBooking = event => {
        const {
            selected_booking,
            error,
        } = this.state;

        var options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        };

        //Convert date into easy to read format
        var updation_date = new Intl.DateTimeFormat('en-US', options).format(Date.now());
        var booking_status = 'CANCELLED';
        console.log(updation_date, booking_status, selected_booking);
        //Update booking status to cancelled
        this.props.firebase.booking(selected_booking).update({ booking_status, updation_date }).then(() => {
            this.setState({ ...INITIAL_STATE });
            this.setState({ successMessageCancelBooking: <div class="alert alert-success alert-dismissible" role="alert">Selected booking is cancelled.</div> });
        }).catch(error => {
            this.setState({ error });
        });
    }

    // Fetch bookings for the specific date - input date format is like 03-May
    fetchBookings = () => {
        //Reset firebase connection to trigger search again even if input has not changed
        this.props.firebase.bookings().off();
        const login_email = this.state.email_id;

        this.props.firebase.db.ref("bookings").orderByChild("pickup_date").equalTo(this.state.pickup_date).on('value', snapshot => {
            const bookingsObject = snapshot.val();

            if (bookingsObject != null) {

                var bookingsList = Object.keys(bookingsObject).map(key => ({
                    ...bookingsObject[key],
                    uidbookingsid: key,
                }));

                //If user is not an admin, display only bookings made by self
                if (config.admins.toUpperCase().indexOf(this.state.email_id.toUpperCase()) === -1) {
                    var bookingsListLocal = bookingsList.filter(function(booking) {
                        return booking.email_id.toUpperCase() === login_email.toUpperCase()
                    });
                    bookingsList = bookingsListLocal;
                }

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

    //Render bookings in the table, along with a selection checkbox
    renderBookings = (booking, index) => {
        return (
            <tr key={index}>
                <td><input type="radio" name="selected_booking" value={booking.uidbookingsid} onChange={this.onChange} /></td>
                <td>{booking.username} -- {booking.route_trip} -- {booking.pickup_date} -- {booking.pickup_loc} -- {booking.drop_loc}</td>
                <td>{booking.booking_status}</td>
                <td>{booking.creation_date}</td>
            </tr>
        )
    }

    render() {

        const { bookings } = this.state;

        const {
            successMessageCancelBooking,
            selected_booking,
            error
        } = this.state;

        var isInvalidCancel = selected_booking === '';

        return (
            <AuthUserContext.Consumer>
                {authUser => (
                    <div class="form-group">
                        <div>
                            <div id="successMessageId">{successMessageCancelBooking}</div>
                            <p></p>
                        </div>
                        <div class="form-row">
                            <div class="col">
                                <label for="email_id">Email</label>
                            </div>
                            <div class="col">
                                <input type="text" name="email_id" readonly class="form-control-plaintext" id="email_field" value={authUser.email} />
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" name="pickup_date" onChange={this.onChange} placeholder="Pickup date like 03-May" aria-describedby="basic-addon2" />
                                <div class="input-group-append">
                                    <button class="btn btn-primary" type="button" onClick={this.fetchBookings} >Search bookings</button>
                                </div>
                            </div>
                        </div>
                        <p></p>
                        <Table striped condensed hover>
                            <thead>
                                <tr>
                                    <th>Select booking</th>
                                    <th>Booking details</th>
                                    <th>Booking Status</th>
                                    <th>Creation time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(this.renderBookings)}
                            </tbody>
                        </Table>
                        <div class="form-row">
                            <button disabled={isInvalidCancel} class="btn btn-warning btn-lg btn-block" onClick={this.onCancelBooking}>
                                Cancel booking
                            </button>
                        </div>
                        {error && <p>{error.message}</p>}
                    </div>
                )}</AuthUserContext.Consumer>
        )
    }
}

// Exporting the component 
export default withFirebase(CancelBooking);