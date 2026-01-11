function randomNumberInRange(start, end) {
  let randomNumber = Math.random();
  randomNumber *= 10;
  randomNumber = Math.floor(randomNumber);
  if (randomNumber >= start && randomNumber <= end) {
    return randomNumber;
  } else {
    return randomNumberInRange (start, end);
  }
}

function randomMove(playedMoves) {
  const possibleMoves = ['11', '12', '13', '21', '22', '23', '31', '32', '33'];
  const botMove = possibleMoves[randomNumberInRange(0, 8)];
  if (playedMoves.includes(botMove)) {
    return randomMove(playedMoves);
  }
  return botMove;
}


function BOTMove(playedMoves) {
  const playerMoves = playerMovesList(playedMoves, 0);
  const botMoves = playerMovesList(playedMoves, 1);
  const winSets = [['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33'],
  ['11', '21', '31'], ['12', '22', '32'], ['13', '23', '33'],
  ['11', '22', '33'], ['13', '22', '31']
  ];
  const _botMove = opponentWinningCoordinate(winSets, playerMoves, botMoves);
  if (_botMove !== '') {
    return _botMove;
  }
  return randomMove(playedMoves);
}

function opponentWinningCoordinate(winningMoves, playerMoves, botMoves) {
  let matchFound = 0;
  let nextMove = "";
  for (let row = 0; row < winningMoves.length; row++) {

    for (let column = 0; column < 3; column++) {

      if (playerMoves.includes(winningMoves[row][column])) {
        matchFound++;
      } else {
        nextMove = winningMoves[row][column];
      }
      if ((matchFound === 2) && (column === 2) && !(botMoves.includes(nextMove))) return nextMove;
    }
    matchFound = 0;
    nextMove = '';
  }
  return '';
}

const player1 = prompt('User X Enter Your Name :');
console.log(`
  Enter Your Input like 12 or 23
  in this input 12 :
  1 is Row
  2 is Column`);
const players = [player1, "Bot 🤖"];

function isRepeating(playedMoves, userInput) {
  return playedMoves.includes(userInput);
}

function isValid(userInput) {
  const validInputs = ['11', '12', '13', '21', '22', '23', '31', '32', '33'];
  return validInputs.includes(userInput);
}

function nonRepeatedInput(playedMoves, userInput, currentPlayer) {
  if (isRepeating(playedMoves, userInput)) {
    console.log(`Sorry but Cordinate [${userInput}] is already Occupied!\n`)
    userInput = prompt(`[${currentPlayer}] Enter your Cordinates Again :`);
    return nonRepeatedInput(playedMoves, userInput, currentPlayer);
  } else if (!isValid(userInput)) {
    console.log(`Sorry but Cordinate ${userInput} is NOT VALID!\n`)
    userInput = prompt(`[${currentPlayer}] Enter your Cordinates Again :`);
    return nonRepeatedInput(playedMoves, userInput, currentPlayer);
  } else {
    return userInput;
  }
}

function displayGame(gameArray) {
  console.clear();
  console.log('\t⸻⸻⸻⸻')
  const firstRow = '\t ' + gameArray[0].join('');
  const secondRow = '\t ' + gameArray[1].join('');
  const thirdRow = '\t ' + gameArray[2].join('');
  const gameLayout = [firstRow, secondRow, thirdRow];
  
  console.log(gameLayout.join('\n'));
  console.log('\t⸻⸻⸻⸻')
}

function includes(array1, array2) {
  let matchFound = 0;
  for (let row = 0; row < array1.length; row++) {

    for (let column = 0; column < array2.length; column++) {

      if (array2.includes(array1[row][column])) {
        matchFound++;
      }
    }
    if (matchFound === array1[0].length) {
      return true;
    } else {
      matchFound = 0;
    }
  }
  return false;
}

function playerMovesList(palyedMoves, playerNo) {
  const playerMoves = [];
  for (let index = playerNo; index < palyedMoves.length; index += 2) {
    playerMoves.push(palyedMoves[index]);
  }
  return playerMoves;
}

function didWin(playedMoves) {
  const winSets = [['11', '12', '13'], ['21', '22', '23'], ['31', '32', '33'],
  ['11', '21', '31'], ['12', '22', '32'], ['13', '23', '33'],
  ['11', '22', '33'], ['13', '22', '31']
  ];
  const xMoves = playerMovesList(playedMoves, 0);
  const oMoves = playerMovesList(playedMoves, 1);
  return includes(winSets, xMoves) || includes(winSets, oMoves);
}

function playAgain() {
  const wantToPlayAgain = confirm("\nDo you want to play again ?");
  if (wantToPlayAgain) {
    playGame();
  } else {

  }
}

function userInput(turn, playedMoves, currentPlayer) {
  if (turn % 2 !== 0) {
    return BOTMove(playedMoves);
  }
  const userInput = prompt(`[${currentPlayer}] Enter your Cordinates :`);
  return nonRepeatedInput(playedMoves, userInput, currentPlayer);
}

function gameStart(players, playedMoves = []) {
  const gameArray = [["⬜️", "⬜️", "⬜️"], ["⬜️", "⬜️", "⬜️"], ["⬜️", "⬜️", "⬜️"]];
  let turn = 0;
  while (turn < 9 && !didWin(playedMoves)) {
    const currentPlayer = players[turn % 2];
    const input = userInput(turn, playedMoves, currentPlayer);
    playedMoves.push(input);
    const row = parseInt(input[0]) - 1;
    const column = parseInt(input[1]) - 1;
    gameArray[row][column] = '❌⭕️'[turn % 2];
    displayGame(gameArray);
    if (didWin(playedMoves)) {
      console.log(`[${currentPlayer}] Won the Game 🙀🙀🙀`);
      playAgain();
    }
    turn++;
  }
  if (turn === 9 && !didWin(playedMoves)) {
    console.log("\n[it's a Draw]\n");
    playAgain();
  }
}

function playGame() {
  gameStart(players);
}

playGame();