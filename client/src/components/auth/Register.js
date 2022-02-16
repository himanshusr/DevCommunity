import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  const { name, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      console.log('Passwords do not match');
    } else {
      console.log('Success');
    }
  };

  return (
    <section className='container'>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'>
        <i className='fas fa-user'></i> Create Your Account
      </p>
      <form className='form' onSubmit={onSubmit}>
        <div className='form-group'>
          <input
            type='text'
            name='name'
            value={name}
            placeholder='Name'
            required
            onChange={onChange}
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            name='email'
            value={email}
            placeholder='Email Address'
            onChange={onChange}
            required
          />
          <small className='form-text'>
            This site uses Gravatar, so if you want a profile image use Gravatar
          </small>
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
        <div className='form-group'>
          <input
            type='password'
            name='password2'
            value={password2}
            placeholder='Confirm password'
            minLength='6'
            onChange={onChange}
          />
        </div>
        <input type='submit' value='Register' className='btn btn-primary' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Sign In</Link>
      </p>
    </section>
  );
};

export default Register;
