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
  constructor() {
    return this.init()
  }

  async init() {
    const uri = "mongodb+srv://dracocosmos:" + process.env.DATABASEP + "@freecodecamp-exercise.lh9go.mongodb.net/?retryWrites=true&w=majority&appName=freecodecamp-exercise";

    this.connection = await mongoose.connect(uri)

    const exerciseSchema = new mongoose.Schema({
      userId: {
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

    // this is important:
    return this
  }

  addUser(userN) {
    const user = new this.User({ username: userN })

    user.save()

    return { _id: user._id, username: user.username }
  }

  getUsers() {
    // return a list of users


    return
  }

  addExercise(id, description, duration, date) {
    const exerciseObj = {
      userId: id,
      description: description,
      duration: duration,
      date: date
    }

    new this.Exercise.save(exerciseObj)

    return exerciseObj
  }
}

let db
const startDb = async () => {
  db = await new Db()

  // for deleting previous testing entries:
  // if (true) {
  if (false) {
    await db.User.deleteMany({}).exec()
    await db.Exercise.deleteMany({}).exec()

    const users = await db.User.find()
    const exercises = await db.Exercise.find()
    console.log(users)
    console.log(exercises)
  }
  console.log('database created')
}
startDb()

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
