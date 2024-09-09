/*
*
* "board" is a matrix that holds data about the
* game board, in a form of BoardSquare objects
*
* openedSquares holds the position of the opened squares
*
* flaggedSquares holds the position of the flagged squares
*
 */
let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;


/*
*
* the probability of a bomb in each square
*
 */
let bombProbability = 3;
let maxProbability = 15;


// Initializarea si generarea tabloului in functie de dificultatea aleasa:

function minesweeperGameBootstrapper(rowCount, colCount) {
    let difficulties = {
        easy: { rowCount: 9, colCount: 9 },
        medium: { rowCount: 16, colCount: 16 },
        hard: { rowCount: 24, colCount: 24 }
    };

    let selectedDifficulty = document.getElementById('difficulty').value;
    if (!rowCount || !colCount) {
        rowCount = difficulties[selectedDifficulty].rowCount;
        colCount = difficulties[selectedDifficulty].colCount;
    }
    //preiau valorile introduse in joc:
    bombProbability = parseInt(document.getElementById('bombProbability').value);
    maxProbability = parseInt(document.getElementById('maxProbability').value);

    generateBoard({ rowCount, colCount });
}


function generateBoard(boardMetadata) {
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;
    bombCount = 0;

    for (let i = 0; i < boardMetadata.colCount; i++) {
        board[i] = new Array(boardMetadata.rowCount);
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }

    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }

    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            if (!board[i][j].hasBomb) {
                board[i][j].bombsAround = countBombsAround(i, j, boardMetadata.colCount, boardMetadata.rowCount);
            }
        }
    }

    renderBoard(boardMetadata.colCount, boardMetadata.rowCount);
    console.log(board);
}


function countBombsAround(x, y, colCount, rowCount) {
    let bombCount = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (x + i >= 0 && x + i < colCount && y + j >= 0 && y + j < rowCount) {
                if (board[x + i][y + j].hasBomb) {
                    bombCount++;
                }
            }
        }
    }
    return bombCount;
}

function renderBoard(colCount, rowCount) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
    gameBoard.innerHTML = '';

    for (let i = 0; i < colCount; i++) {
        for (let j = 0; j < rowCount; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => discoverSquare(i, j));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlagSquare(i, j);
            });
            gameBoard.appendChild(cell);
        }
    }
}

function discoverSquare(x, y) {
    if (board[x][y].revealed || board[x][y].flagged) {
        return;
    }

    board[x][y].revealed = true;
    openedSquares.push(new Pair(x, y));
    squaresLeft--;

    const cell = document.querySelector(`[data-row="${x}"][data-col="${y}"]`);
    cell.classList.add('revealed');

    if (board[x][y].hasBomb) {
        cell.textContent = '💣';
        alert("Game Over!");
    } else {
        const bombsAround = board[x][y].bombsAround;
        cell.textContent = bombsAround > 0 ? bombsAround : '';
        if (bombsAround === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (x + i >= 0 && x + i < board.length && y + j >= 0 && y + j < board[0].length) {
                        discoverSquare(x + i, y + j);
                    }
                }
            }
        }
    }

    if (squaresLeft === bombCount) {
        alert("You won!");
    }
}

function toggleFlagSquare(x, y) {
    if (board[x][y].revealed) return;

    const cell = document.querySelector(`[data-row="${x}"][data-col="${y}"]`);
    if (board[x][y].flagged) {
        board[x][y].flagged = false;
        cell.classList.remove('flagged');
        flaggedSquares = flaggedSquares.filter(square => square.x !== x || square.y !== y);
    } else {
        board[x][y].flagged = true;
        cell.classList.add('flagged');
        flaggedSquares.push(new Pair(x, y));
    }
}

class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
        this.revealed = false;
        this.flagged = false;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

document.getElementById('start-game').addEventListener('click', () => {
    const difficulty = document.getElementById('difficulty').value;
    const { rowCount, colCount } = difficulty === 'easy' ? { rowCount: 9, colCount: 9 } :
                                  difficulty === 'medium' ? { rowCount: 16, colCount: 16 } :
                                  { rowCount: 24, colCount: 24 };

    minesweeperGameBootstrapper(rowCount, colCount);
});
