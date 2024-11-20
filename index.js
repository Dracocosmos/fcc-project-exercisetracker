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
        required: true,
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

    console.log('database linked')
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

  async getLog(userId, dateLow, dateHigh, limit) {
    const getLowDate = (date) => {
      date = date
        ? new Date(date)
        : new Date(0)
      return date
    }
    const getHighDate = (date) => {
      date = date
        ? new Date(date)
        : new Date
      return date
    }

    let user = await this.User
      .findById(userId)

    if (!user) {
      console.error('no user found')
      return Error('no user found')
    }

    user.exercises = user.exercises.filter((e) => {
      return e.date >= getLowDate(dateLow)
        && e.date <= getHighDate(dateHigh)
    })

    console.log(user.exercises)
    return {
      username: user.username,
      count: user.exercises.length,
      _id: user._id,
      log:
        user.exercises.map((exercise) => {
          return {
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date.toDateString()
          }
        })

    }
  }

  async addExercise(userId, description, duration, date) {

    // if date is not provided, get current date
    date = date
      ? new Date(date)
      : new Date

    duration = +duration

    // check if user exists
    let user
    try {
      user = await this.User.findById(userId)
    } catch (error) {
      console.error(error)
      return Error('no user found')
    }

    // make a new record, save it to the list of the correct user
    try {
      // create record in memory
      const exercise = new this.Exercise({
        userId: userId,
        description: description,
        duration: duration,
        date: date
      })

      // append it to list
      user.exercises.push(exercise)

      user.save()
    } catch (error) {
      console.error(error)
      return Error('failed creating record')
    }

    const exerciseObj = {
      _id: userId,
      description: description,
      duration: duration,
      date: date.toDateString(),
      username: user.username
    }

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
}
startDb().then((res) => {
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

    const exercise = await db.addExercise(
      req.params._id,
      r.description,
      r.duration,
      r.date
    )

    res.json(
      exercise
    )
  })

  app.get("/api/users/:_id/logs", urlParser, async (req, res) => {
    res.json(
      await db.getLog(req.params._id)
    )
  })

  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  })
})
