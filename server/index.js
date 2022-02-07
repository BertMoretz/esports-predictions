const cors = require('cors');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb');

const app = express();

let db;
let flag = true;

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST_IP,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB
} = process.env;

const options = {
    useNewUrlParser: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 500,
    connectTimeoutMS: 10000,
};

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongo:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
const client = new MongoClient(url);

client.connect(function(err) {
    if (!err) {
        console.log("Connected successfully to server");
        db = client.db(MONGO_DB);
        db.createCollection("user", {});
        db.createCollection("csgo-matches", {});
        db.createCollection("predictions", {});
        bcrypt.genSalt(saltRounds, function (saltError, salt) {
            if (saltError) {
                throw saltError
            } else {
                bcrypt.hash("adminadmin", salt, function(hashError, hash) {
                    if (hashError) {
                        throw hashError
                    } else {
                        db.collection("user").insertOne({
                            username: "admin",
                            password: hash,
                            role: "admin",
                            gender: "male",
                            experience: 5
                        });
                        //$2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
                    }
                })
            }
        });
    } else {
        console.log(err);
    }
});


app.use(bodyParser.json());
app.use(cors());

app.listen(process.env.REACT_APP_SERVER_PORT, () => {
    console.log(`App server now listening on port ${process.env.REACT_APP_SERVER_PORT}`);
});

app.get('/csgomatches', (req, res) => {
    db.collection("csgo-matches").find().toArray((e, resp) => {
        if (e) return res.status(500).send({ error: "Something went wrong!"});

        return res.send(resp);
    })
});

app.post('/register', (req, res) => {
    const { username } = req.body;
    const { password } = req.body;
    const { gender } = req.body;

    let post = {};

    bcrypt.genSalt(saltRounds, function (saltError, salt) {
        if (saltError) {
            throw saltError
        } else {
            bcrypt.hash(password, salt, function(hashError, hash) {
                if (hashError) {
                    throw hashError
                } else {
                    post = {
                        username: username,
                        password: hash,
                        role: "user",
                        gender: gender,
                        experience: 0
                    };

                    db.collection("user").findOne(
                      { username: username},
                      (e, resp) => {
                          if (resp) return res.status(403).send({ error: "User already exists"});
                          db.collection("user").insertOne(post);
                          return res.send(resp);
                      }
                    );
                    //$2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
                }
            })
        }
    });
});

app.get('/login', (req, res) => {
    const { login } = req.query;
    const { password } = req.query;

    db.collection("user").findOne(
        { username: login },
        { username: 1, role: 1, gender: 1 },
        (e, resp) => {
            if (e) return res.status(500).send({ error: "Something went wrong!"});
            if (!resp) return res.status(404).send({ error: "User not found!"});
            console.log(resp);
            bcrypt.compare(password, resp.password, function(error, isMatch) {
                if (error) {
                    throw error
                } else if (!isMatch) {
                    return res.status(500).send({ error: "Wrong username or password!"});
                } else {
                    const user = {
                        username: resp.username,
                        role: resp.role,
                        gender: resp.gender
                    };
                    return res.send(user);
                }
            });
        }
    );

});

app.post('/create/csgo-match', (req, res) => {
    const { team1 } = req.body;
    const { team2 } = req.body;
    const { players1 } = req.body;
    const { players2 } = req.body;
    const { description1 } = req.body;
    const { description2 } = req.body;
    const post = {
        team1: {
            name: team1,
            players: players1,
            description: description1
        },
        team2: {
            name: team2,
            players: players2,
            description: description2
        },
        isOpen: true
    };

    db.collection("csgo-matches").insertOne(post, (e, resp) => {
        if (e) return res.status(500).send({ error: "Something went wrong!"});
        return res.send(resp);
    });
});

app.get('/match-details', (req, res) => {
    const { matchId } = req.query;

    db.collection("csgo-matches").findOne(
        {_id: new mongo.ObjectID(matchId)},
        {},
        (e, resp) => {
            if (e) return res.status(500).send({ error: "Something went wrong!"});
            return res.send(resp);
        }
    );
});

app.post('/predict', (req, res) => {
    const { matchId } = req.body;
    const { predictions } = req.body;
    const { username } = req.body;
    const { team1 } = req.body;
    const { team2 } = req.body;
    const post = {
        matchId: matchId,
        predictions: predictions,
        username: username,
        team1: {
            score: parseInt(team1),
        },
        team2: {
            score: parseInt(team2),
        }
    };

    db.collection("predictions").insertOne(post, (e, resp) => {
        if (e) return res.status(500).send({ error: "Something went wrong!"});
        return res.send(resp);
    });
});

app.post('/finish-match', (req, res) => {
    const { matchId } = req.body;
    const { predictions } = req.body;
    const { username } = req.body;
    const { team1 } = req.body;
    const { team2 } = req.body;
    const post = {
        predictions: predictions,
        username: username,
        team1: {
            score: parseInt(team1),
        },
        team2: {
            score: parseInt(team2),
        }
    };

    db.collection("csgo-matches").update({_id: new mongo.ObjectID(matchId)}, {
        $set: {
            isOpen: false,
            results: post
        }
    }, (e, resp) => {
        if (e) return res.status(500).send({ error: "Something went wrong!"});
        return res.send(resp);
    });
});

app.get('/prediction', (req, res) => {
    const { matchId } = req.query;
    const { username } = req.query;

    db.collection("predictions").findOne(
      {matchId: matchId, username: username},
      {},
      (e, resp) => {
          if (e) return res.status(500).send({ error: "Something went wrong!"});
          return res.send(resp);
      }
    );
});

app.get('/predictions-analysis', (req, res) => {
    const { matchId } = req.query;

    db.collection("predictions").find(
        { matchId: matchId }
        ).toArray((e, resp) => {
            if (e) return res.status(500).send({ error: "Something went wrong!"});
        if (resp) {
            let team1 = 0;
            let team2 = 0;
            for (let i = 0; i < resp.length; i++) {
                if (parseInt(resp[i].team1.score) > parseInt(resp[i].team2.score)) {
                    team1++;
                } else {
                    team2++;
                }
            }
            const team1Preds = Math.floor((team1 / resp.length) * 100).toFixed(0) || 0;
            const team2Preds = Math.floor((team2 / resp.length) * 100).toFixed(0) || 0;

            return res.send({team1: team1Preds, team2: team2Preds});
        } else {
            return res.send({team1: 0, team2: 0});
        }
      }
    );
});



