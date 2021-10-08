const express = require('express')
const app = express()
const cors = require('cors')
var bodyparser = require('body-parser');
const { createANewUser, mongoDbConnect, addExercises, getUserExerciseLog } = require('./model')
require('dotenv').config()


app.use(cors())
app.use(express.static('public'))
app.use(bodyparser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoDbConnect();

app.post('/api/users', (req, res, next) => {
  let user = req.body.username;
  createANewUser(user, (err, data) => {
    if (err) res.send(err.message);
    res.json(data);
  });

});

app.post('/api/users/:_id/exercises', (req, res, next) => {
  let _id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date;

  if (req.body.date === '' || req.body.date === undefined) {
    let today = new Date();
    date = (today.getFullYear()).toString() + '-' +
      (today.getMonth() + 1).toString() + '-' +
      (today.getDate()).toString();
    console.log('undefined date becomes today as: ' + date);

  } else {
    try {
      let trydate = new Date(req.body.date);

    } catch (err) {
      res.send(err.message)
    }
    date = req.body.date
  }

  console.log('post _id: ' + _id);
  console.log('post description: ' + description);
  console.log('post duration: ' + duration);
  console.log('post date: ' + date);

  if (description === '' || description === undefined)
    res.send('Path `description` is required.')
  else if (duration === '' || duration === undefined)
    res.send('Path `duration` is required.')
  else {
    try {
      let tryduration = new Number(duration);

      if (!isNaN(tryduration)) { 

      addExercises(_id, description, duration, date, (err, data) => {
        if (err) res.send(err.message);
        res.json(data);
      })
   
    }   else {
      res.send('Cast to Number failed for value "'+duration+'" at path "duration"');
    }
    } catch (err) {
      res.send(err.message)
    }
  }

});

app.get('/api/users/:_id/logs', (req, res) => {
  let _id = req.params._id;
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;

  console.log('/api/users/:_id/logs ... _id'+_id);
  console.log('/api/users/:_id/logs ... from'+from);
  console.log('/api/users/:_id/logs ... to'+to);
  console.log('/api/users/:_id/logs ... limit'+limit);

  getUserExerciseLog(_id, from, to, limit, (err, data) => {

    if (err) {
      console.log('here: ' + err.message);
      res.send(err.message);
    }
    else {
      console.log('there: ' + data);
      res.json(data);
    }
  })

})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
