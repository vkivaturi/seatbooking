import React from 'react';
import { Link } from 'react-router-dom';

import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';

import styles from '../../Navigation.module.css';

import { AuthUserContext } from '../Session';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';


const Navigation = () => (
  <div>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? <NavigationAuth /> : <NavigationNonAuth />
      }
    </AuthUserContext.Consumer>
  </div>
);

const NavigationAuth = () => (
<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
<Navbar.Brand href="#home">Seat Booking App</Navbar.Brand>
  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
  <Navbar.Collapse id="responsive-navbar-nav">
    <Nav className="mr-auto">
      <Nav.Link href={ROUTES.LANDING}>Shuttle home</Nav.Link>
      <Nav.Link href={ROUTES.HOME}>Book my seat</Nav.Link>
      <Nav.Link href={ROUTES.ACCOUNT}>My account</Nav.Link>
    </Nav>
    <Nav>
    	<Nav.Link><SignOutButton /></Nav.Link>
    </Nav>
  </Navbar.Collapse>
</Navbar>

);

const NavigationNonAuth = () => (
<Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
<Navbar.Brand href="#home">Seat Booking App</Navbar.Brand>
  <Navbar.Toggle aria-controls="responsive-navbar-nav" />
  <Navbar.Collapse id="responsive-navbar-nav">
    <Nav className="mr-auto">
      <Nav.Link href={ROUTES.LANDING}>Shuttle home</Nav.Link>
      <Nav.Link href={ROUTES.SIGN_IN}>Sign In</Nav.Link>
    </Nav>
  </Navbar.Collapse>
</Navbar>
);

export default Navigation;
