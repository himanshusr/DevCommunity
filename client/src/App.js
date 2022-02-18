import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

//Redux
//Provider combines react and redux by surroounding entire app with provider
import { Provider } from 'react-redux';
//Pass in the store to Provider
import store from './store';
import { loadUser } from './action/auth';
import setAuthToken from './utils/setAuthToken';

import './App.css';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Routes>
          <Route exact path='/' element={<Landing />} />
          <Route exact path='/register' element={<Register />}></Route>
          <Route exact path='/login' element={<Login />}></Route>
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
