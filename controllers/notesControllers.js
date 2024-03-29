const User = require("../models/User")
const Note = require("../models/Note")
const asyncHandler = require("express-async-handler")

// @desc get all notes per user
// @route GET /notes
// @access private
const getAllNotes_ = asyncHandler(async (req, res) => {
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

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  // Get all notes from MongoDB
  const notes = await Note.find().lean()

  // if no notes
  if (!notes?.length) {
    return res.status(400).json({ message: "No notes found" })
  }

  // Add username to each note before sending response
  const notesWithUser = await Promise.all(notes.map(async (note) => {
    const user = await User.findById(note.user).lean().exec()
    return { ...note, username: user.username }
  }))

  res.json(notesWithUser)
})


// @desc create note
// @route POST /notes
// @access private
const createNewNote = asyncHandler(async (req, res) => {
  const { id, title, text } = req.body

  if (!id || !title || !text) {
    return res.status(400).json({ message: "All fields are required" })
  }

  //Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec()

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" })
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
  const { userId, noteId, title, text, completed } = req.body

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

  // check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec()

  // Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" })
  }

  note.title = title
  note.text = text
  note.completed = completed

  await note.save()

  res.status(200).json({ message: "Note Updated" })
})


// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body

  // confirm data
  if (!id) {
    return res.status(400).json({ message: "Note ID Required" })
  }

  // confirm note exists to delete
  const note = await Note.findById(id).exec()

  if (!note) {
    return res.status(400).json({ message: "Note not found" })
  }

  const result = await note.deleteOne()
  const reply = `Note '${result.title}' with ID ${result._id} deleted`

  res.status(200).json(reply)
})

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote
}