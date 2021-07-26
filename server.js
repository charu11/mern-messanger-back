//import dependencies

import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import cors from "cors";
import bodyparser from "body-parser";

import mongoMessages from "./models.js";

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1240475",
    key: "b102eca276925486cfd0",
    secret: "9134e20fea6aaadddc5b",
    cluster: "mt1",
    useTLS: true
  });



// middlewares
app.use(express.json());
app.use(cors());
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
//db config
const mongoURI =
  "mongodb+srv://admin:charu@13253@cluster0.rt6pe.mongodb.net/messangerDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("db connected");

  const changeStream = mongoose.connection.collection('messages').watch()
  changeStream.on('change', (change)=>{
      pusher.trigger('messages', 'newMessage', {
          'change': change
      });
  })
});
//api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.post("/save/messages", (req, res) => {
  console.log(req.body);
  const dbMessage = req.body;

  mongoMessages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
      console.log("there is an error");
      console.error(err);
    } else {
      res.status(201).send(data);
      console.log(data);
    }
  });
});

app.get("/retrieve/conversation", (req, res) => {
  mongoMessages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
      console.log("there is an error");
      console.error(err);
    } else {
      data.sort((a, b ) => {
        return b.timestamp - a.timestamp;
      });
      res.status(201).send(data);
      console.log(data);
    }
  });
});

// listen
app.listen(port, () => console.log(`listneing on localhost:${port}`));
