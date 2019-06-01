import React, { useEffect, useState, useRef } from "react";
import { useSearch } from "../api";
import SmartDataTable from "react-smart-data-table";

import { Loader, Offences } from "./common";

function Results(props) {
  const { loading, result, error } = useSearch(props.filters);
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

  if (error)
    return (
      <div>
        <h1>An Error Ocurred</h1>
        <h3>{error.toString()}</h3>
      </div>
    );
  return (
    <div ref={resultsRef}>
      <Loader on={loading} />

      <h3>Results for: {props.filters.offence[0]}</h3>
      <div>
        <label>Find a local government </label>
        <input
          value={search}
          onChange={event => {
            setSearch(event.target.value);
          }}
        />
      </div>

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

export function SearchPage() {
  const [filters, setFilter] = useState("");
  return (
    <div>
      <Offences onSubmit={setFilter} />
      {filters ? <Results filters={filters} /> : ""}
    </div>
  );
}
