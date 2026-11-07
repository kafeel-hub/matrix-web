import { combineReducers } from "redux";
import demo from "../features/demo/demoSlice";
import auth, { logOut } from "../features/auth/authSlice";
import invoice from "../features/invoice/invoiceSlice";
import master from "../features/master/customerSlice"

// const rootReducer = combineReducers({
//   demo,
//   auth,
// });

const appReducer = combineReducers({
  demo,
  auth,
  invoice,
  master
});

const rootReducer = (state, action) => {
  if (action.type === logOut.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
