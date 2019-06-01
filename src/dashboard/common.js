import React, { useEffect, useState } from "react";
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
