import React, { useEffect, useState } from "react";
import { useList } from "../api";
import Select from "react-select";
export function Loader(props) {
  const [loading, setLoading] = useState(true);
  //We need to keep track of the loading icon so we can animate it in/out
  useEffect(() => {
    console.log("Loading changed checkign....");
    if (!props.on) {
      //we only need to remove it once the animation has finished
      //the fade out animation is 20ms
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
    //so that the loader state can be reset for next use we need to set it here
    else setLoading(true);
  }, [props.on]);

  if (loading)
    return (
      <div
        className={
          props.on ? "loading animated fadeIn" : "loading animated-20ms fadeOut"
        }
      >
        {console.log("Spinner: ", props.on)}
        <div className="loader" />
        <h5 className="loading-text">Data loading...</h5>
      </div>
    );
  //If no loaders neccesary return an empty div, keeping the loader onscreen
  //but hidden makes the page unclickable :(
  else return <div />;
}

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

export function Offences(props) {
  const [offence, setOffence] = useState([]);
  const [age, setAge] = useState([]);
  const [gender, setGender] = useState([]);
  const [year, setYear] = useState([]);
  const [month, setMonth] = useState([]);
  const [area, setArea] = useState([]);

  let offenceValidate = false;
  if (offence.length >= 1) {
    offenceValidate = true;
  }

  const filters = {
    offence,
    age,
    gender,
    year,
    month,
    area
  };

  const handleSubmit = () => {
    props.onSubmit(filters);
  };

  return (
    <div className="OffenceChooser">
      <div className="modal-container">
        <h1>Search Offences </h1>
        <div className="filter-container">
          <DataFilterItem field="offence" updateFilter={setOffence} />
          {props.type === 2 ? (
            <DataFilterItem
              field="area"
              updateFilter={setArea}
              disabled={offenceValidate ? false : true}
            />
          ) : (
            ""
          )}
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
