import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { useLogin } from "./api";

export function AuthPage(props) {
  const [login, setLogin] = useState("");
  return props.login ? (
    <LoginPage prefill={login} />
  ) : (
    <RegisterPage onSubmit={setLogin} />
  );
}

function LoginPage(props) {
  const [loginData, setloginData] = useState(null);
  const { loading, error } = useLogin(loginData, true);

  return (
    <FormPage
      login={true}
      loading={loading}
      error={error}
      prefill={props.prefill}
      onSubmit={setloginData}
    />
  );
}

function RegisterPage(props) {
  const [loginData, setloginData] = useState(null);
  const { loading, error } = useLogin(loginData, false);
  if (error === 111) props.onSubmit(loginData);

  return (
    <FormPage
      login={false}
      loading={loading}
      error={error}
      onSubmit={setloginData}
    />
  );
}

function FormPage(props) {
  let prefill = false;
  function submitEvent(event) {
    event.preventDefault();

    const data = new URLSearchParams(new FormData(event.target));
    props.onSubmit(data);
  }
  if (props.prefill) {
    prefill = true;
  }
  if (props.error === 999 || props.error === 111)
    return <Redirect to="/login" />;

  return (
    <div className="login App">
      <img className="logo" src="./logo-min.png" alt="QLD Police Logo" />
      <div className="login-screen">
        <div className="app-title">
          <h1>{props.login ? "Login" : "Register"}</h1>
          <h3>to QLD POLICE</h3>
          <h3>Dashboard</h3>
        </div>
        {props.error ? (
          <div className="alert error">
            <strong>Error!</strong>
            <br />

            {props.error}
          </div>
        ) : null}
        {prefill ? (
          <div className="alert success">
            <strong>Success!</strong>
            <br />
            Please Login now
          </div>
        ) : null}

        <form onSubmit={submitEvent}>
          <input
            type="email" //TODO Change to email
            className="login-field"
            placeholder="email"
            id="email"
            name="email"
            value={prefill ? props.prefill.get("email") : undefined}
          />
          <input
            type="password"
            className="login-field"
            placeholder="password"
            id="password"
            name="password"
            value={prefill ? props.prefill.get("password") : undefined}
          />

          <button
            type="submit"
            className="btn btn-primary btn-large btn-block"
            disabled={props.loading}
          >
            {props.loading ? "Please wait" : props.login ? "Login" : "Register"}
          </button>
        </form>
        <div className="sign-up">
          <p className="su-text">
            {props.login ? "Don't h" : "H"}ave an account?{" "}
          </p>
          <Link
            to={props.login ? "/register" : "/login"}
            className="sign-up-text"
          >
            {props.login ? "Register" : "Login"} Now
          </Link>
        </div>
      </div>
    </div>
  );
}
