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
    successMessageRiderChange: '',
    selected_booking: '',
    rider_phone: '',
    rider_username: '',
    bookings: [],
    isBookingSelected: false,
};

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

//Add route with pickup and destination locations
class ChangeRider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bookings: [],
            pickup_date: '',
            route_capacity: '',
            selected_booking: '',
            email_id: '',
            rider_phone: '',
            rider_username: '',
            isBookingSelected: false,
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
        this.setState({ successMessageRiderChange: '' });
        this.setState({ error: '' });

        //If a different booking is selected, update the input field for phone and username
        if (event.target.name === 'selected_booking') {

            this.setState({ isBookingSelected: true });

            const { bookings } = this.state;

            for (var i = 0; i < bookings.length; i++) {
                if (bookings[i].uidbookingsid === event.target.value) {
                    this.setState({ rider_username: bookings[i].username });
                    this.setState({ rider_phone: bookings[i].phone });
                }
            }
        }
    }

    onChangeRider = event => {
        const {
            selected_booking,
            error,
            rider_username,
            rider_phone,
        } = this.state;

        var options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        };

        //Convert date into easy to read format
        var updation_date = new Intl.DateTimeFormat('en-US', options).format(Date.now());

        var username = rider_username;
        var phone = rider_phone;

        //Update rider details in the database
        this.props.firebase.booking(selected_booking).update({ username, phone, updation_date }).then(() => {
            this.setState({ ...INITIAL_STATE });
            this.setState({ successMessageRiderChange: <div class="alert alert-success alert-dismissible" role="alert">Rider details are changed successfully for the selected booking.</div> });
        }).catch(error => {
            this.setState({ error });
        });
    }

    // Fetch bookings for the specific date - input date format is like 03-May
    fetchBookings = () => {
        //Reset firebase connection to trigger search again even if input has not changed
        this.props.firebase.bookings().off();
        const login_email = this.state.email_id;

        //Reset rider name, rider phone
        this.setState({rider_phone: '', rider_username: '', isBookingSelected: false, successMessageRiderChange: ''});

        this.props.firebase.db.ref("bookings").orderByChild("pickup_date").equalTo(this.state.pickup_date).on('value', snapshot => {
            const bookingsObject = snapshot.val();

            if (bookingsObject != null) {

                var bookingsList = Object.keys(bookingsObject).map(key => ({
                    ...bookingsObject[key],
                    uidbookingsid: key,
                }));

                var bookingsListUserFilter = bookingsList;
                var bookingsListStatusFilter = bookingsList;

                //If user is not an admin, display only bookings made by self
                if (config.admins.toUpperCase().indexOf(this.state.email_id.toUpperCase()) === -1) {
                    bookingsListUserFilter = bookingsList.filter(function(booking) {
                        return booking.email_id.toUpperCase() === login_email.toUpperCase()
                    });
                }

                bookingsListStatusFilter = bookingsListUserFilter.filter(function(booking) {
                    return booking.booking_status === 'CONFIRMED'
                });

                bookingsList = bookingsListStatusFilter;

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
                <td>{booking.username}</td>
                <td>{booking.phone}</td>
                <td>{booking.pickup_date} --> {booking.route_trip} --> {booking.pickup_loc} --> {booking.drop_loc}</td>
            </tr>
        )
    }

    render() {

        const { bookings } = this.state;

        const {
            successMessageRiderChange,
            selected_booking,
            error,
            rider_phone,
            rider_username
        } = this.state;

        var isInvalidRider = rider_phone === '' || rider_username === '';

        return (
            <AuthUserContext.Consumer>
                {authUser => (
                    <div class="card" style={myDivStyle}>
                        <div id="successMessageId">{successMessageRiderChange}</div>

                        <div class="card-body" >
                            <p>In this page, you can select change rider details of a booking with CONFIRMED status.</p>
                            <div class="form-group">
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
                                            <th>Select</th>
                                            <th>Rider name</th>
                                            <th>Phone number</th>
                                            <th>Booking details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(this.renderBookings)}
                                    </tbody>
                                </Table>

                                <div class="form-row">
                                    <label>Rider name</label>
                                    <input
                                        class="form-control"
                                        name="rider_username"
                                        value={this.state.rider_username}
                                        onChange={this.onChange}
                                        type="text"
                                        id="rider_name"
                                        disabled={!this.state.isBookingSelected}
                                    />
                                </div>

                                <div class="form-row">
                                    <label>Rider phone number</label>
                                    <input
                                        class="form-control"
                                        name="rider_phone"
                                        value={this.state.rider_phone}
                                        onChange={this.onChange}
                                        type="text"
                                        id="rider_phone"
                                        disabled={!this.state.isBookingSelected}
                                    />
                                </div>
                                <p></p>
                                <div class="form-row">
                                    <button disabled={isInvalidRider} class="btn btn-primary btn-lg btn-block" onClick={this.onChangeRider}>
                                        Change rider
                            </button>
                                </div>
                                {error && <p>{error.message}</p>}
                            </div>
                        </div>
                    </div>
                )}</AuthUserContext.Consumer>
        )
    }
}

// Exporting the component 
export default withFirebase(ChangeRider);