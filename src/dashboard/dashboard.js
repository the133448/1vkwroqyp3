import React from "react";
import { Link, Redirect, Route } from "react-router-dom";
import { isLoggedIn } from "../api";

import { SearchPage } from "./search";
import { GraphPage } from "./graph";
import { MapPage } from "./map";

function SideBar(props) {
  return (
    //simple tracking which one is active and applying a differnt CSS
    <aside className="sidebar">
      <Link to="/dashboard/table">
        <button
          className={props.type === 1 ? "dash-btn table active" : "dash-btn"}
        >
          Stats
        </button>
      </Link>
      <Link to="/dashboard/graph">
        <button className={props.type === 2 ? "dash-btn active" : "dash-btn"}>
          Graphs
        </button>
      </Link>
      <Link to="/dashboard/map">
        <button className={props.type === 3 ? "dash-btn active" : "dash-btn"}>
          Maps
        </button>
      </Link>
    </aside>
  );
}

export function CurrentView(props) {
  //handles routing the correct view based on the prop.type
  if (props.type === 1) {
    return <SearchPage />;
  } else if (props.type === 2) {
    return <GraphPage />;
  } else {
    return <MapPage />;
  }
}

export function Dashboard(props) {
  //Main dashboard page with sidedbar, navbar and content
  return (
    <DashboardPage>
      <SideBar type={props.type} />
      <div className="content animated fadeIn ">
        <CurrentView type={props.type} />
      </div>
    </DashboardPage>
  );
}

export function DashboardPage(props) {
  document.title = "Dashboard - Home";
  return (
    <div className="padded">
      <div className="navbar">
        <h4 className="user">Logged in as {localStorage.getItem("EMAIL")}</h4>

        <Link to="/logout" className="logout">
          Logout{" "}
        </Link>
      </div>
      <div>{props.children}</div>
    </div>
  );
}

export function DashboardRoutes(props) {
  return (
    //dashboard routes
    <>
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
          }
        }}
      />
      <Route
        path="/dashboard/table"
        render={() => {
          console.log("Requesting /dashboard/table View");
          //We need to check isLoggedIn as the user might of come here
          //from a URL
          switch (isLoggedIn()) {
            case 0:
            default:
              return <Redirect to="/login" />;
            case 1:
              return <Dashboard type={1} />;

            case 2:
              return <Redirect to="/login#expire" />;
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
              return <Dashboard type={2} />;
            case 2:
              return <Redirect to="/login#expire" />;
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
              return <Dashboard type={3} />;
            case 2:
              return <Redirect to="/login#expire" />;
          }
        }}
      />
    </>
  );
}
