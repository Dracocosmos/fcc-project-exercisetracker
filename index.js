const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

class Db {
  static uid = 0

  constructor() {
  }

  async initialize() {
    const uri = "mongodb+srv://dracocosmos:" + process.env.DATABASEP + "@freecodecamp-exercise.lh9go.mongodb.net/?retryWrites=true&w=majority&appName=freecodecamp-exercise";

    await mongoose.connect(uri)

    const exerciseSchema = new mongoose.Schema({
      username: {
        type: String,
        required: true
      },
      exerciseId: {
        type: mongoose.ObjectId,
        index: true,
        required: true,
        auto: true,
      },
      description: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        required: true
      },
    })
    this.Exercise = mongoose.model('Exercise', exerciseSchema)

    const userSchema = new mongoose.Schema({
      username: {
        type: String,
        required: true
      },
      _id: {
        type: mongoose.ObjectId,
        required: true,
        auto: true,
      },
      exercises: [exerciseSchema]
    })
    this.User = mongoose.model('User', userSchema)
  }

  addUser(userN) {

    const user = new this.User({ username: userN })

    user.save()

    return { _id: user._id, username: user.username }
  }

  addExercise(id, description, duration, date) {
  }
}

const db = new Db
db.initialize()
  .then(err => {
    mongoose.Model.remove
    db['User'].remove()
  })

// drop old data
// mongoose.db.Exercise.remove({}, err =>
//   console.log(err)
// )

// console.log(mongoose.connection.collections['exercises'])

const urlParser = bodyParser.urlencoded({ 'extended': true })
app.post("/api/users", urlParser, (req, res) => {

  console.log(req.body)
  res.json(
    {
      username: req.body.username,
      _id: db.addUser(req.body.username)._id
    }
  )
})

app.post("/api/users/:_id/exercises", urlParser, (req, res) => {
  const r = req.body

  console.log(req.body)
  console.log(db.addExercise(r[':_id'], r.description, r.duration, r.date))

  res.json(
    {
    }
  )
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
