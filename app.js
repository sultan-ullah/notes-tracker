const fs = require('fs')
const express = require('express')
const methodOverride = require('method-override')
const app = express()
const bodyParser = require('body-parser')
const port = 5000
const { Note } = require('./Note');

app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static('public/'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    createDirForNotes()
        .catch(err => console.log(err))
});

// INDEX
app.get('/', (req, res) => {
    Note.getNotesList()
        .then((list) => {
            res.render('index', { "title" : "Note Keeper", "list" : formatList(list).reverse() });
        })
        .catch(err => console.log(err));
});

// CREATE
app.get('/create', (req, res) => res.render('create'));
app.post('/create', (req, res) => {
    let newNote = new Note(req.body.title, req.body.text);
    newNote.add()
        .then(() => res.redirect('/'))
        .catch(err => console.log(err));
});

// SHOW
app.get('/notes/:id', (req, res) => {
    Note.getNote(req.params.id)
        .then(note => {
            res.render('show', {
                id : note.id,
                title : note.title, 
                text : note.text,
                created: formatDate(note.timestamp)
            });
        })
        .catch(err => console.log(err))
});

// EDIT
app.get('/notes/:id/edit', (req, res) => {
    Note.getNote(req.params.id)
        .then(note => {
            res.render('edit', {
                id : note.id,
                title : note.title, 
                text : note.text,
                created: formatDate(note.timestamp)
            });
        })
        .catch(err => console.log(err))
});

// UPDATE
app.put('/notes/:id/edit', (req, res) => {
    Note.getNote(req.params.id)
        .then((note) => {
            note.update(req.body.title, req.body.text)
        })
        .then(() => res.redirect('/'))
        .catch((err) => console.log(err))
});

// DELETE
app.delete('/notes/:id/delete', (req, res) => {
    Note.getNote(req.params.id)
        .then((note) => {
            note.delete()
        })
        .then(() => res.redirect('/'))
        .catch((err) => console.log(err));
});

// HELPER FUNCTIONS

/** Create a directory to keep the notes */
const createDirForNotes = () => {
    return new Promise((resolve, reject) => {
        fs.stat('./notes/', (err, stats) => {
            if (err && err.code !== 'ENOENT') reject(err)
            if (stats) {
                console.log('notes directory already exists')
                resolve()
            } else {
                fs.mkdir('./notes/', (err) => {
                    if (err) reject(err)
                    console.log('notes directory created')
                    resolve()
                });
            }
        });
    });
};

/** Create list needed for index view to display */
const formatList = (list) => {
    return list.map((item) => {
            return {
                id: item.id,
                title: item.title,
                text: item.text,
                created: formatDate(item.timestamp)
            };
    });
}

/** Format the date to create readable timestamp */
const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hours = (date.getHours() >= 12) ? date.getHours() - 12 : date.getHours();
    const minutes = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
    const ampm = (date.getHours() >= 12) ? "PM" : "AM";
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()} ${hours}:${minutes} ${ampm}`
}

