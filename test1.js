//write a function that takes input from one array and check in 
// another array that second array contains all elements are not;

//test case ['13','23','33'],['11','33', '13', '23'] --- true;
//test case ['11','22','33'],['11','33', '13', '23'] --- false;
//test case ['13','23','33'],['11','33', '13', '23'] --- true;

function includes(array1, array2) {
  let elementFound = 0;
  for (let row = 0; row < array1.length; row++) {
    for (let column = 0; column < array2.length; column++) {
      if (array2.includes(array1[row][column])) {
        elementFound++;
      }
    }
    if (elementFound === array1[0].length) {
      return true;
    } else {
      elementFound = 0;
    }
  }
  return false;
}

const allWinningCordinates = [
  ['11','12','13'],['21','22','23'],['31','32','33'],['11','21','31'],['12','22','32'],['13','23','33'],['11','22','33'],['13','22','31']
]

console.log(includes(allWinningCordinates,['33', '13', '23']));