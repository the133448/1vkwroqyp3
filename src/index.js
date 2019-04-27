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
          render={props => {
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
          path="/dashboard"
          render={() => {
            switch (isLoggedIn()) {
              case 0:
              default:
                return <Redirect to="/login" />;
              case 1:
                return <DashboardPage />;
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
          {process.env.REACT_APP_NAME}-{process.env.REACT_APP_VERSION} (Daniel
          Johns - n9961119)
        </p>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
