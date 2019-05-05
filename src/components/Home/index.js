import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AuthUserContext, withAuthorization } from '../Session';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import * as UTILS from '../../constants/utils';

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

};

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
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
        console.log("sending email " + email_id);
        //UTILS.sendElasticEmail(route_trip, username, pickup_date, pickup_loc, drop_loc, email_id);

        //Add booking record to database
        this.props.firebase.booking(Date.now()).set({ username, phone, pickup_date, route_trip, pickup_loc, drop_loc, creation_date, email_id }).then(() => {
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

        // TO DO - This is a hack. Unable to find any other way to capture email id or reset success message
        this.setState({
            email_id: document.getElementById("email_field").value
        });
        this.setState({ successMessage: '' });

        // If trip is changed, set the pickup and drop lists accordingly

        // TO DO - Ugly code. Need to be optimized

        //Location list 1 
        var location1 = ['Manjeera Dimond Towers', 'Aparna Sarovar', 'Aparna Sarovar Grande', 'Hima Sai Lake View Towers', 'Aparna Cyberlife', 'Sai Raghavendra Magnificient Habitat', 'Aparna Cyber Commune', 'Aparna Cyber Zon'];
        var location1_options = Object.keys(location1).map(function(key) {
            return <option>{location1[key]}</option>
        });

        //Locaton list 2
        var location2 = ['Deloitte Meenakshi towers', 'Mindspace Park Near Building 3', 'Mindspace building 12 C', 'Salarpuria Knowledge City Gate', 'Lemon Tree', 'Cyber Gateway', 'Shilparamam', 'Salarpuria Cyber Park, Oracle New Campus'];
        var location2_options = Object.keys(location2).map(function(key) {
            return <option>{location2[key]}</option>
        });

        if (event.target.name == 'route_trip') {
            // Reset pickup and drop list boxes
            this.setState({ pickup_loc_options: ' ' });
            this.setState({ drop_loc_options: ' ' });

            if (event.target.value.includes(" AM ")) {
                this.setState({ pickup_loc_options: location1_options });
                this.setState({ drop_loc_options: location2_options });
            };

            if (event.target.value.includes(" PM ")) {
                this.setState({ pickup_loc_options: location2_options.reverse() });
                this.setState({ drop_loc_options: location1_options.reverse() });
            }
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

    render() {
        const { email_id, password, error, route_trip, pickup_loc, drop_loc, successMessage, pickup_date } = this.state;

        const isInvalid = pickup_date === '' || route_trip === '' || pickup_loc === '' || drop_loc === '';

        //Load trip time options
        var route_trip_list = ['06-May', '07-May', '08-May', '09-May', '10-May'];

        var route_trip_options = Object.keys(route_trip_list).map(function(key) {
            return <option>{route_trip_list[key]}</option>
        });

        //Load trip slots
        var trip_slot_list = ['08:00 AM - Nallagandla to Hitec City', '10:15 AM - Nallagandla to Hitec City', '05:30 PM - Hitec City to Nallagandla', '07:30 PM - Hitec City to Nallagandla'];
        var trip_slot_options = Object.keys(trip_slot_list).map(function(key) {
            return <option>{trip_slot_list[key]}</option>
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
                                        {trip_slot_options}

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
