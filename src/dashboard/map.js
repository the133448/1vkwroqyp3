import React, { useEffect, useState, useRef } from "react";
import { Link, Redirect } from "react-router-dom";
import { useList, useSearch, logOut } from "../api";
import { scaleLinear } from "d3-scale";

import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography
} from "react-simple-maps";

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
  return (
    <FilterItem
      field={props.field}
      data={months}
      special={true}
      disabled={props.disabled}
      sendFilter={props.updateFilter}
    />
  );
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
  const [year, setYear] = useState([]);
  const [month, setMonth] = useState([]);

  let offenceValidate = false;
  if (offence.length >= 1) {
    offenceValidate = true;
  }

  const filters = {
    offence,
    age,
    gender,
    year,
    month
  };

  const handleSubmit = () => {
    props.onSubmit(filters);
  };

  return (
    <div className="OffenceChooser">
      <div className="modal-container">
        <h1>Map Offences </h1>
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
          <DataFilterItem
            field="year"
            updateFilter={setYear}
            disabled={offenceValidate ? false : true}
          />
          <MonthFilterItem
            field="month"
            updateFilter={setMonth}
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

const wrapperStyles = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto"
};

function Results(props) {
  const { loading, result, error } = useSearch(props.filters);
  // let resultsRef = useRef();
  // useEffect(() => {
  //   if (resultsRef.current) {
  //     window.scrollTo({
  //       behavior: "smooth",
  //       top: resultsRef.current.offsetTop
  //     });
  //   }
  // }, [loading]);

  if (loading)
    return (
      <div>
        <h4>Loading...</h4>
      </div>
    );
  if (error)
    return (
      <div>
        <h1>An Error Ocurred</h1>
        <h3>{error.toString()}</h3>
      </div>
    );

  let maxCount = result.reduce(function(max, obj) {
    return obj.Count > max.Count ? obj : max;
  });
  const popScale = scaleLinear()
    .domain([0, maxCount.Count / 2, maxCount.Count])
    .range(["#28af48", "#edbb1a", "#f72020"]);
  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  console.log(result);
  return (
    <div style={wrapperStyles}>
      <ComposableMap
        projectionConfig={{
          scale: 205
        }}
        height={1000}
        style={{
          width: "100%",
          height: "auto"
        }}
      >
        <ZoomableGroup center={[146, -23]} zoom={18}>
          <Geographies geography="/maps/qld.json">
            {(geographies, projection) =>
              geographies.map((geography, i) => {
                let lgaName = geography.properties.qld_lga__2 + " Council";

                var resultObject = result.find(
                  x =>
                    x["Local Government"].toUpperCase() ===
                    lgaName.toUpperCase()
                );
                let count = 0;
                if (!resultObject) {
                  console.log("Couldnt find: " + lgaName);
                } else {
                  count = resultObject.Count;
                  console.log(lgaName + ": " + count);
                }

                return (
                  <Geography
                    key={i}
                    geography={geography}
                    projection={projection}
                    style={{
                      default: {
                        fill: popScale(count),
                        stroke: "#607D8B",
                        strokeWidth: 0.15,
                        outline: "none"
                      },
                      hover: {
                        fill: "#FF5722",
                        stroke: "#607D8B",
                        strokeWidth: 0.15,
                        outline: "none"
                      },
                      pressed: {
                        fill: "#FF5722",
                        stroke: "#607D8B",
                        strokeWidth: 0.15,
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

export function MapPage() {
  const [filters, setFilter] = useState("");
  return (
    <div>
      <Offences onSubmit={setFilter} />
      {filters ? <Results filters={filters} /> : ""}
    </div>
  );
}
