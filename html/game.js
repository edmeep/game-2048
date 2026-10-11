
const SIZE = 4;
const TARGET = 2048;

let board = [];          // 4x4 二维数组
let prevBoard = null;    // 用于判断哪些格子是新出现的
let score = 0;
let best = Number(localStorage.getItem('best2048') || 0);
let moves = 0;
let won = false;
let gameOver = false;

/* ================= DOM ================= */
const realboardEl = document.getElementById('realboard');
const scoreEl   = document.querySelector('.header .score .num');
const lastEl    = document.querySelector('.header .last .num');
const bestEl    = document.querySelector('.state .best .num');
const movesEl   = document.querySelector('.state .moves .num');
const tipsEl    = document.querySelector('.tips');
const btnNew    = document.getElementById('btnNew');
const btnRestart= document.getElementById('btnRestart');


function compactLine(line) {
            const result = line.filter(num => num !== 0);

            while (result.length < 4) {
                result.push(0);
            }

            return result;
        }
/* 修改mergeLineLeft让其返回得分） */
function mergeLineLeft(line) {
    const compacted = compactLine(line);
    const result = [];
    let gained = 0;
    let i = 0;

    while (i < compacted.length) {
        if (compacted[i] !== 0 && compacted[i] === compacted[i + 1]) {
            const merged = compacted[i] * 2;
            result.push(merged);
            gained += merged;      //新增：记录本次合并得分
            i += 2;
        } else {
            result.push(compacted[i]);
            i += 1;
        }
    }
    while (result.length < 4) result.push(0);
    return { line: result, gained };   // 返回对象
}

function getEmptyCells(board) {
            const emptyCells = []

            for (let row = 0; row < board.length; row++) {

                for (let col = 0; col < board[row].length; col++) {

                    if (board[row][col] === 0) {
                        emptyCells.push({row, col});
                    }
                }
            }
            return emptyCells;
        }

function boardsEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let r = 0; r < a.length; r++) {
        if (a[r].length !== b[r].length) return false;
        for (let c = 0; c < a[r].length; c++) {
            if (a[r][c] !== b[r][c]) return false;
        }
    }
    return true;
}

function hasTarget(board, target = TARGET) {
    for (const row of board)
        for (const val of row)
            if (val === target) return true;
    return false;
}

function isGameOver(board) {
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            const val = board[r][c];
            if (val === 0) return false;
            if (c + 1 < board[r].length && val === board[r][c + 1]) return false;
            if (r + 1 < board.length && val === board[r + 1][c]) return false;
        }
    }
    return true;
}

function reverseLine(line) { return [...line].reverse(); }

function getColumn(board, col) {
    const column = [];
    for (let row = 0; row < board.length; row++) column.push(board[row][col]);
    return column;
}

function setColumn(board, col, line) {
    const newBoard = board.map(row => [...row]);
    for (let row = 0; row < newBoard.length; row++) newBoard[row][col] = line[row];
    return newBoard;
}

/* 四个方向：改成 gained */
function moveLeft(board) {
    const newBoard = [];
    let gained = 0;
    for (const row of board) {
        const r = mergeLineLeft(row);
        newBoard.push(r.line);
        gained += r.gained;
    }
    return { board: newBoard, changed: !boardsEqual(board, newBoard), gained };
}

function moveRight(board) {
    const newBoard = [];
    let gained = 0;
    for (const row of board) {
        const r = mergeLineLeft(reverseLine(row));
        newBoard.push(reverseLine(r.line));
        gained += r.gained;
    }
    return { board: newBoard, changed: !boardsEqual(board, newBoard), gained };
}

function moveUp(board) {
    let newBoard = board.map(row => [...row]);
    let gained = 0;
    for (let col = 0; col < SIZE; col++) {
        const r = mergeLineLeft(getColumn(board, col));
        newBoard = setColumn(newBoard, col, r.line);
        gained += r.gained;
    }
    return { board: newBoard, changed: !boardsEqual(board, newBoard), gained };
}

function moveDown(board) {
    let newBoard = board.map(row => [...row]);
    let gained = 0;
    for (let col = 0; col < SIZE; col++) {
        const r = mergeLineLeft(reverseLine(getColumn(board, col)));
        newBoard = setColumn(newBoard, col, reverseLine(r.line));
        gained += r.gained;
    }
    return { board: newBoard, changed: !boardsEqual(board, newBoard), gained };
}

/*随机生成新块：90% 出 2，10% 出 4 */
function addRandomTile(board) {
    const emptyCells = getEmptyCells(board);
    if (emptyCells.length === 0) return board.map(row => [...row]);

    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
}

function initGame() {
    let b = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    b = addRandomTile(b);
    b = addRandomTile(b);
    return b;
}


function buildGrid() {
    realboardEl.innerHTML = '';
    for (let i = 0; i < SIZE * SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        realboardEl.appendChild(cell);
    }
}

function render() {
    const cells = realboardEl.children;

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const value = board[r][c];
            const cell = cells[r * SIZE + c];

            cell.textContent = value === 0 ? '' : String(value);
            cell.className = 'cell' + (value ? ' block' + value : '');


            if (value > TARGET) cell.classList.add('block2048');
            // 格子增加弹跳动画
            const changed = !prevBoard || prevBoard[r][c] !== value;
            if (value !== 0 && changed) {
                cell.classList.add('pop');
                setTimeout(() => cell.classList.remove('pop'), 150);
            }
        }
    }

    prevBoard = board.map(row => [...row]);

    // localstorage
    if (score > best) {
        best = score;
        localStorage.setItem('best2048', best);
    }
    scoreEl.textContent = score;
    lastEl.textContent  = best;   // header 的 last 当作“最高分”展示
    bestEl.textContent  = best;
    movesEl.textContent = moves;
}


function newGame() {
    board = initGame();
    prevBoard = null;
    score = 0;
    moves = 0;
    won = false;
    gameOver = false;
    tipsEl.textContent = 'OPERATIONS: USE ARROW KEYS / WASD TO MOVE.';
    render();
}

function checkGameState() {
    if (!won && hasTarget(board, TARGET)) {
        won = true;
        tipsEl.textContent = 'YOU WIN! 已达成 2048，可继续挑战更高分。';
        return;
    }
    if (isGameOver(board)) {
        gameOver = true;
        tipsEl.textContent = 'GAME OVER! 没有可移动的方向了，点 RESTART 重来。';
    }
}

function handleMove(dir) {
    if (gameOver) return;

    const handlers = {
        left: moveLeft, right: moveRight, up: moveUp, down: moveDown
    };
    const result = handlers[dir](board);

    if (!result.changed) return;   // 这个方向动不了，不加新块

    board = addRandomTile(result.board);
    score += result.gained;
    moves += 1;

    render();
    checkGameState();
}

/*   事件绑定     */
document.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    const map = {
        arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right'
    };
    const dir = map[key];
    if (!dir) return;
    e.preventDefault();            // 阻止方向键滚动页面
    handleMove(dir);
});

// 移动端滑动
let startX = 0, startY = 0;
realboardEl.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}, { passive: true });

realboardEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return; 
    if (Math.abs(dx) > Math.abs(dy)) {
        handleMove(dx > 0 ? 'right' : 'left');
    } else {
        handleMove(dy > 0 ? 'down' : 'up');
    }
}, { passive: true });

btnNew.addEventListener('click', newGame);
btnRestart.addEventListener('click', newGame);

/* ==========================================================
   5. 启动
   ========================================================== */
buildGrid();
newGame();