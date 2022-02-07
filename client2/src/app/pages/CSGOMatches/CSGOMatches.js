import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { withRouter } from "react-router-dom";
import logo from "../../../assets/CSGO-Logo.png"
import {Button, Input, Select} from 'antd';
import auth from "../../services/auth";
import "./CSGOMatches.css"

const CSGOMatches = (props) => {
  const [matches, setMatches] = useState([]);
  const [closedMatches, setClosedMatches] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/csgomatches', {
    }).then((response) => {
      console.log(response.data.filter(match => match.isOpen));
      setMatches(response.data.filter(match => match.isOpen));
      setClosedMatches(response.data.filter(match => !match.isOpen));
    }).catch(error => {
      console.warn(error);
    });
  },[]);

  const createMatch = () => {
    props.history.push("/csgo-create");
  };

  const goToMatch = (matchId) => {
    props.history.push(`/csgo/${matchId}`);
  };

  return (
    <div className="matches-container">
      <img className="csgo-logo" alt="CSGO_Logo" src={logo}/>
      {auth.isAdmin() &&
      <Button
        block
        type="primary"
        size="large"
        onClick={createMatch}
      >
        Add Match
      </Button>}
      <div className={"matches-header"}>
        Upcoming Matches
      </div>
      {
        matches.map((match, index)=>(
          <div className={"csgo-match"} key={index}  onClick={()=>goToMatch(match._id)}>
            {match.team1.name} - {match.team2.name}
          </div>
        ))
      }
      { matches.length === 0 &&
        <div>
          No Upcoming Matches
        </div>
      }

      <div className={"matches-header"}>
        Past Matches
      </div>
      {
        closedMatches.map((match, index)=>(
          <div className={`csgo-match ${parseInt(match.results.team1.score) > parseInt(match.results.team2.score) ? "left-win" : "right-win"}`} key={index}  onClick={()=>goToMatch(match._id)}>
            {match.team1.name} - {match.team2.name}
          </div>
        ))
      }
      { closedMatches.length === 0 &&
      <div>
        No Past Matches
      </div>
      }
    </div>
  )
};

export default withRouter(CSGOMatches);
