const User = require("../models/User")
const Note = require("../models/Note")
const asyncHandler = require("express-async-handler")

// @desc get all notes
// @route GET /allNotes
// @access private
const getAllNotes = asyncHandler(async(req, res) =>{
  const notes = await Note.find().lean()
  if(!notes?.length){
    return res.status(400).json("No existing notes.")
  }
  res.json(notes)
})