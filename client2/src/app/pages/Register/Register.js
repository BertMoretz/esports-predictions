import React, {useState} from 'react';
import axios from 'axios';
import './Register.css';
import {withRouter} from 'react-router-dom';
import { Input, Radio, Button } from 'antd';

function Register(props) {
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  function register() {
    if (username !== "" && password !== "" &&
      gender !== null) {
      const data = {
        username: username,
        password: password,
        gender: gender,
      };
      axios.post(`http://${global.config.SERVER_HOST}:8000/register`, data
      ).then( resp => {
        setError(null);
        props.history.push("/login");
      }).catch( err => {
        setError(err.response?.data?.error || "Unknown Error");
      })
    }
  }

  return (
    <div className={"register-container"}>
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
          Choose gender: {"  "}
          <Radio.Group buttonStyle="solid" onChange={(event) => setGender(event.target.value)} value={gender}>
            <Radio.Button value={"male"}>Male</Radio.Button>
            <Radio.Button value={"female"}>Female</Radio.Button>
            <Radio.Button value={"other"}>Other</Radio.Button>
          </Radio.Group>
        </div>
        <div className={"text-field"}>
          <Button
            block
            type="primary"
            size="large"
            onClick={register}
          >
            Register
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

export default withRouter(Register);
