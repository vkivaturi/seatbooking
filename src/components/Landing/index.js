import React from 'react';
import { SignUpLink } from '../SignUp';

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

const Landing = () => (
    <div class="card" style={myDivStyle}>
        <h3>Shuttle Seat Booking</h3>
        <p>We are a shuttle service in Hyderabad. This is a 2019 initiative and our coverage is currently between
    Nallagandla and Hitec City.</p>

        <ul class="list-group">
            <li class="list-group-item list-group-item-primary">Shuttle between Nallagandla and Hitec City</li>
            <li class="list-group-item list-group-item-secondary">Morning and evening trips</li>
            <li class="list-group-item list-group-item-success">Brand new air conditioned van</li>
            <li class="list-group-item list-group-item-info">Read, sleep, music, relax</li>
        </ul>
        <br />
        <p>We also offer intra city full booking on Saturday and Sundays</p>

        <SignUpLink />

        <p>Please use the Sign In option in menu to get started</p>
        <p>In case of any assistance, please contact us at <b>xxx@gmail.com</b> or WhatsApp us at <b>xxxxxxxx</b></p>

    </div>
);

export default Landing;
