import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const SignUpPage = () => (
    <div>
        <SignUpForm />
    </div>
);

const INITIAL_STATE = {
    username: '',
    phone: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    error: null,
};

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

class SignUpFormBase extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        const { username, email, passwordOne, phone } = this.state;

        this.props.firebase
            .doCreateUserWithEmailAndPassword(email, passwordOne)
            .then(authUser => {
                // Create a user in your Firebase realtime database
                this.props.firebase
                    .user(authUser.user.uid)
                    .set({
                        username,
                        email,
                        phone,
                    })
                    .then(() => {
                        this.setState({ ...INITIAL_STATE });
                        this.props.history.push(ROUTES.HOME);
                    })
                    .catch(error => {
                        this.setState({ error });
                    });
            })
            .catch(error => {
                this.setState({ error });
            });

        event.preventDefault();
    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    componentWillUnmount() {
        this.props.firebase.users().off();
    }

    render() {
        const {
            username,
            email,
            passwordOne,
            passwordTwo,
            error,
            phone,
        } = this.state;

        const isInvalid =
            passwordOne !== passwordTwo ||
            passwordOne === '' ||
            email === '' ||
            phone === '' ||
            username === '';

        return (
            <div class="card" style={myDivStyle}>

                <div class="card-header">
                    <h5>Please sign up and get set to book your seat</h5> </div>
                <div class="card-body" >
                    <form onSubmit={this.onSubmit}>
                        <div class="form-group">
                            <div class="form-row">
                                <label for="username">Full name</label>
                                <input
                                    class="form-control"
                                    name="username"
                                    value={username}
                                    onChange={this.onChange}
                                    type="text"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div class="form-row">
                                <label>Phone number</label>
                                <input
                                    class="form-control"
                                    name="phone"
                                    value={phone}
                                    onChange={this.onChange}
                                    type="number"
                                    placeholder="Please enter your 10 digit phone number"
                                />
                                <small id="phoneHelp" class="form-text text-muted">Your phone will not be shared with anyone else </small>
                            </div>
                            <div class="form-row">
                                <label>Email id</label>
                                <input
                                    class="form-control"
                                    name="email"
                                    value={email}
                                    onChange={this.onChange}
                                    type="text"
                                    placeholder="Please enter your email id"
                                />
                                <small id="emailHelp" class="form-text text-muted">Your email id will not be shared with anyone else</small>
                            </div>

                            <div class="form-row">
                                <div class="col">
                                    <label for="passwordOne">Password</label>
                                    <input
                                        class="form-control"
                                        name="passwordOne"
                                        value={passwordOne}
                                        onChange={this.onChange}
                                        type="password"
                                        placeholder="Password"
                                    />
                                </div>

                                <div class="col">
                                    <label for="passwordTwo">Confirm password</label>
                                    <input
                                        class="form-control"
                                        name="passwordTwo"
                                        value={passwordTwo}
                                        onChange={this.onChange}
                                        type="password"
                                        placeholder="Password"
                                    />
                                </div>
                            </div>

                            <p></p>
                            <div class="form-row">
                                <button disabled={isInvalid} class="btn btn-success btn-lg btn-block" type="submit">
                                    Create account
                            </button>
                            </div>
                            {error && <p>{error.message}</p>}

                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

const SignUpLink = () => (
    <p>
        Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
    </p>
);

const SignUpForm = withRouter(withFirebase(SignUpFormBase));

export default SignUpPage;

export { SignUpForm, SignUpLink };
