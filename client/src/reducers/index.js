import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
console.log(auth);

export default combineReducers({
  alert,
  auth,
});
