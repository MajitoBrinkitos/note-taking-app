const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login-tut");

//To check database connection
connect.then(() => {
    console.log("Database connected Successfully");
})
.catch((err) => {
    console.log("Database connection error:", err);
});

//Create a LoginSchema
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

    // Create a NoteSchema
const NoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Collection Part
const collection = new mongoose.model("users", LoginSchema);
const Note = mongoose.model("notes", NoteSchema);

module.exports = {collection, Note};