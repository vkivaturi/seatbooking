import React, { Component } from 'react';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';
import * as UTILS from '../../constants/utils';

const config = {
    admins: process.env.REACT_APP_ADMINS,
};

const INITIAL_STATE = {
    route_trip: '',
    pickup_locations: '',
    drop_locations: '',
    error: null,
    successMessageUpdateRoute: '',
    route_capacity: '',
    routesList: [],
    pickup_date: '',
    route_trip_list: [],
    route_trip_options: [],

};

//Perform modifications to an existing route. Update and delete are the allowed modifications
class UpdateRoute extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
    }

    componentWillUnmount() {
        this.props.firebase.routes().off();
    }

    componentDidMount() {
        //Load all routes and populate the options list with options
        this.loadRoutes();
    }

    loadRoutes() {
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
                this.setState({ route_trip_options: route_names });
            }
        });

    }

    onChange = event => {

        this.setState({ [event.target.name]: event.target.value });
        this.setState({ successMessageUpdateRoute: '', successMessageDeleteRoute: '', error: '' });

        if (event.target.name == 'route_trip_list') {
            //For the selected route trip, load the respective pickup and drop locations
            var routesListLocal = this.state.routesList;
            var pickup_loc_local, drop_loc_local, route_trip_local, routes_key_local, route_capacity_local, creation_date_local;

            //Fetch pickup and drop locations for the selected route
            Object.keys(routesListLocal).map(function(key) {
                console.log(routesListLocal[key]);
                if (routesListLocal[key].route_trip === event.target.value) {
                    pickup_loc_local = routesListLocal[key].pickup_locations;
                    drop_loc_local = routesListLocal[key].drop_locations;
                    route_trip_local = routesListLocal[key].route_trip;
                    routes_key_local = routesListLocal[key].routeid;
                    route_capacity_local = routesListLocal[key].route_capacity;
                    creation_date_local = routesListLocal[key].creation_date;
                }
            });
            //Display the pickup and drop locations in input boxes for modify or delete
            this.setState({ pickup_locations: pickup_loc_local, drop_locations: drop_loc_local, route_trip: route_trip_local, routes_key: routes_key_local, route_capacity: route_capacity_local, creation_date: creation_date_local });
        }
    }

    onUpdateRoute = event => {
        const {
            route_trip,
            pickup_locations,
            drop_locations,
            error,
            routes_key,
            route_capacity,
            creation_date
        } = this.state;

        var updatedDate = UTILS.formattedCurrentDate();
        console.log(route_trip + pickup_locations + drop_locations + creation_date + route_capacity + updatedDate);
        //Update the selected route
        this.props.firebase.route(routes_key).set({ route_trip, pickup_locations, drop_locations, creation_date, route_capacity, updatedDate }).then(() => {
            this.setState({ ...INITIAL_STATE });
            this.setState({ successMessageUpdateRoute: <div class="alert alert-success alert-dismissible" role="alert">Route is updated succesfully.</div> });
            this.loadRoutes();
        }).catch(error => {
            this.setState({ error });
        });
    }

    render() {
        const {
            route_trip_list,
            route_trip_options,
            route_trip,
            pickup_locations,
            drop_locations,
            successMessageUpdateRoute,
            successMessageDeleteRoute,
            error,
            route_capacity
        } = this.state;

        var isInvalidUpdate = route_trip === '' || pickup_locations === '' || drop_locations === '' || route_capacity === '';

        return (<div class="form-group">
            <div>
                <div id="successMessageId">{successMessageUpdateRoute}</div>
                <p></p>

                <div class="form-row">
                    <label for="route_trip_list">Select a route from below list</label>
                    <select id="route_trip_list" name="route_trip_list" class="form-control" onChange={this.onChange}>
                        <option></option>
                        {this.state.route_trip_options}
                    </select>
                </div>

                <div class="form-row">
                    <input type="text" name="route_trip" readonly class="form-control-plaintext" id="route_trip" value={this.state.route_trip} />
                </div>

                <div class="form-row">
                    <label for="route_capacity">Max number of seats</label>
                    <input
                        class="form-control"
                        name="route_capacity"
                        value={this.state.route_capacity}
                        onChange={this.onChange}
                        type="number"
                        min="0"
                        max="50"
                    />
                </div>

                <div class="form-row">
                    <label>Pickup location</label>
                    <input
                        class="form-control"
                        name="pickup_locations"
                        value={this.state.pickup_locations}
                        onChange={this.onChange}
                        type="text"
                        id="pickup_locations"
                        disabled={!!this.state.isRouteSelected}
                    />
                </div>
                <div class="form-row">
                    <label>Drop location</label>
                    <input
                        class="form-control"
                        name="drop_locations"
                        value={this.state.drop_locations}
                        onChange={this.onChange}
                        type="text"
                        id="drop_locations"
                        disabled={!!this.state.isRouteSelected}
                    />
                </div>
                <br />
                <div class="form-row">
                    <button disabled={isInvalidUpdate} class="btn btn-warning btn-lg btn-block" onClick={this.onUpdateRoute}>
                        Update route
                            </button>
                </div>
                <br />
                {error && <p>{error.message}</p>}
            </div>
        </div>
        )
    }
}

// Exporting the component 
export default withFirebase(UpdateRoute);