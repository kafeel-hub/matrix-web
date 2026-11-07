// src/features/demo/DemoComponent.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as _ from "lodash";
import { connect } from "react-redux";

const DemoComponent = ({ getDummyData }) => {
  const { dummyData, loading, error } = useSelector((state) => state.demo);

  useEffect(() => {
    getDummyData();
  }, []);
  console.log(dummyData, "dumyData");

  return (
    <div>
      <h1>Demo Data</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};
const mapStateToProps = ({ demo = {} }) => {
  const dummyData = _.get(demo, "demodata", []);

  return { dummyData };
};

const mapDispatchToProps = (dispatch) => ({
  getDummyData: (data) => {
    dispatch({ type: "getdemoSagacalled", payload: data });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DemoComponent);
