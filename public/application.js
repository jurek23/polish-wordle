const tilesDisplay = document.querySelector('.tile-container')
const keyboardDisplay = document.querySelector('.keyboard-container')
const messageDisplay = document.querySelector('.message-container')

//TODO błąd z KRZAK
let wordle
let meaning

const getWordle = () => {
    fetch('https://polish-wordle.herokuapp.com/word')
        .then(response => response.json())
        .then(json => {
            wordle = json.toUpperCase()
            console.log('' + wordle)
        })
        .catch(err => console.log('get wordle fucked with ' + err.message))
}
getWordle()

const keyboard = ['Ą', 'Ć', 'Ę', 'Ł', 'Ó', 'Ś', 'Ń', 'Ż', 'Ź', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S',
    'D', 'F', 'G', 'H', 'J', 'K', 'L', '←', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']

const guesses = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
]
let gameOver = false
let currentLetter = 0
let currentRow = 0

guesses.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement('div')
    rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)
    guessRow.forEach((_guess, guessIndex) => {
        const tileElement = document.createElement('div')
        tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
        tileElement.classList.add('tile')
        rowElement.append(tileElement)
    })
    tilesDisplay.append(rowElement)
})

keyboard.forEach(key => {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id', key)
    buttonElement.addEventListener('click', () => handleClickLetter(key))
    keyboardDisplay.append(buttonElement)
})

const handleClickLetter = (letter) => {
    if (!gameOver) {
        if (letter === '←') {
            deleteLetter()
            return
        }
        if (letter === 'ENTER') {
            checkWord()
            return
        }
        addLetter(letter)
    }
}

const addLetter = (letter) => {
    if (currentLetter < 5 && currentRow < 6) {
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentLetter)
        tile.textContent = letter
        guesses[currentRow][currentLetter] = letter
        tile.setAttribute('data', letter)
        currentLetter++
    }
}

const deleteLetter = () => {
    if (currentLetter > 0) {
        currentLetter--
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentLetter)
        tile.textContent = ''
        guesses[currentRow][currentLetter] = ''
        tile.setAttribute('data', '')
    }
}

const checkWord = () => {
    const guess = guesses[currentRow].join('')
    if (currentLetter > 4) {
        fetch(`https://polish-wordle.herokuapp.com/check/?word=${guess.toLowerCase()}`)
            .then(response => response.json())
            .then(status => {
                if (status === 404 || status === 400) {
                    showMessage('brak słowa w słowniku', 3000, 'red')
                } else {
                    // TODO
                    // flipTile()
                    if (wordle === guess) {
                        flipTile()
                        showMessage('brawo!', 10000, 'green')
                        showMessage('(odśwież stronę po następne słowo)', 10000, 'green')
                        gameOver = true
                    } else {
                        flipTile()
                        //if current row == 4 call sjp to prepare a wordle meaning
                        if (currentRow === 4) {
                            fetch(`https://polish-wordle.herokuapp.com/whatdoesitmean?word=${wordle.toLowerCase()}`)
                                .then(response => response.json())
                                .then(sjpMeaning => {
                                    meaning = sjpMeaning
                                }).catch((error) => {
                                    console.error('meaning check fucked with ' + error.message)
                                })
                        }
                        if (currentRow >= 5) {
                            gameOver = true
                            let means = meaning === undefined ? '' : meaning.trim()
                            showMessage('koniec gry (odśwież stronę po następne słowo)', 120000, 'red')
                            showMessage('chodziło o ' + wordle, 120000, '#36b131')
                            showMessage(means, 120000, '#36b131')
                            return
                        }
                        if (currentRow < 5) {
                            currentRow++
                            currentLetter = 0
                        }
                    }
                }
            }).catch(err => console.log('check row fucked with ' + err.message))
    }
}

const showMessage = (message, time, color) => {
    const messageElement = document.createElement('p')
    if (color !== undefined) {
        messageElement.style.backgroundColor = color
    }
    messageElement.textContent = message
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement), time)
}

const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

const flipTile = () => {
    const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
    let wordleToCheck = wordle
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({letter: tile.getAttribute('data'), color: 'grey-layer'})
    })

    guess.forEach(guess => {
        if (wordleToCheck.includes(guess.letter)) {
            guess.color = 'yellow-layer'
            wordleToCheck = wordleToCheck.replace(guess.letter, '')
        }
    })

    guess.forEach((guess, index) => {
        if (guess.letter === wordle[index]) {
            guess.color = 'green-layer'
            wordleToCheck = wordleToCheck.replace(guess.letter, '')
        }
    })

    rowTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add('flip')
            tile.classList.add(guess[index].color)
            addColorToKey(guess[index].letter, guess[index].color)
        }, 200 * index)
    })
}

