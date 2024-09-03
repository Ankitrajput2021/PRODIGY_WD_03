const cells = document.querySelectorAll('.cell');
const messageElement = document.getElementById('message');
const restartButton = document.getElementById('restartButton');
const playerModeSelect = document.getElementById('playerMode');
const playerXScoreElement = document.getElementById('playerXScore');
const playerOScoreElement = document.getElementById('playerOScore');

let currentPlayer = 'X';
let gameState = Array(9).fill(null);
let gameActive = true;
let vsAI = false;

let playerXScore = 0;
let playerOScore = 0;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Update player mode based on selection
playerModeSelect.addEventListener('change', () => {
    vsAI = playerModeSelect.value === 'vs-ai';
    restartGame();
});

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = clickedCell.getAttribute('data-index');

    if (gameState[clickedCellIndex] !== null || !gameActive) {
        return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;

    checkResult();

    if (vsAI && gameActive && currentPlayer === 'O') {
        aiMove();
    }
}

function aiMove() {
    const bestMove = minimax(gameState, 'O').index;
    gameState[bestMove] = 'O';
    cells[bestMove].textContent = 'O';
    checkResult();
}

function minimax(newGameState, player) {
    const availableSpots = newGameState.reduce((acc, el, i) => {
        if (el === null) acc.push(i);
        return acc;
    }, []);

    if (checkWin(newGameState, 'X')) {
        return { score: -10 };
    } else if (checkWin(newGameState, 'O')) {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];

    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        newGameState[availableSpots[i]] = player;

        if (player === 'O') {
            const result = minimax(newGameState, 'X');
            move.score = result.score;
        } else {
            const result = minimax(newGameState, 'O');
            move.score = result.score;
        }

        newGameState[availableSpots[i]] = null;
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function checkWin(board, player) {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}

function checkResult() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        messageElement.textContent = `Player ${currentPlayer} wins!`;
        updateScore(currentPlayer);
        gameActive = false;
        return;
    }

    if (!gameState.includes(null)) {
        messageElement.textContent = 'Game is a draw!';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    messageElement.textContent = `It's ${currentPlayer}'s turn`;

    if (vsAI && currentPlayer === 'O') {
        aiMove();
    }
}

function updateScore(player) {
    if (player === 'X') {
        playerXScore++;
        playerXScoreElement.textContent = playerXScore;
    } else if (player === 'O') {
        playerOScore++;
        playerOScoreElement.textContent = playerOScore;
    }
}

function restartGame() {
    currentPlayer = 'X';
    gameState.fill(null);
    gameActive = true;
    cells.forEach(cell => cell.textContent = '');
    messageElement.textContent = `It's ${currentPlayer}'s turn`;

    if (vsAI && currentPlayer === 'O') {
        aiMove();
    }
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);