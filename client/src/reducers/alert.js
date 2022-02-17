import { SET_ALERT, REMOVE_ALERT } from '../action/types';

const initialState = [];

//Reducer accepts the previous state and returns the new state
//(prevState, action ) => newState
const alert = function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_ALERT:
      return [...state, payload];
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload);
    default:
      return state;
  }
};

export default alert;
