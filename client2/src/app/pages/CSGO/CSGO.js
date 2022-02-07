import React, {useState, useEffect} from 'react';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import axios from 'axios';
import { withRouter } from "react-router-dom";
import {Button, Input, Select} from 'antd';
import auth from "../../services/auth";
import "./CSGO.css"

const { Option } = Select;

const CSGO = (props) => {
  const [matchDetails, setMatchDetails] = useState(null);
  const [team1Score, setTeam1Score] = useState(null);
  const [team2Score, setTeam2Score] = useState(null);
  const [roundsData, setRoundsData] = useState([]);
  const [rounds, setRounds] = useState(0);
  const [error, setError] = useState(null);
  const [submittedPrediction, setSubmittedPrediction] = useState(null);
  const [results, setResults] = useState(null);
  const [aggregation, setAggregation] = useState(null);

  useEffect(() => {
    const team1 = team1Score || 0;
    const team2 = team2Score || 0;
    setRounds(parseInt(team1) + parseInt(team2));
  }, [team1Score, team2Score]);

  useEffect(() => {
    const diff = rounds - roundsData.length;
    if (diff > 0) {
      const additionalRounds = [];
      for (let i = 0; i < diff; i++) {
        additionalRounds.push(
          {
            winner: submittedPrediction ? submittedPrediction.predictions[i].winner : "",
            mvp: submittedPrediction ? submittedPrediction.predictions[i].mvp :  ""
          }
        );
      }
      setRoundsData((oldContent) => [...oldContent, ...additionalRounds]);
    } else {
      const trimmedRounds = roundsData.slice(diff);
      setRoundsData(() => [...trimmedRounds]);
    }
  }, [rounds]);

  useEffect(() => {
    if (submittedPrediction) {
      setTeam1Score(submittedPrediction.team1.score);
      setTeam2Score(submittedPrediction.team2.score);
    }
  }, [submittedPrediction]);

  useEffect(() => {
    const matchId = props.match.params.id;
    axios.get(`http://${global.config.SERVER_HOST}:8000/match-details`, {
      params: {
        matchId: matchId
      }
    }).then( resp => {
      console.log(resp.data);
      setMatchDetails(resp.data);
      if (!resp.data.isOpen) {
        console.log(resp.data.results);
        setResults(resp.data.results);
        if (auth.isAdmin()) {
          setSubmittedPrediction(resp.data.results);
        }
      }
    }).catch( err => {
      console.warn(err.response.data.error);
    })
  }, []);

  useEffect(() => {
    if (!matchDetails?.isOpen) {
      const matchId = props.match.params.id;
      axios.get(`http://${global.config.SERVER_HOST}:8000/predictions-analysis`, {
        params: {
          matchId: matchId
        }
      }).then( resp => {
        setAggregation(resp.data);
      }).catch( err => {
        console.warn(err.response.data.error);
      })
    }
  }, [matchDetails]);

  useEffect(() => {
    const matchId = props.match.params.id;
    const username = auth.getUsername();
    axios.get(`http://${global.config.SERVER_HOST}:8000/prediction`, {
      params: {
        matchId: matchId,
        username: username
      }
    }).then( resp => {
      if (!auth.isAdmin()) {
        setSubmittedPrediction(resp.data);
      }
    }).catch( err => {
      console.warn(err.response.data.error);
    })
  }, []);

  const updateWinner = (index, value) => {
    let items = [...roundsData];
    let item = {...roundsData[index]};
    item.winner = value;
    items[index] = item;
    setRoundsData(items);
  };

  const checkAmountOfRounds = (currentTeamScore, teamName) => {
    let counter = currentTeamScore;
    roundsData.forEach((round) => {
      if (round.winner === teamName) {
        counter--;
      }
    });
    return counter <= 0;
  };

  const updateMVP = (index, value) => {
    let items = [...roundsData];
    let item = {...roundsData[index]};
    item.mvp = value;
    items[index] = item;
    setRoundsData(items);
  };

  const submitPredictions = () => {
    console.log(roundsData);
    const data = {
      matchId: props.match.params.id,
      predictions: roundsData,
      username: auth.getUsername(),
      team1: team1Score || 0,
      team2: team2Score || 0
    };
    axios.post(`http://${global.config.SERVER_HOST}:8000/predict`, data
    ).then( resp => {
      setSubmittedPrediction(
        {
          matchId: data.matchId,
          predictions: data.predictions,
          username: data.username,
          team1: {
            score: data.team1,
          },
          team2: {
            score: data.team2,
          }
        }
      );
    }).catch( err => {
      setError(err.response?.data?.error || "Unknown Error");
    })
  };

  const submitMatchResults = () => {
    console.log(roundsData);
    const data = {
      matchId: props.match.params.id,
      predictions: roundsData,
      username: auth.getUsername(),
      team1: team1Score || 0,
      team2: team2Score || 0
    };
    axios.post(`http://${global.config.SERVER_HOST}:8000/finish-match`, data
    ).then( resp => {
      setSubmittedPrediction(
        {
          matchId: data.matchId,
          predictions: data.predictions,
          username: data.username,
          team1: {
            score: data.team1,
          },
          team2: {
            score: data.team2,
          }
        }
      );
    }).catch( err => {
      setError(err.response?.data?.error || "Unknown Error");
    })
  };

  const checkValidity = () => {
    for (let i = 0; i < roundsData.length; i++) {
      if (roundsData[i].winner === "" || roundsData[i].mvp === "") {
        return false;
      }
    }
    return true;
  };

  const renderRows = () => {
    let r = [];
    const g = [];

    const amountOfRenders = rounds < results?.predictions?.length ? results?.predictions?.length : rounds;
    const res = results?.predictions;
    if (rounds > results?.predictions?.length) {
      for (let i = 0; i < (rounds - results?.predictions?.length); i++) {
        res.push({winner: "Round was not played", mvp: "Round was not played"});
      }
    }

    for (let i = 0; i < amountOfRenders; i++) {
      if (i === 0) {
        g.push(<div className="part-announce">First Half</div>);
        r = [];
      }
      if (i === 15) {
        g.push(<div className="rounds-grid">{r}</div>);
        r = [];
        g.push(<div className="part-announce">Second Half</div>)
      }
      if (i === 30) {
        g.push(<div className="rounds-grid">{r}</div>);
        r = [];
        g.push(<div className="part-announce">Overtime 1</div>)
      }
      if (i === 36) {
        g.push(<div className="rounds-grid">{r}</div>);
        r = [];
        g.push(<div className="part-announce">Overtime 2</div>)
      }
      if (i === 42) {
        g.push(<div className="rounds-grid">{r}</div>);
        r = [];
        g.push(<div className="part-announce">Overtime 3</div>)
      }
      r.push(
        <>
          <div className="round-prediction" key={i}>
            <div className="round-header"> Round {i+1} </div>
            <div>Winner of the round: </div>
            <div>
              <Select
                style={{ width: '100%' }}
                placeholder="Select a team"
                value={roundsData[i]?.winner}
                onChange={(value)=>updateWinner(i, value)}
                disabled={submittedPrediction || !matchDetails?.isOpen}
              >
                <Option value={matchDetails.team1.name} disabled={checkAmountOfRounds(team1Score, matchDetails.team1.name)}>{matchDetails.team1.name}</Option>
                <Option value={matchDetails.team2.name} disabled={checkAmountOfRounds(team2Score, matchDetails.team2.name)}>{matchDetails.team2.name}</Option>
              </Select>
              {
                !matchDetails?.isOpen && roundsData[i]?.winner !== res[i]?.winner &&
                <div>
                  <CloseCircleTwoTone twoToneColor="#EB2F40" />
                  <span className="wrong-caption"> Wrong! </span>
                  <span className="wrong-caption"> Round winner: <span className="res-highlight">{res[i]?.winner}</span> </span>
                </div>
              }
              {
                !matchDetails?.isOpen && roundsData[i]?.winner === res[i]?.winner &&
                <div>
                  <CheckCircleTwoTone twoToneColor="#52c41a" />
                  <span className="right-caption"> Right! </span>
                </div>
              }
            </div>

            <div style={{marginTop: "12px"}}>MVP:</div>
            <div>
              <Select
                style={{ width: '100%' }}
                placeholder="Select a player"
                value={roundsData[i]?.mvp}
                onChange={(value)=>updateMVP(i, value)}
                disabled={roundsData[i]?.winner === "" || submittedPrediction || !matchDetails?.isOpen}
              >
                {matchDetails?.team1.name === roundsData[i]?.winner && (
                  <>
                    {matchDetails?.team1.players.map((player, index) => (
                      <Option key={index} value={player}>{player}</Option>
                    ))}
                  </>
                )}
                {matchDetails?.team2.name === roundsData[i]?.winner && (
                  <>
                    {matchDetails?.team2.players.map((player, index) => (
                      <Option key={index} value={player}>{player}</Option>
                    ))}
                  </>
                )}
              </Select>
              {
                !matchDetails?.isOpen && roundsData[i]?.mvp !== res[i]?.mvp &&
                <div>
                  <CloseCircleTwoTone twoToneColor="#EB2F40" />
                  <span className="wrong-caption"> Wrong! </span>
                  <span className="wrong-caption"> MVP: <span className="res-highlight"> {res[i]?.mvp} </span> </span>
                </div>
              }
              {
                !matchDetails?.isOpen && roundsData[i]?.mvp === res[i]?.mvp &&
                <div>
                  <CheckCircleTwoTone twoToneColor="#52c41a" />
                  <span className="right-caption"> Right! </span>
                </div>
              }
            </div>
          </div>
        </>
      );
    }
    g.push(<div className="rounds-grid">{r}</div>);
    return g;
  };

  return (
    <div>
      {!matchDetails?.isOpen && aggregation &&
        <div className="winner">
          WINNER: {parseInt(results?.team1.score) > parseInt(results?.team2.score) ? matchDetails?.team1.name : matchDetails?.team2.name}
          <br/>
          <div className="results-aggregation">
            {team1Score > team2Score && "You and "} <span className={parseInt(results?.team1.score) > parseInt(results?.team2.score) ? "right-caption" : "wrong-caption" }> {aggregation.team1}% </span> of users predicted {matchDetails?.team1.name} to win! <br/>
            {team2Score > team1Score && "You and "} <span className={parseInt(results?.team2.score) > parseInt(results?.team1.score) ? "right-caption" : "wrong-caption" }> {aggregation.team2}% </span> of users predicted {matchDetails?.team2.name} to win! <br/>
          </div>
        </div>
      }
      <div className="final-result">
        <div className="team-info first">
          <div className="team-name">{matchDetails?.team1.name}</div>
          <div className="team-players">
            Team: {" "}
            {matchDetails?.team1.players.map((player, i)=>(
              <>
                {player}
                {i !== matchDetails?.team1.players.length-1 && ", "}
              </>
            ))}
          </div>
          <div>
            {matchDetails?.team1.description}
          </div>
        </div>
        <div style={{width: "100px"}}>
          <Input
            className="points-prediction"
            theme="dark"
            type="number"
            value={team1Score}
            onChange={(e) => setTeam1Score(e.target.value)}
            placeholder="15"
            readOnly={submittedPrediction || !matchDetails?.isOpen}
            disabled={!auth.isAuthenticated()}
          />
          {
            !matchDetails?.isOpen && team1Score !== results?.team1.score &&
            <div>
              <CloseCircleTwoTone twoToneColor="#EB2F40" />
              <span className="wrong-caption"> Wrong! </span>
              <div className="wrong-caption"> Score: <span className="res-highlight"> {results?.team1.score} </span> </div>
            </div>
          }
          {
            !matchDetails?.isOpen && team1Score === results?.team1.score &&
            <div>
              <CheckCircleTwoTone twoToneColor="#52c41a" />
              <span className="right-caption"> Right! </span>
            </div>
          }
        </div>
        <div className="breaker">:</div>
        <div>
          <Input
            className="points-prediction"
            theme="dark"
            type="number"
            value={team2Score}
            onChange={(e) => setTeam2Score(e.target.value)}
            placeholder="15"
            readOnly={submittedPrediction || !matchDetails?.isOpen}
            disabled={!auth.isAuthenticated()}
          />
          {
            !matchDetails?.isOpen && team2Score !== results?.team2.score &&
            <div>
              <CloseCircleTwoTone twoToneColor="#EB2F40" />
              <span className="wrong-caption"> Wrong! </span>
              <div className="wrong-caption"> Score: <span className="res-highlight"> {results?.team2.score} </span> </div>
            </div>
          }
          {
            !matchDetails?.isOpen && team2Score === results?.team2.score &&
            <div>
              <CheckCircleTwoTone twoToneColor="#52c41a" />
              <span className="right-caption"> Right! </span>
            </div>
          }
        </div>
        <div className="team-info">
          <div className="team-name"> {matchDetails?.team2.name} </div>
          <div className="team-players">
            Team: {" "}
            {matchDetails?.team2.players.map((player, i)=>(
              <>
                {player}
                {i !== matchDetails?.team2.players.length-1 && ", "}
              </>
            ))}
          </div>
          <div>
            {matchDetails?.team2.description}
          </div>
        </div>
      </div>
      {auth.isAuthenticated() && !auth.isAdmin() &&
      <div className="predictions-header">
        Your Predictions
      </div>
      }
      {auth.isAuthenticated() && auth.isAdmin() &&
      <div className="predictions-header">
        Match Results
      </div>
      }
      <div>
        {renderRows()}
      </div>
      {rounds !== 0 && !submittedPrediction && !auth.isAdmin() &&
        <div className="submit-button">
          <Button
            block
            type="primary"
            size="large"
            onClick={submitPredictions}
            disabled={!checkValidity()}
          >
            Submit Predictions
          </Button>
        </div>
      }
      {rounds !== 0 && !submittedPrediction && auth.isAdmin() &&
      <div className="submit-button">
        <Button
          block
          type="primary"
          size="large"
          onClick={submitMatchResults}
          disabled={!checkValidity()}
        >
          Submit Match Results
        </Button>
      </div>
      }
      {error &&
      <div className={"error-container"}>
        <span className={"error-text"}>{error}</span>
      </div>
      }
    </div>
  )
};

export default withRouter(CSGO);
