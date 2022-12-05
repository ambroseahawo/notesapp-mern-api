const express = require("express")
const router = express.Router()
const notesControllers = require("../controllers/notesControllers")

router.route("/")
  .get(notesControllers.getAllNotes)
  .post(notesControllers.createNewNote)

module.exports = router