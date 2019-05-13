import React, { Component } from 'react';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

const config = {
    admins: process.env.REACT_APP_ADMINS,
};

const INITIAL_STATE = {
    route_trip: '',
    error: null,
    successMessageDeleteRoute: '',
    routesList: [],
    route_trip_list: [],
    route_trip_options: [],
    routesList: [],
};

//Delete selected route
class DeleteRoute extends Component {
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
        this.setState({ successMessageDeleteRoute: '', error: '' });

        //For the selected route trip, load the respective key
        var routesListLocal = this.state.routesList;
        var route_trip_local, routes_key_local;

        if (event.target.name == 'route_trip_list') {
            //Fetch pickup and drop locations for the selected route
            Object.keys(routesListLocal).map(function(key) {
                if (routesListLocal[key].route_trip === event.target.value) {
                    route_trip_local = routesListLocal[key].route_trip;
                    routes_key_local = routesListLocal[key].routeid;
                }
            });
        }
        //Display the pickup and drop locations in input boxes for modify or delete
        this.setState({ route_trip: route_trip_local, routes_key: routes_key_local });
    }

    //Delete route selected by the admin user
    onDeleteRoute = event => {
        var delete_key = this.state.routes_key;
        console.log("$$$ Deleting route :: " + delete_key + " :: " + this.state.route_trip);
        this.props.firebase.route(delete_key).remove().then(() => {
            this.setState({ ...INITIAL_STATE });
            this.setState({ successMessageDeleteRoute: <div class="alert alert-success alert-dismissible" role="alert">Selected route is deleted successfully.</div> });
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
            successMessageDeleteRoute,
            error
        } = this.state;

        var isInvalidDelete = route_trip === '';

        return (<div class="form-group">
            <div>
                <div id="successMessageId">{successMessageDeleteRoute}</div>
                <p></p>

                <div class="form-row">
                    <label for="route_trip_list">Select a route from below list</label>
                    <select id="route_trip_list" name="route_trip_list" class="form-control" onChange={this.onChange}>
                        <option></option>
                        {this.state.route_trip_options}
                    </select>
                </div>
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
export default withFirebase(DeleteRoute);