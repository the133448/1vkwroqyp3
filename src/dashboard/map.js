import React, { useEffect, useState, useRef, Fragment } from "react";
import { Link, Redirect } from "react-router-dom";
import { useList, useSearch, logOut } from "../api";
import { Loader } from "./common";
import { scaleLinear } from "d3-scale";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";

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
        </div>
      </div>
    </div>
  );
}

const wrapperStyles = {
  width: "100%",
  maxWidth: 980
};

function getLongNumberFormat(num) {
  console.log(num);
  num = num + ""; // coerce to string
  if (num < 1000) {
    // var n = num.toFixed(3)
    return parseFloat(num).toFixed(2);
    //return Math.round(num); // return the same number
  }
  if (num < 10000) {
    // place a comma between
    return num.charAt(0) + "," + num.substring(1);
  }
  // divide and format
  return (num / 1000).toFixed(num % 1000 !== 0) + "k";
}

function d3NonSIformat(d) {
  if (d > 1) {
    return d3.format(".2s")(d);
  }
  // return no SI formatting
  return d3.format(".2")(d);
}

function GenLegend(props) {
  let svgLegend = d3.select(props.name);
  svgLegend.html("");
  var defs = svgLegend.append("defs");

  // append a linearGradient element to the defs and give it a unique id

  var linearGradientCount = defs
    .append("linearGradient")
    .attr("id", "#legend-count");

  // horizontal gradient
  linearGradientCount
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  // #ffffff", "#74C67A", "#1D9A6C", "#000102

  // append multiple color stops by using D3's data/enter step
  linearGradientCount
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#ffffff" },
      { offset: "12.5%", color: "#74C67A" },
      { offset: "33%", color: "#1D9A6C" },
      { offset: "100%", color: "#000102" }
    ])
    .enter()
    .append("stop")
    .attr("offset", function(d) {
      return d.offset;
    })
    .attr("stop-color", function(d) {
      return d.color;
    });
  const popId = "#legend-pop".concat(props.lower, props.upper);
  var linearGradientPop = defs.append("linearGradient").attr("id", popId);

  // horizontal gradient
  linearGradientPop
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  // #ffffff", "#74C67A", "#1D9A6C", "#000102

  // append multiple color stops by using D3's data/enter step
  // to calc 2nd/3rd value x% we need to do: (lower-value)/(lower-upper) *100

  const diff = props.lower - props.upper;
  let secondStop = ((props.lower - props.lower / 2) / diff) * 100 + "%";
  let thirdStop = ((props.lower - props.upper * 2) / diff) * 100 + "%";
  console.log("2: ", secondStop, "% 3:", thirdStop, "%.");
  // .range(["#fff7ec", "#fdbb84", "#d7301f", "#7f0000"]);
  linearGradientPop
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#fff7ec" },
      { offset: secondStop, color: "#fdbb84" },
      { offset: thirdStop, color: "#d7301f" },
      { offset: "100%", color: "#7f0000" }
    ])
    .enter()
    .append("stop")
    .attr("offset", function(d) {
      return d.offset;
    })
    .attr("stop-color", function(d) {
      return d.color;
    });

  // linearGradient
  //   .selectAll("stop")
  //   .data(props.scale.domain())
  //   .enter()
  //   .append("stop")
  //   .attr("offset", function(d) {
  //     return d + "%";
  //   })
  //   .attr("stop-color", function(d) {
  //     return props.scale(d);
  //   });

  // append title
  svgLegend
    .append("text")
    .attr("class", "legendTitle")
    .attr("x", 0)
    .attr("y", 20)
    .style("text-anchor", "left")
    .text(props.string);

  // draw the rectangle and fill with gradient
  svgLegend
    .append("rect")
    .attr("x", 10)
    .attr("y", 30)
    .attr("width", 400)
    .attr("height", 15)
    .style(
      "fill",
      `url(#${props.name === "#legend-count" ? "#legend-count" : popId})`
    );

  //create tick marks
  var xLeg = d3
    .scaleLinear()
    .domain([props.lower, props.upper])
    .range([10, 400]);

  var axisLegCount = d3
    .axisBottom(xLeg)
    .tickValues(props.scale.domain())
    .tickFormat(d3NonSIformat);
  var axisLegPop = d3
    .axisBottom(xLeg)
    .tickValues([props.lower, props.lower / 2, props.upper])
    .tickFormat(d3NonSIformat);
  //.tickFormat(getLongNumberFormat());
  svgLegend
    .attr("class", "axis")
    .append("g")
    .attr("transform", "translate(0, 40)")
    .call(props.name === "#legend-count" ? axisLegCount : axisLegPop);
  return <> </>;
}

function Results(props) {
  let { loading, result, error } = useSearch(props.filters);
  const [type, setType] = useState(0);
  const [mapLoading, setMapLoading] = useState(true);
  let resultsRef = useRef();

  const toggleType = () => {
    if (type) setType(0);
    else setType(1);
  };

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
  console.log("min: ", min);
  console.log("max: ", max);

  const popCol = scaleLinear()
    .domain([max, max / 2, min * 2, min])
    .range(["#fff7ec", "#fdbb84", "#d7301f", "#7f0000"]);
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
  if (!loading) {
  }
  return (
    <div style={wrapperStyles} ref={resultsRef}>
      <Loader on={loading} />
      {mapLoading ? (
        ""
      ) : (
        <Fragment>
          {/* test */}
          <h1>By: {type ? "Offences per Capita" : "Offence Count"}</h1>
          {loading ? <h1>loading</h1> : ""}
          <a onClick={toggleType} className="float">
            <p>Colour by {type ? "Offences" : "Offences per Capita"}</p>
          </a>
        </Fragment>
      )}
      <GenLegend
        scale={countCol}
        upper={maxCount}
        lower={0}
        name="#legend-count"
        string="Offences Legend"
      />
      <GenLegend
        scale={popCol}
        upper={min}
        lower={max}
        name="#legend-pop"
        string="Offences/Capita Legend"
      />
      <div className="legends">
        <svg id="legend-count" className="legend" />
        <svg id="legend-pop" className="legend" />
      </div>

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
                    pop: "Unknown",
                    result: undefined,
                    exists: false
                  };
                }
                const { Count, pop, result } = results[lgaName];
                let resultS = "";
                if (result)
                  resultS =
                    ", Offence per Capita 1/" + getLongNumberFormat(result);
                return (
                  <Geography
                    key={i}
                    data-tip={
                      lgaName +
                      "<br />Offences " +
                      getLongNumberFormat(Count) +
                      ", Population " +
                      getLongNumberFormat(pop) +
                      resultS
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
      <ReactTooltip multiline={true} />
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
