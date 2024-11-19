const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const mongoose = require('mongoose')

app.use(cors())
app.use(express.static('public'))
app.get('/', (_req, res) => {
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

  async getUsers() {
    // return a list of users

    const users = await this.User.find({}).exec()
    const rVal = users.map((user, _ind) => {
      const id = user._id.toString()
      return { username: user.username, _id: id }
    })

    return rVal
  }

  async addExercise(userId, description, duration, date) {

    // if date is not provided, get current date
    date = date
      ? new Date(date)
      : new Date

    const exerciseObj = {
      userId: userId,
      description: description,
      duration: duration,
      date: date
    }

    // check if user exists
    let user
    try {
      user = await this.User.findById(userId)
    } catch (error) {
      return Error('no user found', error)
    }

    // create record in memory
    try {
      // make exercise
      const exercise = new this.Exercise({
        userId: userId,
        description: description,
        duration: duration,
        date: date
      })

      // append it to list
      user.exercises.push(exercise)
    } catch (error) {
      return Error('failed creating record', error)
    }
    console.log(user)

    // new this.Exercise.save(exerciseObj)

    // make a new record, save it to the list of the correct user

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

  const newUser = db.addUser(req.body.username)

  res.json(
    {
      username: newUser.username,
      _id: newUser._id.toString()
    }
  )
})

app.get("/api/users", async (req, res) => {
  res.json(
    await db.getUsers()
  )
})

app.post("/api/users/:_id/exercises", urlParser, async (req, res) => {
  const r = req.body

  console.log(req.body)
  console.log('added: ' + await db.addExercise(r[':_id'], r.description, r.duration, r.date))

  res.json(
    {
    }
  )
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
