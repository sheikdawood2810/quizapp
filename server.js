require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const app = express();

const db = mysql.createPool({
    host:              process.env.DB_HOST,
    user:              process.env.DB_USER,
    password:          process.env.DB_PASSWORD,
    database:          process.env.DB_NAME,
    port:              process.env.DB_PORT,
    ssl:               { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit:   10,
    queueLimit:        0,
    enableKeepAlive:   true,
    keepAliveInitialDelay: 0
});

db.getConnection(function(err, connection){
    if(err){
        console.log("database not connected:", err.message);
    } else {
        console.log("connected to mysql");
        connection.release();
    }
});

app.use(express.json());
app.use(express.static("public"));

app.post("/login", (req, res) => {
    const username = req.body.username;
    const checksql = "SELECT * FROM users WHERE name = ?";
    db.query(checksql, [username], function(error, result){
        if(error || !result){
            res.json({ message: "Connection error, please try again" });
            return;
        }
        if(result.length > 0){
            res.json({ message: "Welcome back " + username });
        } else {
            const insertsql = "INSERT INTO users(name, score) VALUES (?, ?)";
            db.query(insertsql, [username, 0], function(error){
                if(error){
                    res.json({ message: error.message });
                } else {
                    res.json({ message: "Welcome " + username });
                }
            });
        }
    });
});

app.post("/updatescore", (req, res) => {
    const username = req.body.username;
    const score = req.body.score;
    const sql = "UPDATE users SET score = ? WHERE name = ?";
    db.query(sql, [score, username], function(error){
        if(error){
            res.json({ message: "Update failed" });
        } else {
            res.json({ message: "Score updated" });
        }
    });
});

app.get("/questions/:topic", (req, res) => {
    const topic = req.params.topic;
    const sql = "SELECT * FROM questions WHERE topic = ? ORDER BY RAND() LIMIT 5";
    db.query(sql, [topic], function(error, result){
        if(error || !result){
            res.json([]);
        } else {
            res.json(result);
        }
    });
});

app.get("/leaderboard", (req, res) => {
    const sql = "SELECT * FROM users ORDER BY score DESC LIMIT 5";
    db.query(sql, function(error, result){
        if(error || !result){
            res.json([]);
        } else {
            res.json(result);
        }
    });
});

app.post("/admin/addquestion", (req, res) => {
    const { topic, question, option1, option2, option3, option4, answer } = req.body;
    const sql = "INSERT INTO questions(topic, question, option1, option2, option3, option4, answer) VALUES (?,?,?,?,?,?,?)";
    db.query(sql, [topic, question, option1, option2, option3, option4, answer], function(error){
        if(error){
            res.json({ message: "Failed: " + error.message });
        } else {
            res.json({ message: "Question added successfully!" });
        }
    });
});

app.delete("/admin/deletequestion/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM questions WHERE id = ?";
    db.query(sql, [id], function(error){
        if(error){
            res.json({ message: "Delete failed: " + error.message });
        } else {
            res.json({ message: "Question deleted!" });
        }
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port " + (process.env.PORT || 3000));
});