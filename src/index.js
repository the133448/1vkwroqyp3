import React from "react";
import ReactDOM from "react-dom";
import { AuthPage } from "./login";
import { DashboardPage } from "./dashboard";
import { isLoggedIn, UpdateLogon } from "./api";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link
} from "react-router-dom";
import "./styles.css";

function NotFound() {
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

function Routing() {
  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={() =>
            isLoggedIn() ? (
              <Redirect to="/dashboard" />
            ) : (
              <Redirect to="/login" />
            )
          }
        />
        <Route
          path="/login"
          render={() =>
            isLoggedIn() ? (
              <Redirect to="/dashboard" />
            ) : (
              <AuthPage login={true} />
            )
          }
        />
        <Route
          path="/register"
          render={() =>
            isLoggedIn() ? (
              <Redirect to="/dashboard" />
            ) : (
              <AuthPage login={false} />
            )
          }
        />
        <Route
          path="/dashboard"
          render={() =>
            isLoggedIn() ? <DashboardPage /> : <Redirect to="/login" />
          }
        />
        <Route path="/404" component={NotFound} status={404} />
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
        <pre>Daniel Johns [V1.3.2] </pre>
        <p>
          {process.env.REACT_APP_NAME}-{process.env.REACT_APP_VERSION})
        </p>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
