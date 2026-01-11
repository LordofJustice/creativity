console.log("Guess a number which is within [0️⃣ to 1️⃣ 0️⃣ 0️⃣]");
console.log("If it is same as random number given by system you would win the Game");
const emoji = ['😁','🙂','😑','😔','😭']

function playAgain() {
  const wantToPlayAgain = confirm("\n want to play again!");
  if (wantToPlayAgain) {
    playGame();
  }
}

function messageForWrongGuess(actual, expected) {
  if (actual < expected) {
    console.log("Your chosen value was [less] than expected value");
  } else {
    console.log("Your chosen value was [more] than expected value");
  }
  console.log("Try Again!\n\n")
}

function playGame() {
  const randomNumber = Math.floor((Math.random()) * 100);
  for (let times = 0; times < 5; times++) {
    const response = parseInt(prompt("Guess Number :"));
    if (response === randomNumber) {
      console.log("[✅] You Win! Hurray! 🙀🙀🙀");
      playAgain();
    } else {
      console.log(`[❌] Your Guess Was Wrong! ${emoji[times]}`);
      messageForWrongGuess(response, randomNumber);
    }
  }
  console.log(`Random Number was : ${randomNumber}`);
  playAgain();
}

playGame();