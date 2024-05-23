const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let users = [];
let exercises = [];


app.post("/api/users", (req, res) => {
  const user = { username: req.body.username, _id: generateId() };
  users.push(user);
  res.json({
    username: user.username,
    _id: user._id,
  });
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const user = users.find((user) => user._id === req.params._id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  const exercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date:
      req.body.date !== undefined
        ? new Date(req.body.date)
        : new Date(),
    _id: generateId(),
  };

  exercises.push({ user: user._id, ...exercise });
  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id,
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const user = users.find((user) => user._id === req.params._id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  let from;
  let to;
  let limit;

  if (req.query.from) {
    from = new Date(req.query.from);
  }
  if (req.query.to) {
    to = new Date(req.query.to);
  }
  if (req.query.limit) {
    limit = parseInt(req.query.limit);
  }

  const filteredExercises = exercises
    .filter((exercise) => exercise.user === user._id)
    .filter((exercise) => {
      if (!from && !to) {
        return true;
      } else if (!from) {
        return exercise.date <= to;
      } else if (!to) {
        return exercise.date >= from;
      } else {
        return exercise.date >= from && exercise.date <= to;
      }
    })
    .filter((exercise) => exercise.date !== "Invalid Date")
    .slice(0, limit);

  res.json({
    username: user.username,
    count: exercises.filter((exercise) => exercise.user === user._id).length,
    _id: user._id,
    log: filteredExercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    })),
  });
});

const generateId = () => {
  var timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  return (
    timestamp +
    "xxxxxxxxxxxxxxxx"
      .replace(/[x]/g, () => {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase()
  );
};

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
