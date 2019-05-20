import React, { useEffect, useState, useRef, Fragment } from "react";
import { Link, Redirect } from "react-router-dom";
import { useList, useSearch, logOut } from "../api";
import { scaleLinear } from "d3-scale";
import ReactTooltip from "react-tooltip";
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
    <div>
      <h3 className="capital">{props.field}s </h3>
      {props.field === "offence" ? (
        <Select
          className="map-filter"
          id={props.field}
          onChange={handleChange}
          isLoading={props.loading}
          placeholder={"Choose offence (required)"}
          options={options}
        />
      ) : (
        <Select
          className="map-filter"
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
  const getBtn = () => {
    <div class="lds-hourglass" />;
  };
  return (
    <div className="OffenceChooser">
      <div className="modal-container">
        <h1>Map Offences </h1>
        <div className="map-Container">
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
            disabled={props.loading ? true : offenceValidate ? false : true}
            onClick={() => handleSubmit()}
          >
            {offenceValidate
              ? props.loading
                ? "Loading"
                : `Search`
              : "An offence is required"}
          </button>
          {props.loading ? getBtn() : ""}
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
  let { loading, result, error } = useSearch(props.filters);
  const [type, setType] = useState(0);
  const [mapLoading, setMapLoading] = useState(true);
  const [color, setColor] = useState({});
  let resultsRef = useRef();
  if (loading) {
    return <h1>Please wait data loading</h1>;
  }

  console.log("Rerendeer!!!");
  const toggleType = () => {
    console.log("Changing Type");
    if (type) setType(0);
    else setType(1);
  };
  //props.error(error);
  const { filters, loadState } = props;

  if (error)
    return (
      <div>
        <h1>An Error Ocurred</h1>
        <h3>{error.toString()}</h3>
      </div>
    );

  var data = require("./pop.json");

  result = result.map((obj1, index) => {
    const obj2 = data[index];
    //assert: obj1.name === obj2.name

    return {
      lga: obj1["Local Government"].toUpperCase(),
      Count: obj1.Count,
      pop: obj2.pop,
      result: isFinite(obj2.pop / obj1.Count)
        ? obj2.pop / obj1.Count
        : undefined
    };
  });

  var results = {};
  for (var i = 0; i < result.length; i++) {
    results[result[i].lga] = {
      lga: result[i].lga,
      Count: result[i].Count,
      pop: result[i].pop,
      result: result[i].result
    };
  }
  const numsOnly = result.map(({ result }) => result);
  const min = Math.min(...numsOnly.filter(isFinite));
  const max = Math.max(...numsOnly.filter(isFinite));
  const countOnly = result.map(({ Count }) => Count);
  const maxCount = Math.max(...countOnly);
  console.log(result);
  console.log("min: ", min);
  console.log("max: ", max);
  const popCol = scaleLinear()
    .domain([max, max / 2, min * 2, min])
    .range(["#ffffff", "#74C67A", "#1D9A6C", "#000102"]);
  //100  0.5
  const countCol = scaleLinear()
    .domain([0, maxCount / 8, maxCount / 3, maxCount])
    .range(["#ffffff", "#74C67A", "#1D9A6C", "#000102"]);
  const handleLoad = () => {
    setMapLoading(false);
    if (resultsRef.current) {
      window.scrollTo({
        behavior: "smooth",
        top: resultsRef.current.offsetTop
      });
    }
    ReactTooltip.rebuild();
  };
  return (
    <div style={wrapperStyles} ref={resultsRef}>
      {mapLoading ? (
        <h4>Loading...</h4>
      ) : (
        <Fragment>
          {/* test */}
          <h1>
            Coloured by:{" "}
            {type ? "Population and Offence Count" : "Offence Count #"}
          </h1>
          <a onClick={toggleType} class="float">
            <p>Colour by {type ? "Offences" : "Population/Offences"}</p>
          </a>
        </Fragment>
      )}

      <ComposableMap
        projectionConfig={{
          scale: 205
        }}
        height={1500}
        style={{
          width: "100%",
          height: "auto"
        }}
      >
        <ZoomableGroup center={[146, -23]} zoom={18} disablePanning>
          <Geographies
            geography="/maps/qld.json"
            onGeographyPathsLoaded={handleLoad}
            disableOptimization={true}
          >
            {(geographies, projection) =>
              geographies.map((geography, i) => {
                let lgaName = geography.properties.qld_lga__2 + " COUNCIL";

                // var resultObject = result.find(
                //   x => x.lga.toUpperCase() === lgaName.toUpperCase()
                // );

                if (!results[lgaName]) {
                  results[lgaName] = {
                    lga: lgaName,
                    Count: 0,
                    pop: "Unkown",
                    result: Infinity,
                    exists: false
                  };
                }
                const { Count, pop, result } = results[lgaName];
                return (
                  <Geography
                    key={i}
                    data-tip={
                      lgaName +
                      ": Offences " +
                      Count +
                      ", Population " +
                      pop +
                      ", Offence per Capita 1/" +
                      result
                    }
                    geography={geography}
                    projection={projection}
                    style={{
                      default: {
                        fill: type
                          ? isFinite(result)
                            ? popCol(result)
                            : "#ffffff"
                          : countCol(Count),
                        stroke: "#607D8B",
                        strokeWidth: 0.1,
                        outline: "none"
                      },
                      hover: {
                        fill: "#FF5722",
                        stroke: "#607D8B",
                        strokeWidth: 0.1,
                        outline: "none"
                      },
                      pressed: {
                        fill: "#FF5722",
                        stroke: "#607D8B",
                        strokeWidth: 0.1,
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
      <ReactTooltip />
    </div>
  );
}

export function MapPage() {
  const [filters, setFilter] = useState("");
  const [dataLoading, setDataLoading] = useState(false);

  const test = () => {
    console.log("test");
    setDataLoading(true);
  };
  const test2 = () => {
    console.log("test");
    setDataLoading(false);
  };
  return (
    <div>
      <button onClick={test}>Test Button :D</button>
      <button onClick={test2}>enable :D</button>
      <Offences onSubmit={setFilter} loading={dataLoading} />
      {filters ? <Results filters={filters} /> : ""}
    </div>
  );
}
