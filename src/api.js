import { useState, useEffect } from "react";

let API_KEY = null;
let API_PATH = null;

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  API_PATH = "https://capstone-ato-api.herokuapp.com/";
  //API_PATH = "https://cab230-api.bgscoffee.com/";
} else {
  API_PATH = "/api/";
}

export function useLogin(data, type) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endpoint = type ? "login" : "register";
  useEffect(() => {
    if (data === null) {
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    fetch(`${API_PATH}${endpoint}`, {
      method: "POST",
      body: data,
      headers: {
        "Content-type": "application/x-www-form-urlencoded"
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        //setError("Failed to communicate with Login server");
        return response.text().then(text => {
          throw new Error(text);
        });
      })
      .then(result => {
        setLoading(false);
        if (type) {
          setLogin(result.token, result.expires_in, data);
          setError(999);
        } else {
          setError(111);
        }
      })
      .catch(error => {
        setLoading(false);
        if (error.message === "Failed to fetch")
          setError("Unable to communicate with Logon Server");
        else setError(JSON.parse(error.message).message);
      });
  }, [data, type, endpoint]);
  return {
    loading,
    error: error
  };
}

function setLogin(key, expires, logon) {
  localStorage.setItem("API_KEY", key);
  const exp = new Date().getTime() + expires * 1000;
  localStorage.setItem("EXPIRES_KEY", exp);
  localStorage.setItem("EMAIL", logon.get("email"));

  API_KEY = key;
}

export function logOut() {
  localStorage.clear();
}

//isLoggedIn Returns
// 0 - No Login Info Found
// 1 Logged in (Valid Session)
// 2 Logged in - Session Expired

export function isLoggedIn() {
  //console.log("checking if user is logged in");
  if (localStorage.getItem("API_KEY")) {
    //console.log("found API KEY");
    //     100  (current time) >   150 (expires time)

    if (new Date().getTime() >= localStorage.getItem("EXPIRES_KEY")) {
      console.log("$$$found INVALID API key");
      localStorage.clear();
      return 2; // Seesion Expired
    }
    //console.log("found VALID API KEY");
    return 1; // Logged in
  }
  //console.log("Didnt find key");
  return 0; // No Login info found
}

export function UpdateLogon() {
  //console.log("updating login");
  API_KEY = localStorage.getItem("API_KEY");
}

export function useList(endPath) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lists, setLists] = useState([]);
  useEffect(() => {
    getList(endPath)
      .then(lists => {
        const [result] = Object.values(lists);
        setLists(result);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        if (error.message === "Failed to fetch")
          setError("Unable to communicate with API Server");
        else setError(JSON.parse(error.message).message);
      });
  }, [endPath]);
  return {
    loading,
    lists,
    error: error
  };
}

function getList(list) {
  const endPoint = `${API_PATH}${list}`;
  return fetch(endPoint).then(res => res.json());
}

export function useSearch(params) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState([]);

  useEffect(() => {
    setLoading(true);
    const esc = encodeURIComponent;
    const query = Object.keys(params)
      .map(k => esc(k) + "=" + esc(params[k]))
      .join("&");
    console.log(query);

    getSearch(query)
      .then(result => {
        //setError("Failed to communicate with Login server");
        setResult(result);
        setLoading(false);
      })
      .catch(resError => {
        setLoading(false);
        if (resError.message === "Failed to fetch")
          setError("Unable to communicate with API Server");
        else setError(JSON.parse(resError.message).error);
      });
  }, [params]);
  return {
    loading,
    result,
    error
  };
}

function getSearch(offence) {
  const endPoint = `${API_PATH}search?${offence}`;
  return fetch(endPoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  })
    .then(result => {
      if (result.ok) {
        return result.json();
      }
      //setError("Failed to communicate with Login server");
      return result.text().then(text => {
        throw new Error(text);
      });
    })
    .then(res => res.result)
    .then(result =>
      result.map(item => ({
        "Local Government": item.LGA,
        Count: item.total
      }))
    );
}

export function useMultiSearch(params) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState([]);

  useEffect(() => {
    setLoading(true);
    //We need to take this out as we artifically add in a year to the query

    delete params.year;

    const esc = encodeURIComponent;

    const query = Object.keys(params)
      .map(k => esc(k) + "=" + esc(params[k]))
      .join("&");
    console.log(query);
    let dataset = [];
    const fillRange = (start, end) => {
      return Array(end - start + 1)
        .fill()
        .map((item, index) => start + index);
    };
    let yearRange = fillRange(2001, 2019);
    try {
      var fetches = [];
      for (var i = 0; i < yearRange.length; i++) {
        fetches.push(
          getMultiSearch(query, yearRange[i])
            .then(result => {
              //setError("Failed to communicate with Login server");
              dataset.push(result);
            })
            .catch(resError => {
              setLoading(false);
              if (resError.message === "Failed to fetch")
                setError("Unable to communicate with API Server");
              else setError(JSON.parse(resError.message).error);
            })
        );
      }
      Promise.all(fetches).then(function() {
        console.log("DATA: ", dataset);
        setResult(dataset);
        setLoading(false);
      });
    } catch (err) {
      console.log(err);
    }
  }, [params]);
  return {
    loading,
    result,
    error
  };
}

function getMultiSearch(offence, year) {
  let endPoint = `${API_PATH}search?${offence}`;
  endPoint = endPoint + `&year=${year}`;

  return fetch(endPoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  })
    .then(result => {
      if (result.ok) {
        return result.json();
      }
      //setError("Failed to communicate with Login server");
      return result.text().then(text => {
        throw new Error(text);
      });
    })
    .then(res => res.result)
    .then(result => {
      let count = 0;
      result.forEach(function(item) {
        count += item.total;
      });

      return [year, count];
      // result.map(item => ({
      //   "Local Government": item.LGA,
      //   Count: item.total
      // }));
    });
}
