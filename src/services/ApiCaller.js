import * as _ from "lodash";
// import { useHistory } from "react-router-dom";
import { call } from "redux-saga/effects";
// import { store } from "../store/store";

const isConnected = true;

function* callServer(apiFunction, reqData, showError = false, id = null) {
  if (isConnected) {
    const response = yield call(apiFunction, reqData, reqData.id || id);
    const { status = "" } = response || {};
    let resData = _.get(response, "data", {});
    resData = resData || {};
    if (!_.isEmpty(resData.error_message)) {
      throw resData;
    } else if (status === 200) {
      return resData || {};
    } else if (status === 204) {
      return { resData };
    } else if (status == 201) {
      return resData;
    }
    // else if (status == 401) {
    //   store.dispatch({ type: "logoutCalled", payload: "" });
    //   throw { error: true, statusCode: 401, message: "Unauthorized" };
    // }
    else {
      const { error = "", message = "" } = resData || {};
      let errorPayload = {};
      if (typeof error === "object") {
        errorPayload = { ...error };
      } else {
        errorPayload = { error, message };
      }

      if (showError) {
        if (response.problem === "TIMEOUT_ERROR") {
          // showToast(ERRORS.SERVER_NOT_RESPONDING)
        } else if (!_.isEmpty(errorPayload.message)) {
          if (errorPayload.message === "EmailUsed") {
            //showToast(ERRORS.EMAIL_USED)
          } else if (errorPayload.message === "password should not be empty") {
            //showToast(ERRORS.PASSWORD_EMPTY)
          } else if (errorPayload.message === "Email must be an email") {
            //showToast(MESSAGES.ENTER_INVALID)
          } else if (errorPayload.message === "Invalidpassword") {
            //showToast(MESSAGES.PASSWORD_INVALID)
          } else if (errorPayload.message === "usernotexist") {
            //showToast(ERRORS.USER_NOT_EXIST)
          } else if (errorPayload.message === "userNameEmpty") {
            //showToast(MESSAGES.USERNAME_EMPTY)
          } else if (errorPayload.message === "emailNotVerified") {
            //showToast(ERRORS.EMAIL_NOT_VERIFIED)
          } else {
            //showToast(errorPayload.message)
          }
        }
      }
      throw errorPayload;
    }
  } else {
    if (showError) {
      // showToast(ERRORS.NETWORK_ERROR)
    }
    // eslint-disable-next-line no-throw-literal
    throw { error: true, statusCode: 503 };
  }
}

export default {
  callServer,
};
