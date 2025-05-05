let canvas = document.getElementById('game-board');
let ctx = canvas.getContext('2d');
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore') || 0, 10);
let grid = 30;
let gameOver = false;

const rotateSound = document.getElementById('rotate-sound');
const lineClearSound = document.getElementById('line-clear-sound');
const gameOverSound = document.getElementById('game-over-sound');
const clickSound = document.getElementById('click-sound');

// Play sound function
function playSound(sound) {
    sound.currentTime = 0; // Reset sound to the beginning
    sound.play();
}

// Function to play rotate sound
function playRotateSound() {
    playSound(rotateSound);
}

// Function to play line clear sound
function playLineClearSound() {
    playSound(lineClearSound);
}

// Function to play game over sound
function playGameOverSound() {
    playSound(gameOverSound);
}

// Function to play click sound (for buttons)
function playClickSound() {
    playSound(clickSound);
}

let board = Array.from({ length: 20 }, () => Array(10).fill(0));
document.getElementById('game-screen').style.display = 'block'; // Make sure it's visible when the game starts

const TETROMINOS = [
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
];

function randomTetromino() {
    const random = Math.floor(Math.random() * TETROMINOS.length);
    return TETROMINOS[random];
}

let currentPiece = {
    shape: randomTetromino(),
    x: 3,
    y: 0
};

function drawBoard() {
    console.log("Drawing board...");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
            if (board[y][x] !== 0) {
                ctx.fillStyle = 'gray';
                ctx.fillRect(x * grid, y * grid, grid - 1, grid - 1);
            }
        }
    }

    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] === 1) {
                ctx.fillStyle = 'red';
                ctx.fillRect((currentPiece.x + col) * grid, (currentPiece.y + row) * grid, grid - 1, grid - 1);
            }
        }
    }

    document.getElementById('score').innerText = `Score: ${score}`;
}

function moveDown() {
    currentPiece.y++;
    if (collision()) {
        currentPiece.y--;
        placePiece();
    }
}

function collision() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] === 1) {
                if (
                    currentPiece.y + row >= 20 ||
                    currentPiece.x + col < 0 ||
                    currentPiece.x + col >= 10 ||
                    board[currentPiece.y + row][currentPiece.x + col] !== 0
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

function placePiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col] === 1) {
                board[currentPiece.y + row][currentPiece.x + col] = 1;
            }
        }
    }

    for (let row = 0; row < 20; row++) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(10).fill(0));
            score += 100;
            playLineClearSound(); // Play line clear sound when a line is cleared
        }
    }

    currentPiece = {
        shape: randomTetromino(),
        x: 3,
        y: 0
    };

    if (collision()) {
        gameOver = true;
        setTimeout(() => {
            playGameOverSound(); // Play game over sound
            alert("Game Over!");
        }, 100);
    }
}

function rotatePiece() {
    let newShape = [];
    for (let col = 0; col < currentPiece.shape[0].length; col++) {
        newShape[col] = [];
        for (let row = currentPiece.shape.length - 1; row >= 0; row--) {
            newShape[col].push(currentPiece.shape[row][col]);
        }
    }
    const backup = currentPiece.shape;
    currentPiece.shape = newShape;
    if (collision()) {
        currentPiece.shape = backup;
    }
    playRotateSound(); // Play rotate sound only
}

function moveLeft() {
    currentPiece.x--;
    if (collision()) currentPiece.x++;
}

function moveRight() {
    currentPiece.x++;
    if (collision()) currentPiece.x--;
}

function gameLoop() {
    if (gameOver) return;
    moveDown();
    drawBoard();
    setTimeout(gameLoop, 500);
}

function startGame() {
    gameOver = false;
    score = 0;
    board = Array.from({ length: 20 }, () => Array(10).fill(0));
    currentPiece = {
        shape: randomTetromino(),
        x: 3,
        y: 0
    };
    drawBoard();
    gameLoop();
}

// Handle key press events
document.addEventListener('keydown', function (event) {
    if (gameOver) return;

    switch (event.key) {
        case 'ArrowLeft': moveLeft(); break;
        case 'ArrowRight': moveRight(); break;
        case 'ArrowDown': moveDown(); break;
        case 'ArrowUp': rotatePiece(); break;
    }

    drawBoard();
});
// ✅ Handle swipe gestures for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleGesture() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) {
            moveRight();
        } else if (dx < -30) {
            moveLeft();
        }
    } else {
        if (dy > 30) {
            moveDown();
        } else if (dy < -30) {
            rotatePiece();
        }
    }

    drawBoard();
}
document.addEventListener("touchstart", function (e) {
    if (e.target === canvas) {
        e.preventDefault(); // only prevent default on canvas
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }
}, { passive: false });

document.addEventListener("touchend", function (e) {
    if (e.target === canvas) {
        e.preventDefault();
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        handleGesture();
    }
}, { passive: false });

 
// Restart game
document.getElementById('restart-button').addEventListener('click', () => {
    playClickSound();
    startGame();
});

// Back to Home
document.getElementById('back-to-home').addEventListener('click', () => {
    playClickSound();
    setTimeout(() => {
        window.location.href = "index.html";
    }, 300);
});

// 🔥 Automatically start the game on load
startGame();
