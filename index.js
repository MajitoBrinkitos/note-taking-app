const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const bcrypt = require('bcrypt');
const {collection, Note} = require("./config");
const session = require('express-session');

const app = express();

//Convert data into json format
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Use EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, '../views'));

// Static file for CSS
app.use(express.static("public"));

//Session setup
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

// Root route - Home page
app.get("/", (_req, res) => {
    res.render("home");
});

//Home route
app.get("/home", (_req, res) => {
    res.render("home");
});

//About route
app.get("/about", (_req, res) => {
    res.render("about");
});

//Download
app.get("/download", (_req, res) => {
    res.render("download");
});

//Media
app.get("/media", (_req, res) => {
    res.render("media");
});

// Login route
app.get("/login", (_req, res) => {
    res.render("login");
});

// Signup route
app.get("/signup", (_req, res) => {
    res.render("signup");
});

//Register User
app.post("/signup", async (req, res) => {
    
    const data = {
        name: req.body.name,
        email: req.body.email,
        user: req.body.user,
        password: req.body.password
    };

    //Check if the user already exist in the database
    const existingUser = await collection.findOne({user: data.user});

    if(existingUser) {
        res.send("User already exists. Please choose a different username or login into your account.");
    }else {
        //Hash the password using bcrypt
        const saltRounds = 10; //Salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; //Replacing hash password with the original one

        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }

});

    //Login user
    app.post("/login", async (req, res) => {
        try{
            const check = await collection.findOne({user: req.body.user});
            if(!check) {
                res.send("user not found");
                return;
            }

            //compare has password from the database with plain text
            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
            if(isPasswordMatch) {
                req.session.userId = check._id; // Store user ID in session
                console.log("User logged in:", req.session.userId);
                res.redirect("/note"); //here it sends the user to the note-taking section
            } else {
                res.send("wrong password");
            }
        }catch{
            res.send("wrong Details");
        }
    });

    // Save a new note
    app.post("/note", async (req, res) => {
        if (!req.session.userId) {
            res.redirect("/login");
            return;
        }
    
        const newNote = new Note({
            userId: req.session.userId,
            title: req.body.title,
            description: req.body.description,
            date: req.body.date
        });

        console.log("New note data:", newNote);
            try{
        await newNote.save();
        console.log("Note saved:", newNote);
            } catch (error) {
                console.error("Error saving note:", error);
            }
        res.redirect("/note");
    });

// Note route
app.get("/note", async (req, res) => {
    if (!req.session.userId) {
        res.redirect("/login");
        return;
    }

    try {
    const userNotes = await Note.find({ userId: req.session.userId });
    console.log("User notes:", userNotes);
    res.render("note", { notes: userNotes });
    } catch (error) {
        console.error("Error fetching user notes:", error);
        res.send("Error retrieving notes");
    }
});


    //Logout
    app.get("/logout", (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.redirect("/note");
            }
            res.clearCookie("connect.sid");
            res.redirect("/login");
        });
    });
        

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
})