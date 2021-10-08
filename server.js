const express = require('express')
const app = express()
const cors = require('cors')
var bodyparser = require ('body-parser');
const { createANewUser, mongoDbConnect, addExercises, getUserExerciseLog } = require('./model')
require('dotenv').config()


app.use(cors())
app.use(express.static('public'))
app.use(bodyparser.urlencoded({extended: false}));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoDbConnect();

app.post('/api/users', (req, res,next)=>{
  let user = req.body.username;
  createANewUser(user, (err,data)=> {
    if (err) res.send(err.message);
    res.json(data);
  });

});

app.post('/api/users/:_id/exercises', (req,res,next)=> {
  let _id = req.params._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;

  addExercises(_id, description, duration, date, (err,data) => {
    if (err) res.send(err.message);
    res.json(data);  
  })


});

app.get('/api/users/:_id/logs', (req,res) => {
  let _id = req.params._id;
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;

  getUserExerciseLog(_id, from, to, limit, (err, data)=> {

    if (err) 
      res.send(err.message);
    else
      res.json(data); 
  })

}) 



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
