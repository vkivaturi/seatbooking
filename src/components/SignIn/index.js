import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';


const SignInPage = () => (
    <div>
        <SignInForm />
        <SignUpLink />
    </div>
);

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null,
};

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

class SignInFormBase extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        const { email, password } = this.state;

        this.props.firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
                this.props.history.push(ROUTES.HOME);
            })
            .catch(error => {
                this.setState({ error });
            });

        event.preventDefault();
    };

    componentWillUnmount() {
        this.props.firebase.users().off();
    }


    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { email, password, error } = this.state;

        const isInvalid = password === '' || email === '';

        return (
            <div class="card" style={myDivStyle}>

                <div class="card-header">
                    <h5>Please sign in to book your seat</h5> </div>
                <div class="card-body" >
                    <form onSubmit={this.onSubmit}>
                        <div class="form-group">
                            <div class="form-row">
                                <label for="email">User name</label>
                                <input
                                    class="form-control"
                                    name="email"
                                    value={email}
                                    onChange={this.onChange}
                                    type="text"
                                    placeholder="Email Address"
                                />
                                <small id="emailHelp" class="form-text text-muted">Your email will not be shared with anyone else</small>
                            </div>
                            <div class="form-row">
                                <label for="password">Password</label>
                                <input
                                    class="form-control"
                                    name="password"
                                    value={password}
                                    onChange={this.onChange}
                                    type="password"
                                    placeholder="Password"
                                />
                            </div>
                            <p></p>
                            <div class="form-row">
                                <button disabled={isInvalid} class="btn btn-primary btn-lg btn-block" type="submit">
                                    Sign In
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

const SignInForm = compose(
    withRouter,
    withFirebase,
)(SignInFormBase);

export default SignInPage;

export { SignInForm };
