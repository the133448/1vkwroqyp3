import React, { Fragment, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { useList, useSearch, logOut } from "./api";
import SmartDataTable from "react-smart-data-table";

import Select from "react-select";

function MonthFilterItem(props) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return <FilterItem field={props.field} data={months} special={true} />;
}

function DataFilterItem(props) {
  const endPoint = `${props.field}s`;
  const { loading, lists, error } = useList(endPoint);

  if (error)
    return (
      <div>
        <h1>Oops! Something happened.</h1>
        <h3>{error}</h3>
      </div>
    );
  return <FilterItem field={props.field} data={lists} loading={loading} />;
}

function FilterItem(props) {
  const options = props.data.map(function(item, index) {
    return { value: props.special ? index + 1 : item, label: item };
  });
  return (
    <div className="filter">
      <h3 className="capital">{props.field}s </h3>
      <Select isMulti isLoading={props.loading} options={options} />
      {/* {props.data.map((item, index) => (
        <Fragment key={item}>
          <label>
            <input
              className="option"
              type="radio"
              name={props.field}
              value={props.special ? index + 1 : item}
            />
            {item}
          </label>
        </Fragment>
      ))} */}
    </div>
  );
}

function Offences(props) {
  const { loading, lists, error } = useList("offences");
  const [filter, setFilter] = useState("");
  // const ages = useList("ages");
  // const genders = useList("genders");
  // const years = useList("years");

  // const { loadingA, ages, errorA } = useList("ages");
  // const { loadingg, genders, errorG } = useList("genders");
  // const { loadingY, years, errorY } = useList("years");
  const [chosenOffence, setChosenOffence] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  if (error)
    return (
      <div>
        <h1>Oops an Error Ocurred</h1>
      </div>
    );
  if (loading)
    return (
      <div>
        <h1>PLease Wait Loading...</h1>
      </div>
    );

  const handleSubmit = () => {
    props.onFilterSubmit(filter);
    props.onSubmit(chosenOffence);
  };
  function handleFilterSubmit(event) {
    event.preventDefault();
    const data = new URLSearchParams(new FormData(event.target));
    setFilter(data.toString());
  }

  return (
    <div className="OffenceChooser">
      <div className="modal-container">
        <h1>Search Offences {filter}</h1>
        <form onSubmit={handleFilterSubmit}>
          <DataFilterItem field="offence" />
          <DataFilterItem field="age" />
          <DataFilterItem field="gender" />
          <DataFilterItem field="year" />
          <MonthFilterItem field="month" special={true} />
        </form>
      </div>

      <button
        className="searchBtn"
        id="search-button"
        type="button"
        disabled={chosenOffence ? false : true}
        onClick={() => handleSubmit()}
      >
        {chosenOffence
          ? `Search for ${chosenOffence}`
          : "An offence is required"}
      </button>
    </div>
  );
}
function Results(props) {
  const { loading, result, error } = useSearch(props.offence, props.filter);
  const [search, setSearch] = useState("");
  if (loading)
    return (
      <div className="content">
        <h4>Loading...</h4>
      </div>
    );
  if (error)
    return (
      <div className="content">
        <h1>An Error Ocurred</h1>
        <h3>{error.toString()}</h3>
      </div>
    );
  return (
    <div className="content">
      <h3>
        Results for: {props.offence} ({search})
      </h3>
      <div>
        <label>Search: </label>
        <input
          value={search}
          onChange={event => {
            setSearch(event.target.value);
          }}
        />
      </div>
      {/* <table>
        <thead>
          <tr>
            <th>Local Government</th>
            <th>Number of offences</th>
          </tr>
        </thead>
        <tbody>
          {result.map(result => (
            <Fragment>
              <tr>
                <td>{result.lga}</td>
                <td>{result.count}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table> */}

      <SmartDataTable
        data={result}
        name="test-table"
        className="ui compact selectable table"
        filterValue={search}
        sortable
        perPage={10}
      />
    </div>
  );
}

function SideBar(props) {
  return (
    <aside className="sidebar">
      <Link to="/dashboard/table">
        <button
          className={
            props.type === 1 ? "dash-btn table active" : "dash-btn b-table"
          }
        >
          Search
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

function CurrentView(props) {
  if (props.type === 1) {
    return (
      <div>
        <Offences
          onSubmit={props.setOffence}
          onFilterSubmit={props.setFilter}
        />
        {props.offence ? (
          <Results offence={props.offence} filter={props.filter} />
        ) : (
          ""
        )}
      </div>
    );
  } else if (props.type === 2) {
    return (
      <div>
        <h1>Graphs</h1>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Maps</h1>
      </div>
    );
  }
}

export function DashboardPage(props) {
  const [offence, setOffence] = useState("");
  const [filter, setFilter] = useState("");

  document.title = "Dashboard - Home";
  return (
    <div className="animated fadeIn padded">
      <div className="navbar">
        <h4 className="user">Welcome back {localStorage.getItem("EMAIL")}</h4>

        <Link to="/logout" className="logout">
          Logout{" "}
        </Link>
      </div>
      <div>
        <SideBar type={props.type} />
        <div className="content">
          <CurrentView type={props.type} />
        </div>
      </div>
    </div>
  );
}
