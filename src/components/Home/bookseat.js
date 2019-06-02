import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AuthUserContext, withAuthorization } from '../Session';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as Utils from '../../constants/utils';

const INITIAL_STATE = {
    email_id: '',
    password: '',
    route_trip: '',
    pickup_loc: '',
    drop_loc: '',
    authUser: '',
    error: null,
    successMessage: '',
    pickup_date: '',
    pickup_date_options: '',
    pickup_loc_options: '',
    drop_loc_options: '',
    isOtherPickup: "disabled",
    isOtherDrop: "disabled",
    otherPickup: '',
    otherDrop: '',
    trip_slot_options: [],
    routesList: [],
    route_capacity: '',
    route_seats_booked: 0,
    route_seats_creation_date: '',
    route_seats_seatid: '',
    route_seats_action: '',
};

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

const config = {
    admins: process.env.REACT_APP_ADMINS,
};

class BookSeatPage extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
    }

    componentDidMount() {
        //Fetch user details corresponding to the email id
        var email_id_loc = document.getElementById("email_field").value;
        this.props.firebase.db.ref("users").orderByChild("email").equalTo(email_id_loc).on('value', snapshot => {
            const usersObject = snapshot.val();
            if (usersObject !== null) {
                const usersList = Object.keys(usersObject).map(key => ({
                    ...usersObject[key],
                    uid: key,
                }));

                this.setState({
                    users_all: usersList,
                });
            } else {
                console.log("### No users info found for email id : " + email_id_loc);
            }
        });

        //Load preferences for the user. This will be a list with just one element
        var test = "~!@#$%^&*()_-+=[{]}\|;:,<.>/?";
        this.props.firebase.db.ref("preferences").orderByKey().equalTo(Utils.encodeEmailIdForFirebaseKey(email_id_loc)).on('value', snapshot => {
            const prefsObject = snapshot.val();
            if (prefsObject !== null) {
                const prefsList = Object.keys(prefsObject).map(key => ({
                    ...prefsObject[key],
                    prefid: key,
                }));
                this.setState({
                    preferences_all: prefsList,
                });
            } else {
                console.log("### No preference info found for email id : " + email_id_loc);
            }
        });

        //Load all routes when the page loads for the first time
        this.fetchRoutes();
    }

    componentWillUnmount() {
        this.props.firebase.bookings().off();
        this.props.firebase.users().off();
        this.props.firebase.seats().off();
    }

    //Submit is called when booking request button is clicked by user
    onSubmit = event => {
        const { name, authUser, route_trip, email_id, pickup_date } = this.state;
        var { pickup_loc, drop_loc } = this.state;
        var availabilityStatus = { isAvailable: false, message: '' };

        var pickup_loc = (this.state.otherPickup != '') ? this.state.otherPickup : pickup_loc;
        var drop_loc = (this.state.otherDrop != '') ? this.state.otherDrop : drop_loc;

        var options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        };

        //Convert date into easy to read format
        var creation_date = new Intl.DateTimeFormat('en-US', options).format(Date.now());
        var username = '';
        var phone = '';
        var booking_status = 'CONFIRMED';

        var userListNew = this.state.users_all;

        if (userListNew !== null) {
            Object.keys(userListNew).forEach(function(key) {
                if (userListNew[key].email == email_id) {
                    username = userListNew[key].username;
                    phone = userListNew[key].phone;
                }
            });
        } else {
            console.log("### Users list is empty for email id : " + email_id);
        }

        //Check if the selected route has seat availability
        availabilityStatus = this.checkAndUpdateAvailableSeats(pickup_date, route_trip, this.state.route_capacity);

        //Check based on isAvailable is failing again as we cannot trigger 2 sequential calls with Firebase
        //if (availabilityStatus.isAvailable) {
        if (this.state.route_seats_action === 'CREATE' || this.state.route_seats_action === 'UPDATE') {
            //Add booking record to database
            this.props.firebase.booking(Date.now()).set({ username, phone, pickup_date, route_trip, pickup_loc, drop_loc, creation_date, email_id, booking_status }).then(() => {
                //Do not send emails if the user is admin. Assumption is admins book requests only for testing purpose.
                if (config.admins.toUpperCase().indexOf(email_id.toUpperCase()) === -1) {
                    Utils.sendElasticEmail(route_trip, username, pickup_date, pickup_loc, drop_loc, email_id, 'CONFIRM_BOOKING');
                }
                this.setState({ ...INITIAL_STATE });
                this.props.history.push(ROUTES.HOME);
                this.setState({ successMessage: <div class="alert alert-success alert-dismissible" role="alert">Your booking is successful! You may check details in "My account" page</div> });
                //Load all routes again after a booking is created since the earlier fetched routes are reset on submit
                this.fetchRoutes();

            }).catch(error => {
                this.setState({ error });
            });

            var loc_pref = pickup_loc + "," + drop_loc;
            this.props.firebase.preference(Utils.encodeEmailIdForFirebaseKey(email_id)).update({ [route_trip]: loc_pref }).then(() => {
                //Do nothing on succesful update
            }).catch(error => {
                this.setState({ error });
            });

            //TO DO - Hack to reset the date drop down
            document.getElementById("pickup_date").selectedIndex = 0;
            document.getElementById("pickup_loc").selectedIndex = 0;
            document.getElementById("drop_loc").selectedIndex = 0;

        } else {
            //No seats are available    
            this.setState({ ...INITIAL_STATE });
            this.props.history.push(ROUTES.HOME);

            //TO DO - Hack to reset the date drop down
            document.getElementById("pickup_date").selectedIndex = 0;

            this.setState({ successMessage: availabilityStatus.message });
        }

        event.preventDefault();

    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });

        this.setState({
            email_id: document.getElementById("email_field").value
        });
        this.setState({ successMessage: '' });

        //Overloading this event since there is no other way to load firebase data for seat checking availability. 
        //It is not possible to load seat availability data and perform checks on submit due to asynchronous nature of firebase API calls
        if (event.target.name === 'pickup_date') {
            this.decideActionOnAvailability(event.target.value, this.state.route_trip, this.state.route_capacity);
        }

        //Fetch pickup and drop locations if route trip is changed
        if (event.target.name === 'route_trip') {
            this.fetchRouteDetails(event.target.value);
        }

        //Manage the manual edit of pickup and drop options
        if (event.target.name === 'pickup_loc') {

            if (event.target.value === '==Other pickup location==') {
                this.setState({ isOtherPickup: "" });
            } else {
                this.setState({ isOtherPickup: "disabled" });
                this.setState({ otherPickup: '' });
            }
        }

        if (event.target.name === 'drop_loc') {
            if (event.target.value === '==Other drop location==') {
                this.setState({ isOtherDrop: "" });
            } else {
                this.setState({ isOtherDrop: "disabled" });
                this.setState({ otherDrop: '' });
            }
        }

    };

    fetchRoutes = () => {
        //Load all routes and populate the options list with options
        this.props.firebase.routes().on('value', snapshot => {
            const routesObject = snapshot.val();
            if (routesObject != null) {
                const routesListLocal = Object.keys(routesObject).map(key => ({
                    ...routesObject[key],
                    routeid: key,
                }));
                this.setState({ routesList: routesListLocal });

                //Fetch route names from the list
                var route_names = Object.keys(routesListLocal).map(function(key) {
                    return <option>{routesListLocal[key].route_trip}</option>
                });
                //Assign route names to the dropdown box
                this.setState({ trip_slot_options: route_names });
            }
        });
    }

    fetchRouteDetails = (selectedRoute) => {
        //Fetch pickup and drop locations for the selected
        var routesListLocal = this.state.routesList;
        var pickup_loc_local, drop_loc_local, route_capacity_local, pickup_date_local;

        // Reset pickup and drop list boxes
        this.setState({ pickup_loc_options: ' ' });
        this.setState({ drop_loc_options: ' ' });
        this.setState({ pickup_date_options: ' ' });

        Object.keys(routesListLocal).map(function(key) {
            if (routesListLocal[key].route_trip === selectedRoute) {
                pickup_loc_local = routesListLocal[key].pickup_locations;
                drop_loc_local = routesListLocal[key].drop_locations;
                route_capacity_local = routesListLocal[key].route_capacity;
                pickup_date_local = routesListLocal[key].pickup_dates;
            }
        });

        //Ensure the selected route as valid pickup dates configured. Otherwise return an error message
        if (typeof pickup_date_local !== 'undefined') {
            //Split all comman separated strings into lists of pickup dates, pickup locations and drop locations
            var pickup_date_temp = pickup_date_local.split(',');
            var pickup_date_temp_options = Object.keys(pickup_date_temp).map(function(key) {
                return <option>{pickup_date_temp[key]}</option>
            });

            //Check if the user has any preferred locations based on past booking
            var prefLocs = Utils.fetchPreferredLocationsForRoute(this.state.preferences_all, selectedRoute);
            var selectedPickup = false, selectedDrop = false;

            var location1 = pickup_loc_local.split(',');
            var location1_options = Object.keys(location1).map(function(key) {
                if (location1[key] === prefLocs.pickup_loc) {
                    selectedPickup = true;
                    return <option selected>{location1[key]}</option>
                } else {
                    return <option>{location1[key]}</option>
                }
            });

            var location2 = drop_loc_local.split(',');
            var location2_options = Object.keys(location2).map(function(key) {
                if (location2[key] === prefLocs.drop_loc) {
                    selectedDrop = true;
                    return <option selected>{location2[key]}</option>
                } else {
                    return <option>{location2[key]}</option>
                }
            });

            //Set all route details back to State variables so that the UI is refreshed again with new values
            this.setState({ pickup_loc_options: location1_options });
            this.setState({ drop_loc_options: location2_options });
            this.setState({ route_capacity: route_capacity_local });
            this.setState({ pickup_date_options: pickup_date_temp_options });

            // Set pickup and drop locations only if the user has preferences set and are currently valid
            if (selectedPickup) this.setState({ pickup_loc: prefLocs.pickup_loc });
            if (selectedDrop) this.setState({ drop_loc: prefLocs.drop_loc });
        } else {
            this.setState({ successMessage: <div class="alert alert-warning alert-dismissible" role="alert">There are no pickup dates for the selected trip. Please select another trip.</div> });
        }
    }

    //This functions decides how to track seat availability for the specific date and route
    decideActionOnAvailability = (pickup_date, route_trip, route_capacity) => {
        //Fetch all routes for the given date and set the action flag based on date+route+seats situation

        var route_seats_booked_local, route_seats_creation_date_local, route_seats_seatid_local, route_seats_action_local;

        this.props.firebase.db.ref("seats").orderByChild("pickup_date").equalTo(pickup_date).on('value', snapshot => {
            const seatsObject = snapshot.val();
            if (seatsObject !== null) {
                const seatsRouteList = Object.keys(seatsObject).map(key => ({
                    ...seatsObject[key],
                    seatid: key,
                }));

                Object.keys(seatsRouteList).map(function(key) {
                    if (seatsRouteList[key].route_trip === route_trip) {
                        if (seatsRouteList[key].booked_seats < route_capacity) {
                            route_seats_booked_local = seatsRouteList[key].booked_seats + 1;
                            route_seats_creation_date_local = seatsRouteList[key].creation_date;
                            route_seats_seatid_local = seatsRouteList[key].seatid;

                            route_seats_action_local = 'UPDATE';
                        } else {
                            route_seats_action_local = 'REJECT';
                        }
                    } else {
                        route_seats_action_local = 'CREATE';
                    }
                });
            } else {
                route_seats_action_local = 'CREATE';
            }

            //Set the state variable so that data can be accessed during submit
            this.setState({
                route_seats_booked: route_seats_booked_local,
                route_seats_creation_date: route_seats_creation_date_local,
                route_seats_seatid: route_seats_seatid_local,
                route_seats_action: route_seats_action_local,
            });

        });
    }

    checkAndUpdateAvailableSeats = (pickup_date, route_trip, route_capacity) => {
        //TO DO - Availability status is currently not used. actionNeeded field is utilized during submit stage.
        var actionNeeded = this.state.route_seats_action;
        var availabilityStatus = { isAvailable: false, message: '' };

        if (actionNeeded === 'CREATE') {
            //Set the booked seats value to 1
            var creation_date = Utils.formattedCurrentDate();
            var update_date = creation_date;
            var booked_seats = 1;

            console.log("## First date and route : " + pickup_date, route_trip, booked_seats, creation_date, update_date);
            this.props.firebase.seat(Date.now()).set({ pickup_date, route_trip, booked_seats, creation_date, update_date }).then(() => {

                availabilityStatus.isAvailable = true;
                availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-success alert-dismissible" role="alert">Seats are available in this route. Please go ahead and book now!!</div></small>;

            }).catch(error => {
                availabilityStatus.isAvailable = false;
                availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-warning alert-dismissible" role="alert">Error fetching seat availability details. You may still be able to book</div></small>;
            });
        } else if (actionNeeded === 'UPDATE') {
            var update_date = Utils.formattedCurrentDate();

            //Move state variable to local as database insert needs correct field names
            var seatid = this.state.route_seats_seatid;
            var creation_date = this.state.route_seats_creation_date;
            var booked_seats = this.state.route_seats_booked;

            this.props.firebase.seat(seatid).set({ pickup_date, route_trip, creation_date, booked_seats, update_date }).then(() => {
                availabilityStatus.isAvailable = true;
            }).catch(error => {
                availabilityStatus.isAvailable = false;
                availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-warning alert-dismissible" role="alert">Error fetching seat availability details. You may still be able to book</div></small>;
            });

        } else if (actionNeeded === 'REJECT') {
            availabilityStatus.isAvailable = false;
            //Currently, only reject message is displayed on UI
            availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-danger alert-dismissible" role="alert">We are sorry, all seats are booked on the route {route_trip} for the {pickup_date}. Kindly contact support team in case you need further assistance</div></small>;
        } else {
            console.log("## Something went wrong in identifying the action needed on available seats : " + pickup_date + " " + route_trip);
        }

        return availabilityStatus;
    }

    render() {
        const { email_id, password, error, route_trip, pickup_loc, drop_loc, successMessage, pickup_date } = this.state;

        const isInvalid = pickup_date === '' || route_trip === '' || pickup_loc === '' || drop_loc === '';

        return (

            <AuthUserContext.Consumer>
                {authUser => (

                    <div class="card" style={myDivStyle}>
                        <div id="successMessageId">{successMessage}</div>
                        <div class="card-body" >
                            <form onSubmit={this.onSubmit}>
                                <div class="form-group">
                                    <div class="form-row">
                                        <div class="col">
                                            <label for="email_id">Email</label>
                                        </div>
                                        <div class="col">
                                            <input type="text" name="email_id" readonly class="form-control-plaintext" id="email_field" value={authUser.email} />
                                        </div>
                                    </div>

                                    <label for="route_trip">Select your trip</label>
                                    <select id="route_trip" name="route_trip" class="form-control" onChange={this.onChange}>
                                        <option></option>
                                        {this.state.trip_slot_options}

                                    </select>

                                    <div>
                                        <label for="pickup_date">Pickup date</label>
                                        <select id="pickup_date" name="pickup_date" class="form-control" onChange={this.onChange}>
                                            <option></option>
                                            {this.state.pickup_date_options}
                                        </select>
                                    </div>

                                    <label for="pickup_loc">Pickup location</label>
                                    <select id="pickup_loc" name="pickup_loc" class="form-control" onChange={this.onChange}>
                                        <option></option>
                                        {this.state.pickup_loc_options}
                                        <option>==Other pickup location==</option>
                                    </select>

                                    <label>Other pickup location</label>
                                    <input
                                        class="form-control"
                                        name="otherPickup"
                                        value={this.state.otherPickup}
                                        onChange={this.onChange}
                                        type="text"
                                        id="otherPickup"
                                        disabled={this.state.isOtherPickup}
                                    />

                                    <label for="drop_loc">Drop location</label>
                                    <select id="drop_loc" name="drop_loc" class="form-control" onChange={this.onChange}>
                                        <option></option>
                                        {this.state.drop_loc_options}
                                        <option>==Other drop location==</option>
                                    </select>

                                    <label>Other drop location</label>
                                    <input
                                        class="form-control"
                                        name="otherDrop"
                                        value={this.state.otherDrop}
                                        onChange={this.onChange}
                                        type="text"
                                        id="otherDrop"
                                        disabled={this.state.isOtherDrop}
                                    />

                                </div>
                                <p></p>
                                <div class="form-row">
                                    <button disabled={isInvalid} class="btn btn-primary btn-lg btn-block" type="submit">
                                        Book my seat</button>
                                </div>
                                {error && <p>{error.message}</p>}

                            </form>
                        </div>
                    </div>
                )}
            </AuthUserContext.Consumer>);
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(BookSeatPage);
