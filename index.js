const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

class mockDb {
  static entries = {}
  static uid = 0
  static exercises = []

  constructor() {
  }

  addUser(userN) {
    mockDb.uid++

    let id
    if (mockDb.entries[userN]) {
      id = mockDb.entries[userN]
    }
    else {
      mockDb.entries[userN] = mockDb.uid
      mockDb.entries[mockDb.uid] = userN

      id = mockDb.uid
    }

    const username = userN

    return { id: id, username: username }
  }

  addExercise(identifier, description, duration, date) {

  }
}

class exercise {
  constructor(username, description, duration, date, id2) {
    if (mockDb.entries[id2]) {
      this.id = id2
    }
    else {
      return Error('wrong id')
    }
    if (mockDb.entries[username]) {
      this.username = username
    }
    else {
      return Error('wrong username')
    }
    this.description = description
    this.duration = duration
    this.date = date
  }
}

const db = new mockDb

const urlParser = bodyParser.urlencoded({ 'extended': true })
app.post("/api/users", urlParser, (req, res) => {

  console.log(req.body)
  res.json(
    {
      username: req.body.username,
      _id: db.addUser(req.body.username).id
    }
  )
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
