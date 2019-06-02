import React, { useEffect, useState, useRef } from "react";
import { useMultiSearch } from "../api";

import { Line } from "react-chartjs-2";
import { Loader, Offences } from "./common";
//helper to generate chart.js Line graph
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

function Results(props) {
  const { loading, result, error } = useMultiSearch(props.filters);
  let resultsRef = useRef();
  useEffect(() => {
    //smooth scrollling to content on load
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
  //sort the result from lowest to highest year
  const sortResult = result.sort();
  //return 1D from 2D array
  const label = sortResult.map(function(value) {
    return value[0];
  });
  const data = sortResult.map(function(value) {
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

      <Offences onSubmit={setFilter} type={2} />
      {filters ? <Results filters={filters} /> : ""}
    </>
  );
}
