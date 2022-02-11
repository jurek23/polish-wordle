const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.keyboard-container')
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

const keys = [
    'Ą',
    'Ć',
    'Ę',
    'Ł',
    'Ó',
    'Ś',
    'Ń',
    'Ż',
    'Ź',
    'Q',
    'W',
    'E',
    'R',
    'T',
    'Y',
    'U',
    'I',
    'O',
    'P',
    'A',
    'S',
    'D',
    'F',
    'G',
    'H',
    'J',
    'K',
    'L',
    '«',
    'Z',
    'X',
    'C',
    'V',
    'B',
    'N',
    'M',
    'ENTER'
]
const guessRows = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', '']
]
let currentRow = 0
let currentTile = 0
let gameOver = false

guessRows.forEach((guessRow, guessRowIndex) => {
    const rowElement = document.createElement('div')
    rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)
    guessRow.forEach((_guess, guessIndex) => {
        const tileElement = document.createElement('div')
        tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex)
        tileElement.classList.add('tile')
        rowElement.append(tileElement)
    })
    tileDisplay.append(rowElement)
})

keys.forEach(key => {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id', key)
    buttonElement.addEventListener('click', () => handleClick(key))
    keyboard.append(buttonElement)
})

const handleClick = (letter) => {
    if (!gameOver) {
        if (letter === '«') {
            deleteLetter()
            return
        }
        if (letter === 'ENTER') {
            checkRow()
            return
        }
        addLetter(letter)
    }
}

const addLetter = (letter) => {
    if (currentTile < 5 && currentRow < 6) {
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = letter
        guessRows[currentRow][currentTile] = letter
        tile.setAttribute('data', letter)
        currentTile++
    }
}

const deleteLetter = () => {
    if (currentTile > 0) {
        currentTile--
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
        tile.textContent = ''
        guessRows[currentRow][currentTile] = ''
        tile.setAttribute('data', '')
    }
}

const checkRow = () => {
    const guess = guessRows[currentRow].join('')
    if (currentTile > 4) {
        fetch(`https://polish-wordle.herokuapp.com/check/?word=${guess.toLowerCase()}`)
            .then(response => response.json())
            .then(status => {
                if (status === 404 || status === 400) {
                    showMessage('brak słowa w słowniku', 3000, 'red')
                } else {
                    flipTile()
                    if (wordle === guess) {
                        showMessage('brawo!', 10000, 'green')
                        showMessage('(przeładuj stronę po następne słowo)', 10000, 'green')
                        gameOver = true
                    } else {
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
                            let means = meaning === undefined ? '' : ' (' + meaning.trim() + ')'
                            showMessage('koniec gry (przeładuj stronę po następne słowo)', 120000, 'red')
                            showMessage('chodziło o ' + wordle, 120000, '#36b131')
                            showMessage(means, 120000, '#36b131')
                            return
                        }
                        if (currentRow < 5) {
                            currentRow++
                            currentTile = 0
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
    let checkWordle = wordle
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({letter: tile.getAttribute('data'), color: 'grey-overlay'})
    })

    guess.forEach(guess => {
        if (checkWordle.includes(guess.letter)) {
            guess.color = 'yellow-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    guess.forEach((guess, index) => {
        if (guess.letter === wordle[index]) {
            guess.color = 'green-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
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

