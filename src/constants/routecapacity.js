// var withFirebase = require('../components/Firebase');
// var UTILS =require('./utils');
// var React = require('react');

import React, { Component } from 'react';
import { withFirebase } from '../components/Firebase';
import * as UTILS from './utils';

class RouteCapacityHandler extends Component{
    testFunc = () => {
        console("inside test func");
    }

}

// module.exports = {
//     formattedCurrentDate: function() {
//         var options = {
//             year: 'numeric', month: 'numeric', day: 'numeric',
//             hour: 'numeric', minute: 'numeric', second: 'numeric',
//             hour12: false
//         };

//         //Convert date into easy to read format
//         return new Intl.DateTimeFormat('en-US', options).format(Date.now());

//     },
//     //User confirmed booking, hence go ahead and reduce capacity. Send a warning if no availability
//     checkAndUpdateAvailableSeats: function(pickup_date, route_trip, route_capacity) {
//         var availabilityStatus = [];
//         //Fetch all routes for the given date
//         this.props.firebase.db.ref("seats").orderByChild("pickup_date").equalTo(pickup_date).on('value', snapshot => {
//             const seatsObject = snapshot.val();
//             if (seatsObject !== null) {
//                 const seatsRouteList = Object.keys(seatsObject).map(key => ({
//                     ...seatsObject[key],
//                     uid: key,
//                 }));

//         //         //Fetch the route trip on interest from the seats seats list
//         //         console.log("## Fetch the route trip on interest from the seats seats list");
//         //         //Check if the available seats is > 0
//         //         console.log("Check if the available seats is > 0");
//         //         availabilityStatus.isAvailable = true;
//         //         availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-success alert-dismissible" role="alert">Seats are available in this route. Please go ahead and book now!!</div></small>;

//             } else {
//         //         //Avaliable seats is set to capacity since this is the first time this date and route combination is called
//         //         var available_seats = route_capacity - 1;
//         //         var creation_date = UTILS.formattedCurrentDate();
//         //         console.log(pickup_date, route_trip, available_seats, creation_date);
//         //         //                this.props.firebase.seat(Date.now()).set({ pickup_date, route_trip, available_seats, creation_date }).then(() => {

//         //         availabilityStatus.isAvailable = true;
//         //         availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-success alert-dismissible" role="alert">Seats are available in this route. Please go ahead and book now!!</div></small>;

//         //         //                }).catch(error => {
//         //         //                    availabilityStatus.isAvailable = true;
//         //         //                    availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-warning alert-dismissible" role="alert">Error fetching seat availability details. You may still be able to book</div></small>;
//         //         //                });

//             }
//         });
//         // return availabilityStatus;
//     }
// }

export default RouteCapacityHandler;


// module.exports = {
//     //Check available seats, without confirming
//     testfunc: function() {

//     },
//     checkAvailableSeats: function(pickup_date, route_trip, route_capacity) {

//     },
//     //User confirmed booking, hence go ahead and reduce capacity. Send a warning if no availability
//     checkAndUpdateAvailableSeats: function(pickup_date, route_trip, route_capacity) {
//         var availabilityStatus = [];
//         //Fetch all routes for the given date
//         this.props.firebase.db.ref("seats").orderByChild("pickup_date").equalTo(pickup_date).on('value', snapshot => {
//             const seatsObject = snapshot.val();
//             if (seatsObject !== null) {
//                 const seatsRouteList = Object.keys(seatsObject).map(key => ({
//                     ...seatsObject[key],
//                     uid: key,
//                 }));

//                 //Fetch the route trip on interest from the seats seats list
//                 console.log("## Fetch the route trip on interest from the seats seats list");
//                 //Check if the available seats is > 0
//                 console.log("Check if the available seats is > 0");
//                 availabilityStatus.isAvailable = true;
//                 availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-success alert-dismissible" role="alert">Seats are available in this route. Please go ahead and book now!!</div></small>;

//             } else {
//                 //Avaliable seats is set to capacity since this is the first time this date and route combination is called
//                 var available_seats = route_capacity - 1;
//                 var creation_date = UTILS.formattedCurrentDate();
//                 console.log(pickup_date, route_trip, available_seats, creation_date);
//                 //                this.props.firebase.seat(Date.now()).set({ pickup_date, route_trip, available_seats, creation_date }).then(() => {

//                 availabilityStatus.isAvailable = true;
//                 availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-success alert-dismissible" role="alert">Seats are available in this route. Please go ahead and book now!!</div></small>;

//                 //                }).catch(error => {
//                 //                    availabilityStatus.isAvailable = true;
//                 //                    availabilityStatus.message = <small class="form-text text-muted"><div class="alert alert-warning alert-dismissible" role="alert">Error fetching seat availability details. You may still be able to book</div></small>;
//                 //                });

//             }
//         });
//         return availabilityStatus;
//     }

// }