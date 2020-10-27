import React from "react";
import ReactDOM from "react-dom";

import preval from "preval.macro";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link,
} from "react-router-dom";

import { AuthPage } from "./login";
import { DashboardRoutes } from "./dashboard/dashboard";
import { isLoggedIn, UpdateLogon, logOut } from "./api";
import "./styles.css";

function NotFound() {
  document.title = "404 - Page not Found";
  return (
    <div>
      <h1>404</h1>
      <h3>Not Found</h3>
      <button>
        <Link to={`/`}>Home</Link>
      </button>
    </div>
  );
}
//isLoggedIn Returns
// 0 - No Login Info Found
// 1 Logged in (Valid Session)
// 2 Logged in - Session Expired
// 3 Logged out (previous login)
function Routing() {
  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            console.log("Requesting / View");
            switch (isLoggedIn()) {
              case 0:
              default:
                return <Redirect to="/login" />;
              case 1:
                return <Redirect to="/dashboard" />;
              case 2:
                return <Redirect to="/login#expire" />;
            }
          }}
        />
        <Route
          path="/login"
          render={(props) => {
            console.log("Requesting /login View");
            switch (isLoggedIn()) {
              case 0:
              case 2:
              case 3:
              default:
                return <AuthPage login={true} {...props} />;
              case 1:
                return <Redirect to="/dashboard" />;
            }
          }}
        />
        <Route
          path="/register"
          render={(props) => {
            console.log("Requesting /register View");
            switch (isLoggedIn()) {
              case 0:
              case 2:
              case 3:
              default:
                return <AuthPage login={false} {...props} />;
              case 1:
                return <Redirect to="/dashboard" />;
            }
          }}
        />
        <Route
          path="/logout"
          render={(props) => {
            console.log("Requesting /logout View");
            logOut();
            return <Redirect to="/login#logout" />;
          }}
        />
        <DashboardRoutes />
        <Route path="/404" component={NotFound} />
        <Route render={() => <Redirect to="/404" />} />
      </Switch>
    </Router>
  );
}

function App() {
  UpdateLogon();

  return (
    <div>
      <div className="my-pusher">
        <div className="Site-content">
          <Routing />
        </div>
        <div className="Footer">
          <div className="Footer-credits">
            <span className="Footer-credit">
              Created by group Loona QUT ATO Capstone
            </span>{" "}
            <span className="Footer-credit">
              {process.env.REACT_APP_NAME}-{process.env.REACT_APP_VERSION}[
              {process.env.DEPLOY_ID}] (Built:
              {preval`module.exports = new Date().toLocaleString();`}.)
            </span>
          </div>

          {/* <img className="stripes" src="./stripes.svg" alt="Logo" /> */}
        </div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
