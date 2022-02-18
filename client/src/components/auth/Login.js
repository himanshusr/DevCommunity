import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Alert from '../layout/Alert';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { login } from '../../action/auth';

const Login = ({ login, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    login(email, password);
    // console.log('Success');
  };

  //Redirect if Logged in
  if (isAuthenticated) {
    return <Navigate to='/dashboard' />;
  }
  return (
    <section className='container'>
      <Alert />
      <h1 className='large text-primary'>Sign In</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Sign Into Your Account
      </p>
      <form className='form' onSubmit={onSubmit}>
        <div className='form-group'>
          <input
            type='email'
            name='email'
            value={email}
            placeholder='Email Address'
            onChange={onChange}
            required
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            name='password'
            value={password}
            placeholder='Password'
            minLength='6'
            onChange={onChange}
          />
        </div>

        <input type='submit' value='Login' className='btn btn-primary' />
      </form>
      <p className='my-1'>
        Dont have an account? <Link to='/register'>Sign Up</Link>
      </p>
    </section>
  );
};
//Proptypes are used for typechecking of the props as JS is a loosely typed language
Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => {
  return { isAuthenticated: state.auth.isAuthenticated };
};

export default connect(mapStateToProps, { login })(Login);
