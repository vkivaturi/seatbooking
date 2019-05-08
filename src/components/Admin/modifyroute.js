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
    pickup_loc: '',
    drop_loc: '',
    routesList: []
};

//Perform modifications to an existing route. Update and delete are the allowed modifications
class ModifyRoute extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pickup_date: '',
            route_trip_list: [],
            route_trip: '',
            pickup_loc: '',
            drop_loc: '',
            route_trip_options: [],
            routesList: [],
        };
    }

    componentWillUnmount() {
        this.props.firebase.routes().off();
    }

    componentDidMount() {
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
                this.setState({ route_trip_options: route_names });
            }
        });
    }

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
        this.setState({ successMessageUpdateRoute: '', successMessageDeleteRoute: '', error: '' });

        //For the selected route trip, load the respective pickup and drop locations
        var routesListLocal = this.state.routesList;
        var pickup_loc_local, drop_loc_local, route_trip_local, routes_key_local;

        if (event.target.name == 'route_trip_list') {
            //Fetch pickup and drop locations for the selected route
            Object.keys(routesListLocal).map(function(key) {
                console.log("inside for :: " + routesListLocal[key].route_trip + " ::" + event.target.value);
                if (routesListLocal[key].route_trip === event.target.value) {
                    pickup_loc_local = routesListLocal[key].pickup_locations;
                    drop_loc_local = routesListLocal[key].drop_locations;
                    route_trip_local = routesListLocal[key].route_trip;
                    routes_key_local = routesListLocal[key].routeid;
                }
            });
        }
        //Display the pickup and drop locations in input boxes for modify or delete
        this.setState({ pickup_loc: pickup_loc_local, drop_loc: drop_loc_local, route_trip: route_trip_local, routes_key: routes_key_local });
        console.log("route_trip_local :: " + route_trip_local);

    }

    //Delete route selected by the admin user
    onDeleteRoute = event => {
        var delete_key = this.state.routes_key;
        console.log("$$$ Deleting route :: " + delete_key + " :: " + this.state.route_trip);
        this.props.firebase.route(delete_key).remove().then(() => {
            this.setState({ ...INITIAL_STATE });
            this.setState({ successMessageDeleteRoute: <div class="alert alert-success alert-dismissible" role="alert">Selected route is deleted successfully.</div> });
        }).catch(error => {
            this.setState({ error });
        });
    }

    onUpdateRoute = event => {
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
            route_trip_list,
            route_trip_options,
            route_trip,
            pickup_loc,
            drop_loc,
            successMessageUpdateRoute,
            successMessageDeleteRoute,
            error
        } = this.state;

        var isInvalidDelete = route_trip === '';
        var isInvalidUpdate = route_trip === '' || pickup_loc === '' || drop_loc === '';

        return (<div class="form-group">
            <div>
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
                    <label>Pickup location</label>
                    <input
                        class="form-control"
                        name="pickup_loc"
                        value={this.state.pickup_loc}
                        onChange={this.onChange}
                        type="text"
                        id="pickup_loc"
                        disabled={!!this.state.isRouteSelected}
                    />
                </div>
                <div class="form-row">
                    <label>Drop location</label>
                    <input
                        class="form-control"
                        name="drop_loc"
                        value={this.state.drop_loc}
                        onChange={this.onChange}
                        type="text"
                        id="drop_loc"
                        disabled={!!this.state.isRouteSelected}
                    />
                </div>
                <br />
                <div id="successMessageId">{successMessageDeleteRoute}</div>
                <br />
                <div class="form-row">
                    <button disabled={isInvalidDelete} class="btn btn-danger btn-lg btn-block" onClick={this.onDeleteRoute}>
                        Delete route
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
export default withFirebase(ModifyRoute);