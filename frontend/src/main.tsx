import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App";
import "./index.css";
import { store } from "./store";
import { AuthChecker } from "./components/AuthChecker";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthChecker>
          <App />
        </AuthChecker>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);


