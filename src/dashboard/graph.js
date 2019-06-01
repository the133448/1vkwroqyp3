import React, { useEffect, useState, useRef } from "react";
import { Link, Redirect } from "react-router-dom";
import { useList, useMultiSearch } from "../api";
import Select from "react-select";

import { Line } from "react-chartjs-2";
import { Loader } from "./common";

const GenerateGraph = (label, data) => ({
  labels: label,
  datasets: [
    {
      label: "Offences",
      fill: false,
      lineTension: 0.1,
      backgroundColor: "rgba(75,192,192,0.4)",
      borderColor: "rgba(75,192,192,1)",
      borderCapStyle: "butt",
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: "miter",
      pointBorderColor: "rgba(75,192,192,1)",
      pointBackgroundColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: "rgba(75,192,192,1)",
      pointHoverBorderColor: "rgba(220,220,220,1)",
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: data
    }
  ]
});

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
  return (
    <FilterItem
      field={props.field}
      data={lists}
      loading={loading}
      disabled={props.disabled}
      sendFilter={props.updateFilter}
    />
  );
}

function FilterItem(props) {
  const handleChange = selectedOption => {
    let data = null;
    if (!(selectedOption.length === undefined)) {
      data = selectedOption.map(function(item) {
        return item.value;
      });
    } else {
      data = [selectedOption.value];
    }

    props.sendFilter(data);
  };

  const options = props.data.map(function(item, index) {
    return { value: props.special ? index + 1 : item, label: item };
  });
  return (
    <div className="filter">
      <h3 className="capital">{props.field}s </h3>
      {props.field === "offence" ? (
        <Select
          id={props.field}
          onChange={handleChange}
          isLoading={props.loading}
          placeholder={"Choose offence (required)"}
          options={options}
        />
      ) : (
        <Select
          id={props.field}
          isMulti
          onChange={handleChange}
          isLoading={props.loading}
          placeholder={"All " + props.field + "s"}
          options={options}
          isDisabled={props.disabled}
        />
      )}
    </div>
  );
}

function Offences(props) {
  const [offence, setOffence] = useState([]);
  const [age, setAge] = useState([]);
  const [gender, setGender] = useState([]);

  let offenceValidate = false;
  if (offence.length >= 1) {
    offenceValidate = true;
  }

  const filters = {
    offence,
    age,
    gender
  };

  const handleSubmit = () => {
    props.onSubmit(filters);
  };

  return (
    <div className="OffenceChooser">
      <div className="modal-container">
        <div className="filter-container">
          <DataFilterItem field="offence" updateFilter={setOffence} />
          <DataFilterItem
            field="age"
            updateFilter={setAge}
            disabled={offenceValidate ? false : true}
          />
          <DataFilterItem
            field="gender"
            updateFilter={setGender}
            disabled={offenceValidate ? false : true}
          />
          <button
            className="searchBtn"
            id="search-button"
            type="button"
            disabled={offenceValidate ? false : true}
            onClick={() => handleSubmit()}
          >
            {offenceValidate ? `Search` : "An offence is required"}
          </button>
        </div>
      </div>
    </div>
  );
}
function Results(props) {
  const { loading, result, error } = useMultiSearch(props.filters);
  const [search, setSearch] = useState("");
  let resultsRef = useRef();
  useEffect(() => {
    if (resultsRef.current) {
      window.scrollTo({
        behavior: "smooth",
        top: resultsRef.current.offsetTop
      });
    }
  }, [loading]);
  // if (loading)
  //   return (
  //     <div>
  //       <h4>Loading...</h4>
  //     </div>
  //   );
  if (error)
    return (
      <div>
        <h1>An Error Ocurred</h1>
        <h3>{error.toString()}</h3>
      </div>
    );

  const sortResult = result.sort();
  const label = sortResult.map(function(value, index) {
    return value[0];
  });
  const data = sortResult.map(function(value, index) {
    return value[1];
  });

  return (
    <div ref={resultsRef}>
      <Loader on={loading} />
      <h3>Graph for: {props.filters.offence[0]}</h3>

      <Line data={GenerateGraph(label, data)} />
    </div>
  );
}

export function GraphPage() {
  const [filters, setFilter] = useState("");
  return (
    <>
      <h1>Graph Page</h1>

      <Offences onSubmit={setFilter} />
      {filters ? <Results filters={filters} /> : ""}
    </>
  );
}
