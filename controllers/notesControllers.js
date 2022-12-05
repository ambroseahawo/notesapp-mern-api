const User = require("../models/User")
const Note = require("../models/Note")
const asyncHandler = require("express-async-handler")

// @desc get all notes
// @route GET /notes
// @access private
const getAllNotes = asyncHandler(async (req, res) => {
  const { id } = req.body
  if (!id) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const user = await User.findById(id).exec()
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const notes = await Note.find({
    user: { $in: [id] }
  }).lean()
  if (!notes?.length) {
    return res.status(400).json("No existing notes.")
  }
  res.json(notes)
})

// @desc create note
// @route POST /notes
// @access private
const createNewNote = asyncHandler(async (req, res) => {
  const { id, title, text } = req.body

  if (!id || !title || !text) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const user = await User.findById(id).exec()
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const newNoteObj = { "user": id, title, text }

  const note = await Note.create(newNoteObj)

  if (note) {
    return res.status(201).json({ message: "Note successfully created" })
  } else {
    return res.status(400).json({ message: "Invalid note data received" })
  }
})


// @desc update note
// @route PATCH /notes
// @access private
const updateNote = asyncHandler(async (req, res) => {
  const { userId, noteId, title, text } = req.body

  if (!userId || !noteId || !title || !text) {
    return res.status(400).json({ message: "All fields are required" })
  }

  const user = await User.findById(userId).exec()
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const note = await Note.findById(noteId).exec()
  if (!note) {
    return res.status(400).json({ message: "Note not found" })
  }

  if (note.user.toString() !== userId) {
    return res.status(400).json({ message: "User can only edit own notes" })
  }

  note.title = title
  note.text = text

  await note.save()

  res.status(200).json({ message: "Note Updated", })
})

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote
}