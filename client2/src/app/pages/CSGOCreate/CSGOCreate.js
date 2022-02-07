import React, {useState} from 'react';
import axios from 'axios';
import './CSGOCreate.css';
import {withRouter} from 'react-router-dom';
import { Input, Button } from 'antd';

const { TextArea } = Input;

function CSGOCreate(props) {
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");

  const [team1Player1, setTeam1Player1] = useState("");
  const [team1Player2, setTeam1Player2] = useState("");
  const [team1Player3, setTeam1Player3] = useState("");
  const [team1Player4, setTeam1Player4] = useState("");
  const [team1Player5, setTeam1Player5] = useState("");

  const [team2Player1, setTeam2Player1] = useState("");
  const [team2Player2, setTeam2Player2] = useState("");
  const [team2Player3, setTeam2Player3] = useState("");
  const [team2Player4, setTeam2Player4] = useState("");
  const [team2Player5, setTeam2Player5] = useState("");

  const [team1Description, setTeam1Description] = useState("");
  const [team2Description, setTeam2Description] = useState("");
  const [error, setError] = useState(null);

  function createMatch() {
    if (checkValidity()) {
      const data = {
        team1: team1Name,
        team2: team2Name,
        description1: team1Description,
        description2: team2Description,
        players1: [team1Player1, team1Player2, team1Player3, team1Player4, team1Player5],
        players2: [team2Player1, team2Player2, team2Player3, team2Player4, team2Player5]
      };
      axios.post("http://localhost:8000/create/csgo-match", data
      ).then( resp => {
        setError(null);
        props.history.push("/login");
      }).catch( err => {
        setError(err.response?.data?.error || "Unknown Error");
      })
    }
  }

  function checkValidity() {
    return (team1Name !== "" && team2Name !== "" && team1Description !== "" && team2Description !== "" &&
      team1Player1 !== "" && team1Player2 !== "" && team1Player3 !== "" && team1Player4 !== "" && team1Player5 !== "" &&
      team2Player1 !== "" && team2Player2 !== "" && team2Player3 !== "" && team2Player4 !== "" && team2Player5 !== "")
  }

  return (
    <div className={"create-container"}>
      <form onSubmit={(e) => {e.preventDefault()}}>
        <div className={"team-wrapper"}>
          <div>
            <div className={"team-header"}>Team 1</div>
            <Input
              size="large"
              placeholder="Username"
              value={team1Name}
              style={{marginBottom: "32px"}}
              onChange={(event) => setTeam1Name(event.target.value)}
            />
            <TextArea
              rows={4}
              size="large"
              placeholder="Description"
              value={team1Description}
              style={{marginBottom: "48px"}}
              onChange={(event) => setTeam1Description(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player1"
              value={team1Player1}
              style={{marginBottom: "12px"}}
              onChange={(event) => setTeam1Player1(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player2"
              value={team1Player2}
              style={{marginBottom: "12px"}}
              onChange={(event) => setTeam1Player2(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player3"
              value={team1Player3}
              style={{marginBottom: "12px"}}
              onChange={(event) => setTeam1Player3(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player4"
              value={team1Player4}
              style={{marginBottom: "12px"}}
              onChange={(event) => setTeam1Player4(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player5"
              value={team1Player5}
              style={{marginBottom: "32px"}}
              onChange={(event) => setTeam1Player5(event.target.value)}
            />
          </div>
          <div>
            <div className={"team-header"}>Team 2</div>
            <Input
              size="large"
              placeholder="Username"
              value={team2Name}
              style={{marginBottom: "32px"}}
              onChange={(event) => setTeam2Name(event.target.value)}
            />
            <TextArea
              rows={4}
              size="large"
              placeholder="Description"
              value={team2Description}
              style={{marginBottom: "48px"}}
              onChange={(event) => setTeam2Description(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player1"
              value={team2Player1}
              style={{marginBottom: "12px"}}
              onChange={(event) => setTeam2Player1(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player2"
              value={team2Player2}
              style={{marginBottom: "12px"}}
              onChange={(event) => setTeam2Player2(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player3"
              value={team2Player3}
              style={{marginBottom: "12px"}}
              onChange={(event) => setTeam2Player3(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player4"
              value={team2Player4}
              style={{marginBottom: "12px"}}
              onChange={(event) => setTeam2Player4(event.target.value)}
            />
            <Input
              size="small"
              placeholder="Player5"
              value={team2Player5}
              style={{marginBottom: "32px"}}
              onChange={(event) => setTeam2Player5(event.target.value)}
            />
          </div>
        </div>
        <Button
          block
          type="primary"
          size="large"
          onClick={createMatch}
        >
          Create Match
        </Button>
      </form>
      {error &&
      <div className={"error-container"}>
        <span className={"error-text"}>{error}</span>
      </div>
      }

    </div>
  )
}

export default withRouter(CSGOCreate);
