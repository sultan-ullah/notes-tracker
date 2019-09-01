/**
 * Notes class to keep track of each individual note created
 */
const fs = require('fs')
const filePath = './notes.json'

/**
 * @class
 */
class Note {

    /**
     * Represents a note with the required meta data
     * @constructor
     * @param {string} title - the title of the note 
     * @param {string} text - the main body text of the note
     * @param {string} timestamp - timestamp of the created date 
     * @param {string} path - file path of the ntoe 
     * @param {integer} id - id of the note created
     */
    constructor(title, text, timestamp = null, path = null, id = null) {
        const date = new Date();
        this.title = title;
        this.text = text;
        this.timestamp = timestamp ? timestamp : date.getTime();
        this.path = path ? path : `./notes/${this.title.replace(" ", "_")}_${this.timestamp}.txt`;
        this.id = id ? id : this.getID();
    }

    /**
     * Add a new note
     * Returns a promise for adding to notes.json file and creating note .txt file
     */
    add() {
        return new Promise((resolve, reject) => {
            Note.readJSONData()
            .then(json => {
                json.list.push({...this})
                Note.writeJSONData(json)
                fs.writeFile(this.path, this.text, (err) => {
                    if (err) reject(err)
                    resolve()
                }); 
            })
            .catch((err) => reject(err))
        });
        
    }

    /**
     * Get ID of the note from the notes.json file
     */
    getID() {
        let data = fs.readFileSync(filePath);
        let json = JSON.parse(data.toString());
        return json.list.length;
    }

    /**
     * Update a note
     * Returns a promise for updating the notes.json file and the note .txt file
     * @param {string} title 
     * @param {string} text 
     */
    update(title, text) {
        return new Promise((resolve, reject) => {
            Note.readJSONData()
            .then(json => {
                this.title = title;
                this.text = text;
                json.list[this.id] = {...this}
                Note.writeJSONData(json)
                fs.writeFile(this.path, text, (err) => {
                    if (err) reject(err)
                    resolve()
                });
            })
            .catch((err) => reject(err));
        });
    }

    /**
     * Delete a note
     * Returns a promise for removing the note from the json file and deleting the .txt file
     */
    delete() {
        return new Promise((resolve, reject) => {
            Note.readJSONData()
            .then(json => {
                json.list.splice(this.id, 1)
                let updatedIDs = json.list.map((item, index) => {
                    return {...item, id : index}
                });
                json.list = updatedIDs;
                Note.writeJSONData(json)
                fs.unlink(this.path, (err) => {
                    if (err) reject(err);
                    resolve();
                })
            })
            .catch((err) => reject(err));
        });
    }

    /**
     * Get a note from the notes list (helper method)
     * @param {integer} id 
     */
    static getNote(id) {
        return new Promise((resolve, reject) => {
            Note.readJSONData()
            .then(json => {
                let item = json.list[id];
                if (item) {
                    let { title, text, timestamp, path} = item;
                    let note = new Note(title, text, timestamp, path, id);
                    resolve(note)    
                } else {
                    reject("Item could not be found")
                }
            });
        });
    }

    /**
     * Retrieves a list of all the notes through the json file (helper method)
     * Returns a promise
     */
    static getNotesList() {
        return new Promise((resolve, reject) => {
            Note.readJSONData()
                .then((json) => {
                    resolve(json.list);
                })
                .catch(err => reject(err));
        });
    }

    /**
     * Reads JSON data from notes.json file (helper method)
     * Returns a promise when reading from the file is done
     */
    static readJSONData() {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) reject(err)
                resolve(JSON.parse(data))
            });
        });
    }

    /**
     * Writes to the notes.json file (helper method)
     * Returns a promise when writing to the file is done
     * @param {json} data 
     */
    static writeJSONData(data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
                if (err) reject(err)
                resolve()
            });
        });
    }
}

module.exports.Note = Note;