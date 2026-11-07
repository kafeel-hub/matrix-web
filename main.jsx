import { createRoot } from "react-dom/client";
// import { persistor } from "@store";
import store from "./store/index.js";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
// import { PersistGate } from "redux-persist/lib/integration/react";
import ThemeProvider from "./contexts/ThemeProvider";
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const container = document.getElementById("root");

// Create a root.
const root = ReactDOM.createRoot(container);

// Initial render.
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
