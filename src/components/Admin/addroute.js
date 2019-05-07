import React, { Component } from 'react';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

const config = {
    admins: process.env.REACT_APP_ADMINS,
};

const INITIAL_STATE = {
    route_trip: '',
    pickup_locations: '',
    drop_locations: '',
    error: null,
    successMessageAddRoute: '',
};

//Add route with pickup and destination locations
class AddRoute extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            bookings: [],
            pickup_date: '',
            route_trip: '',
            pickup_locations: '',
            drop_locations: '',
        };
    }

    componentWillUnmount() {
        this.props.firebase.users().off();
        this.props.firebase.bookings().off();
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
        this.setState({ successMessageAddRoute: '' });
        this.setState({ error: '' });
    }

    onAddRoute = event => {
        const {
            route_trip,
            pickup_locations,
            drop_locations,
            error,
        } = this.state;

        var options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        };

        //Convert date into easy to read format
        var creation_date = new Intl.DateTimeFormat('en-US', options).format(Date.now());

        //Add booking record to database
        this.props.firebase.route(Date.now()).set({ route_trip, pickup_locations, drop_locations, creation_date, }).then(() => {
            this.setState({ ...INITIAL_STATE });
            this.setState({ successMessageAddRoute: <div class="alert alert-success alert-dismissible" role="alert">New route is added succesfully.</div> });
        }).catch(error => {
            this.setState({ error });
        });
    }

    render() {
        const {
            route_trip,
            pickup_locations,
            drop_locations,
            successMessageAddRoute,
            error
        } = this.state;

        var isInvalidAdd = route_trip === '' || pickup_locations === '' || drop_locations === '';

        return (<div class="form-group">
            <div>
                <div class="form-row">
                    <label for="route_trip">Route name</label>
                    <input
                        class="form-control"
                        name="route_trip"
                        value={route_trip}
                        onChange={this.onChange}
                        type="text"
                    />
                    <small id="route_trip_help" class="form-text text-muted">Sample format: 08:00 AM - Nallagandla to Hitec City</small>
                </div>

                <div class="form-row">
                    <label for="pickup_locations">Pickup locations</label>
                    <input
                        class="form-control"
                        name="pickup_locations"
                        value={pickup_locations}
                        onChange={this.onChange}
                        type="text"
                    />
                    <small id="pickup_loc_help" class="form-text text-muted">Maintain order of stops. Sample format: Deloitte Meenakshi towers, Mindspace Park Near Building 3, Mindspace building 12 C</small>
                </div>

                <div class="form-row">
                    <label for="drop_locations">Drop locations</label>
                    <input
                        class="form-control"
                        name="drop_locations"
                        value={drop_locations}
                        onChange={this.onChange}
                        type="text"
                    />
                    <small id="drop_loc_help" class="form-text text-muted">Maintain order of stope. Sample format: Manjeera Dimond Towers, Aparna Sarovar, Aparna Sarovar Grande</small>
                </div>

            </div>

            <p></p>
            <div id="successMessageId">{successMessageAddRoute}</div>
            <div class="form-row">
                <button disabled={isInvalidAdd} class="btn btn-success btn-lg btn-block" onClick={this.onAddRoute}>
                    Create route
                            </button>
            </div>
            {error && <p>{error.message}</p>}
        </div>
        )
    }
}

// Exporting the component 
export default withFirebase(AddRoute);