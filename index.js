const axios = require("axios").default
const express = require("express")
const cors = require("cors")
const path = require("path");
require('dotenv').config()
const app = express()
app.use(cors())

app.get('/word', (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://polish-words.p.rapidapi.com/word/random/5',
        headers: {
            'x-rapidapi-host': 'polish-words.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY
        }
    }
    axios.request(options).then((response) => {
        res.json(response.data.word)
    }).catch((error) => {
        console.error('get word fucked with ' + error.message)
    })
})

app.get('/check', (req, res) => {
    const word = req.query.word

    const options = {
        method: 'GET',
        url: encodeURI('https://polish-words.p.rapidapi.com/word/check/' + word),
        headers: {
            'x-rapidapi-host': 'polish-words.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY
        },
        validateStatus: false
    }

    axios.request(options).then((response) => {
        res.json(response.status)
    }).catch((error) => {
        console.error('check fucked with ' + error.message)
    })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'))
})

app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log('Server running on port ' + PORT))
