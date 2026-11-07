import * as _ from "lodash";
import { connect } from "react-redux";
// import { useHistory } from "react-router-dom";

import Divider from "@mui/material/Divider";

import {
  StyledDialog,
  StyledDialogTitle,
  StyledDialogContent,
  StyledDialogContentText,
  StyledDialogActions,
} from "../Ui/Modal";

import CommonButtton from "../Customcomponents/CustomButton";

function GlobalPopup(props) {
  const {
    showGlobalPopup,
    globalPopupData,
    setShowGlobalPopup,
    getMyFeed,
    loginHomeLoading,
    logout,
  } = props;
  //   let history = useHistory();

  const windowreloadhandler = () => {
    if (globalPopupData?.educationRequest) {
      window.location.reload();
    }
  };

  const handleClose = () => {
    setShowGlobalPopup(false);
  };
  return (
    <>
      <StyledDialog
        open={!loginHomeLoading && showGlobalPopup}
        onClose={handleClose}
        aria-labelledby="title"
        aria-describedby="description"
      >
        <StyledDialogTitle id="title">
          {globalPopupData?.header || "Message"}
        </StyledDialogTitle>
        <Divider />
        <StyledDialogContent>
          <StyledDialogContentText id="description">
            {globalPopupData?.title}
          </StyledDialogContentText>
        </StyledDialogContent>
        <StyledDialogActions>
          <CommonButtton
            onClick={globalPopupData?.customFn || handleClose}
            text={globalPopupData?.buttonLabel || "Close"}
            size="xs"
          />
        </StyledDialogActions>
      </StyledDialog>
    </>
  );
}

const mapStateToProps = ({ invoice = {} }) => {
  const showGlobalPopup = _.get(invoice, "showGlobalPopup", false);
  const globalPopupData = _.get(invoice, "globalPopupData", {});

  const loginHomeLoading = _.get(invoice, "loginHomeLoading", false);
  return {
    showGlobalPopup,
    loginHomeLoading,
    globalPopupData,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setShowGlobalPopup: (data) =>
    dispatch({ type: "setglobalpopupcalled", payload: data }),
  setShowGlobalAlert: (data) =>
    dispatch({ type: "setglobalalertcalled", payload: data }),
  logout: (data) => dispatch(logoutSuccess()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GlobalPopup);
