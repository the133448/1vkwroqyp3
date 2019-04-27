import React from "react";
import ReactDOM from "react-dom";

import preval from "preval.macro";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link
} from "react-router-dom";

import { AuthPage } from "./login";
import { DashboardPage } from "./dashboard";
import { isLoggedIn, UpdateLogon } from "./api";
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

              <Switch >
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
                      case 3:
                        return <Redirect to="/login#logout" />;
                    }
                  }}
                />
                <Route
                  path="/login"
                  render={props => {
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
                  render={props => {
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
                  exact
                  path="/dashboard"
                  render={() => {
                    console.log("Requesting /dashboard View");
                    switch (isLoggedIn()) {
                      case 0:
                      default:
                        return <Redirect to="/login" />;
                      case 1:
                        return <Redirect to="/dashboard/table" />;
                      case 2:
                        return <Redirect to="/login#expire" />;
                      case 3:
                        return <Redirect to="/login#logout" />;
                    }
                  }}
                />
                <Route
                  path="/dashboard/table"
                  render={() => {
                    console.log("Requesting /dashboard/table View");
                    switch (isLoggedIn()) {
                      case 0:
                      default:
                        return <Redirect to="/login" />;
                      case 1:
                        return <DashboardPage type={1} />;
                      case 2:
                        return <Redirect to="/login#expire" />;
                      case 3:
                        return <Redirect to="/login#logout" />;
                    }
                  }}
                />
                <Route
                  path="/dashboard/graph"
                  render={() => {
                    console.log("Requesting /dashboard/graph View");
                    switch (isLoggedIn()) {
                      case 0:
                      default:
                        return <Redirect to="/login" />;
                      case 1:
                        return <DashboardPage type={2} />;
                      case 2:
                        return <Redirect to="/login#expire" />;
                      case 3:
                        return <Redirect to="/login#logout" />;
                    }
                  }}
                />
                <Route
                  path="/dashboard/map"
                  render={() => {
                    console.log("Requesting /dashboard/map View");
                    switch (isLoggedIn()) {
                      case 0:
                      default:
                        return <Redirect to="/login" />;
                      case 1:
                        return <DashboardPage type={3} />;
                      case 2:
                        return <Redirect to="/login#expire" />;
                      case 3:
                        return <Redirect to="/login#logout" />;
                    }
                  }}
                />
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
      <Routing />
      <div className="footer">
        <p>
          {process.env.REACT_APP_NAME}-{process.env.REACT_APP_VERSION}(Built:
          {preval`module.exports = new Date().toLocaleString();`}.) (Daniel
          Johns - n9961119)
        </p>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
