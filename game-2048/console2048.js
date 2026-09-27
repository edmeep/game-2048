        function compactLine(line) {
            const result = line.filter(num => num !== 0);

            while (result.length < 4) {
                result.push(0);
            }

            return result;
        }

        /* test
        console.log(compactLine([2, 0, 2, 4]));   // 期望 [2, 2, 4, 0]
        console.log(compactLine([0, 0, 0, 2]));   // 期望 [2, 0, 0, 0]
        console.log(compactLine([0, 0, 0, 0]));   // 期望 [0, 0, 0, 0]
        console.log(compactLine([2, 4, 8, 16]));  // 期望 [2, 4, 8, 16]（无零可动）
        console.log(compactLine([0, 2, 0, 4]));   // 期望 [2, 4, 0, 0] */

        function mergeLineLeft(line) {
            const compacted = compactLine(line);
            const result = [];

            let i = 0;

            while (i < compacted.length) {
                
                if (compacted[i] !== 0 && compacted[i] === compacted[i+1]) {
                    result.push(compacted[i]*2);
                    i += 2;
                }
                else {
                    result.push(compacted[i]);
                    i += 1;
                }
            }
            while (result.length < 4) {
                result.push(0);
            }
            return result;
        }
        /*
        console.log(mergeLineLeft([2, 2, 2, 2]));   // [4, 4, 0, 0]
        console.log(mergeLineLeft([2, 2, 4, 0]));   // [4, 4, 0, 0]
        console.log(mergeLineLeft([4, 0, 4, 4]));   // [8, 4, 0, 0]
        console.log(mergeLineLeft([0, 0, 0, 0]));   // [0, 0, 0, 0] */
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

        function boardsEqual(boardA, boardB) {
            if (boardA.length !== boardB.length) {
                return false;
            }

            for (let row = 0; row < boardA.length; row++) {
                if (boardA[row].length !== boardB[row].length) {
                    return false;
                }

                for (let col = 0; col < boardA[row].length; col++) {
                    if (boardA[row][col] !== boardB[row][col]) {
                        return false;
                    }
                }
            }
            return true;
        }

        function hasTarget(board, target = 2048) {
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[row].length; col++) {

                    if (board[row][col] === target) {
                        return true;
                    }
                }
            }
            return false;
        }
        function canMove(board) {
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[row].length; col++) {

                    const val = board[row][col];

                    if (val === 0) {
                        return true;
                    }

                    if (col+1 < board[row].length && val === board[row][col+1]){
                        return true;
                    }

                    if (row+1 < board.length && val === board[row+1][col])
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        function isGameOver(board) {
            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[row].length; col++) {

                    const val = board[row][col];

                    if (val === 0) {
                        return false;
                    }

                    if (col+1 < board[row].length && val === board[row][col+1]) {
                        return false;
                    }

                    if (row+1 < board.length && val === board[row+1][col]) {
                        return false;
                    }
                }
            }
            return true;
        }

        function reverseLine(line) {
            return[...line].reverse();
        }

        function getColumn(board, col) {
            const column = [];

            for (let row = 0; row < board.length; row++) {
                column.push(board[row][col]);
            }
            return column;
        }

        function setColumn(board,col,line) {
            const newBoard = board.map(row => [...row]);
            for (let row = 0; row < newBoard.length; row++) {
                newBoard[row][col] = line[row];
            }
            return newBoard;
        }

        function moveLeft(board) {
            const newBoard = board.map(row => mergeLineLeft(row));
            return {
                board: newBoard,
                changed: !boardsEqual(board, newBoard)
            };
        }

        function moveRight(board) {
            const newBoard = board.map(row => reverseLine(mergeLineLeft(reverseLine(row))));
            return {
                board: newBoard,
                changed: !boardsEqual(board, newBoard)
            };
        }

        function moveUp(board) {
            let newBoard = board.map(row => [...row]);

            for (let col = 0; col < board[0].length; col++) {
                const column = getColumn(board, col);
                const merged = mergeLineLeft(column);
                newBoard = setColumn(newBoard, col, merged);
            }
            
            return {
                board: newBoard,
                changed: !boardsEqual(board, newBoard)
            };
        }

        function moveDown(board) {
            let newBoard = board.map(row => [...row]);

            for (let col = 0; col < board[0].length; col++) {
                const column = getColumn(board, col);
                const merged = reverseLine(mergeLineLeft(reverseLine(column)));
                newBoard = setColumn(newBoard, col, merged);
            }

            return {
                board: newBoard,
                changed: !boardsEqual(board, newBoard)
            };
        }

        function addRandomTile(board) {
            const emptyCells = getEmptyCells(board);

            if (emptyCells.length === 0) {
                return board.map(row => [...row]);
            }

            const randomIndex = Math.floor(Math.random()*emptyCells.length);
            const {row, col} = emptyCells[randomIndex];

            const newBoard = board.map(rowArr => [...rowArr]);
            newBoard[row][col] = 2;

            return newBoard;
        }

        function initGame() {
            const board = [];
            for (let row = 0; row < 4; row++) {
                board.push([0, 0, 0, 0]);
            }

            const boardOne = addRandomTile(board);
            const boardTwo = addRandomTile(boardOne);

            return boardTwo;
        }

        function startGame() {
            let board = initGame();

            console.log('===2048开始!===');
            console.log('操作:W上 / A左 / S下 / D右 ');
            console.table(board);

            while(true) {
                const input = prompt('请输入操作:W上 / A左 / S下 / D右');

                if (input === null) {
                    console.log('GameOver');
                    break;
                }

                const cmd = input.trim().toUpperCase();

                let result;
                if (cmd === 'W') {
                    result = moveUp(board);
                }else if (cmd === 'A') {
                    result = moveLeft(board);
                }else if (cmd === 'S') {
                    result = moveDown(board);
                }else if (cmd === 'D') {
                    result = moveRight(board);
                }else {
                    console.log('无效指令,请输入 W / A / S / D');
                    continue;
                }
                

                if (!result.changed) {
                    console.log('这个方向无法移动，换个方向试试');
                    continue;
                }

                board = addRandomTile(result.board);

                console.table(board);

                if (hasTarget(board)) {
                    console.log('成功!你达到了2048!');
                    break;
                }

                if (isGameOver(board)) {
                    console.log('YOU LOSE!没有可移动方向了')
                    break;
                }
            }
        }