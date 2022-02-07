import React, {useState} from 'react';
import './Login.css'
import axios from 'axios';
import auth from "../../services/auth";
import { Input, Button } from 'antd';
import {Redirect, withRouter} from "react-router-dom";


function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  if (auth.isAuthenticated()) {
    return (
      <Redirect to={{
        pathname: "/",
      }} />
    )
  }

  function login() {
    if (username !== "" && password !== "") {
      axios.get("http://localhost:8000/login", {
        params: {
          login: username,
          password: password
        }
      }).then( resp => {
        setError(null);
        auth.login(JSON.stringify(resp.data));
        props.history.push("/");
      }).catch( err => {
        setError(err.response.data.error);
      })
    }
  }

  return(
    <div className={"login-container"}>
      <form onSubmit={(e) => {e.preventDefault()}}>
        <div className={"text-field"}>
          <Input
            size="large"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div className={"text-field"}>
          <Input
            size="large"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className={"text-field"}>
          <Button
            block
            type="primary"
            size="large"
            onClick={login}
          >
            Login
          </Button>
        </div>
      </form>
      {error &&
      <div className={"error-container"}>
        <span className={"error-text"}>{error}</span>
      </div>
      }

    </div>
  )
}

export default withRouter(Login);
