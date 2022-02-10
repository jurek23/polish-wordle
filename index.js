const PORT = 8000
const axios = require("axios").default
const express = require("express")
const cors = require("cors")
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
        console.error('get word error ' + error.message)
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
        console.log('called check and got ' + response.status)
        res.json(response.status)
    }).catch((error) => {
        console.error('check fucked with ' + error.message)
    })
})


app.listen(PORT, () => console.log('Server running on port ' + PORT))
