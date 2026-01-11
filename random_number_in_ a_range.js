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

console.log (randomNumberInRange(1, 6));
console.log (randomNumberInRange(1, 6));
console.log (randomNumberInRange(1, 6));
console.log (randomNumberInRange(1, 6));
console.log (randomNumberInRange(1, 6));
console.log (randomNumberInRange(1, 6));
console.log (randomNumberInRange(1, 6));
console.log (randomNumberInRange(1, 6));
console.log (randomNumberInRange(1, 6),"\n");

console.log (randomNumberInRange(1, 9));
console.log (randomNumberInRange(1, 9));
console.log (randomNumberInRange(1, 9));
console.log (randomNumberInRange(1, 9));
console.log (randomNumberInRange(1, 9));
console.log (randomNumberInRange(1, 9));
console.log (randomNumberInRange(1, 9));
console.log (randomNumberInRange(1, 9));
console.log (randomNumberInRange(1, 9));
console.log (randomNumberInRange(1, 9));
