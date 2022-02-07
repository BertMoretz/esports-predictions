import React from 'react';
import './App.css';
import MyHeader from "./app/core/Header/Header";
import { Route, Switch, Redirect } from "react-router-dom";
import CSGO from "./app/pages/CSGO/CSGO";
import Register from "./app/pages/Register/Register";
import Login from "./app/pages/Login/Login";
import CSGOMatches from "./app/pages/CSGOMatches/CSGOMatches";
import CSGOCreate from "./app/pages/CSGOCreate/CSGOCreate";

function App() {
  return (
    <div className="App">
      <MyHeader />
      <div className="container">
        <Switch>
          <Route path="/csgo" exact>
            <CSGOMatches/>
          </Route>
          <Route path="/csgo/:id" exact>
            <CSGO/>
          </Route>
          <Route path="/csgo-create" exact>
            <CSGOCreate/>
          </Route>
          <Route path="/login">
            <Login/>
          </Route>
          <Route path="/register">
            <Register/>
          </Route>
          <Route path="/dota">
          </Route>
          <Route path="/lol">
          </Route>
          <Redirect from="*" to="/csgo" />
        </Switch>
      </div>
    </div>
  );
}

export default App;
