import * as _ from "lodash";
import { select } from "redux-saga/effects";

export function* getAccessToken() {
  const auth = yield select(({ auth }) => auth);

  return _.get(auth, "token", "");
}
