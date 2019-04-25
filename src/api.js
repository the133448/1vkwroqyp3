import { useState, useEffect } from "react";
import { Redirect } from "react-router";

let API_KEY = null;
const API_PATH = "https://cab230.hackhouse.sh/";

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

export function isLoggedIn() {
  if (localStorage.getItem("API_KEY")) {
    //     100  (current time) >   150 (expires time)
    if (new Date().getTime() >= localStorage.getItem("EXPIRES_KEY")) {
      alert("Whoops, your session has expired. Please login again.");

      logOut();
      return false;
    }
    return true;
  }
}

export function UpdateLogon() {
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

export function useSearch(offence, filter) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState([]);
  let query = `offence=${offence}&${filter}`;

  useEffect(() => {
    setLoading(true);
    getSearch(query)
      .then(result => {
        console.log("result was  ok");
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
  }, [offence]);
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
        lga: item.LGA,
        count: item.total
      }))
    );
}
