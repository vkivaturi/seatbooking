import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

import { AuthUserContext, withAuthorization } from '../Session';
import BookSeat from './bookseat.js';
import CancelBooking from './cancelbooking.js';

import { withFirebase } from '../Firebase';
//import * as ROUTES from '../../constants/routes';

const config = {
    admins: process.env.REACT_APP_ADMINS,
};

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>
                <Tabs defaultActiveKey="bookseat">
                    <Tab eventKey="bookseat" title="Book seat">
                        <BookSeat />
                    </Tab>
                    <Tab eventKey="cancelbooking" title="Cancel booking">
                        <CancelBooking />
                    </Tab>

                </Tabs>
            </div>
        );
    }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(withFirebase(HomePage));
