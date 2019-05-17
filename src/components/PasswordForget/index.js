import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const PasswordForgetPage = () => (
    <div>
        <PasswordForgetForm />
    </div>
);

const myDivStyle = {
    border: '3px solid black',
    width: '100%'
};

const INITIAL_STATE = {
    email: '',
    error: null,
};

class PasswordForgetFormBase extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = event => {
        const { email } = this.state;

        this.props.firebase
            .doPasswordReset(email)
            .then(() => {
                this.setState({ ...INITIAL_STATE });
            })
            .catch(error => {
                this.setState({ error });
            });

        event.preventDefault();
    };

    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { email, error } = this.state;

        const isInvalid = email === '';

        return (
            <div class="card" style={myDivStyle}>

                <div class="card-header">
                    <h5>Reset your password. You will receive an email with reset instructions</h5> </div>
                <div class="card-body" >

                    <form onSubmit={this.onSubmit}>
                        <input
                            name="email"
                            class="form-control"
                            value={this.state.email}
                            onChange={this.onChange}
                            type="text"
                            placeholder="Email Address"
                        />
                        <br/>
                        <button disabled={isInvalid} class="btn btn-primary btn-lg btn-block" type="submit">
                            Reset My Password
                        </button>

                        {error && <p>{error.message}</p>}
                    </form>
                </div>
            </div>
        );
    }
}

const PasswordForgetLink = () => (
    <p>
        <Link to={ROUTES.PASSWORD_FORGET}>Forgot Password?</Link>
    </p>
);

export default PasswordForgetPage;

const PasswordForgetForm = withFirebase(PasswordForgetFormBase);

export { PasswordForgetForm, PasswordForgetLink };
