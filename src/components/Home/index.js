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
    pickup_loc_options: '',
    drop_loc_options: '',
    isOtherPickup: "disabled",
    isOtherDrop: "disabled",
    otherPickup: '',
    otherDrop: '',
    trip_slot_options: [],
    routesList: [],

};

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

const config = {
    admins: process.env.REACT_APP_ADMINS,
};

class HomePage extends Component {
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

        //Load all routes
        this.fetchRoutes();
    }

    componentWillUnmount() {
        this.props.firebase.bookings().off();
        this.props.firebase.users().off();
    }

    onSubmit = event => {
        const { name, authUser, route_trip, email_id, pickup_date } = this.state;
        var { pickup_loc, drop_loc } = this.state;

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

        //Add booking record to database
        this.props.firebase.booking(Date.now()).set({ username, phone, pickup_date, route_trip, pickup_loc, drop_loc, creation_date, email_id }).then(() => {
            //Do not send emails if the user is admin. Assumption is admins book requests only for testing purpose.
            if (config.admins.toUpperCase().indexOf(email_id.toUpperCase()) === -1) {
                Utils.sendElasticEmail(route_trip, username, pickup_date, pickup_loc, drop_loc, email_id);
            }
            this.setState({ ...INITIAL_STATE });
            this.props.history.push(ROUTES.HOME);
            this.setState({ successMessage: <div class="alert alert-success alert-dismissible" role="alert">Your booking is successful! You may check details in "My account" page</div> });
        }).catch(error => {
            this.setState({ error });
        });

        event.preventDefault();

    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });


        this.setState({
            email_id: document.getElementById("email_field").value
        });
        this.setState({ successMessage: '' });

        //Fetch pickup and drop locations if route trip is changed
        if (event.target.name == 'route_trip') {
            this.fetchLocations(event.target.value);
        }

        //Manage the manual edit of pickup and drop options
        if (event.target.name == 'pickup_loc') {
            if (event.target.value == '==Other pickup location==') {
                this.setState({ isOtherPickup: "" });
            } else {
                this.setState({ isOtherPickup: "disabled" });
                this.setState({ otherPickup: '' });
            }
        }

        if (event.target.name == 'drop_loc') {
            if (event.target.value == '==Other drop location==') {
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

    fetchLocations = (selectedRoute) => {
        //Fetch pickup and drop locations for the selected
        var routesListLocal = this.state.routesList;
        var pickup_loc_local, drop_loc_local;
        
        // Reset pickup and drop list boxes
        this.setState({ pickup_loc_options: ' ' });
        this.setState({ drop_loc_options: ' ' });

        Object.keys(routesListLocal).map(function(key) {
            if (routesListLocal[key].route_trip === selectedRoute) {
                console.log("inside 2 ");
                pickup_loc_local = routesListLocal[key].pickup_locations;
                drop_loc_local = routesListLocal[key].drop_locations;
            }
        });

        var location1 = pickup_loc_local.split(',');
        var location1_options = Object.keys(location1).map(function(key) {
            return <option>{location1[key]}</option>
        });

        var location2 = drop_loc_local.split(',');
        var location2_options = Object.keys(location2).map(function(key) {
            return <option>{location2[key]}</option>
        });

        this.setState({ pickup_loc_options: location1_options });
        this.setState({ drop_loc_options: location2_options });
    }


    render() {
        const { email_id, password, error, route_trip, pickup_loc, drop_loc, successMessage, pickup_date } = this.state;

        const isInvalid = pickup_date === '' || route_trip === '' || pickup_loc === '' || drop_loc === '';

        //Load trip time options
        var route_trip_list = ['06-May', '07-May', '08-May', '09-May', '10-May'];

        var route_trip_options = Object.keys(route_trip_list).map(function(key) {
            return <option>{route_trip_list[key]}</option>
        });

        return (

            <AuthUserContext.Consumer>
                {authUser => (

                    <div class="card" style={myDivStyle}>
                        <div id="successMessageId">{successMessage}</div>
                        <div class="card-header">
                            Book my seat </div>

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

                                    <div>
                                        <label for="pickup_date">Pickup date</label>
                                        <select id="pickup_date" name="pickup_date" class="form-control" onChange={this.onChange}>
                                            <option></option>
                                            {route_trip_options}
                                        </select>
                                    </div>

                                    <label for="route_trip">Select your trip</label>
                                    <select id="route_trip" name="route_trip" class="form-control" onChange={this.onChange}>
                                        <option></option>
                                        {this.state.trip_slot_options}

                                    </select>

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

export default withAuthorization(condition)(HomePage);
