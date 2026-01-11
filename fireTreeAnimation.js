const square = [
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
  ['⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️', '⬜️'],
]

function delay(){
  for (let count = 1; count < 1000078000; count++) {
    let timeDelay = 0;
    timeDelay++;
  }
}

function generatePatterns(array, animationCycle = 1) {
  for (let rowIndex = 0; rowIndex < array.length; rowIndex++) {
    for (let columnIndex = 0; columnIndex < array.length; columnIndex++) {
      const row = rowIndex;
      const column = columnIndex;
      if (mathmeticalOpration(row, column, animationCycle)) {
        array[rowIndex][columnIndex] = '🔥';
        display(array);
      }
    }
  }
  display(array);
  if (animationCycle === 10) return display(array);
  delay();
  generatePatterns(array, animationCycle + 1)
}

function display(array) {
  console.clear();

  const outputArray = [];
  for (let index = 0; index < array.length; index++) {
    const row = array[index].join('');
    outputArray.push(row)
  }
  console.log(outputArray.join('\n'));
}

function mathmeticalOpration(row, col, animationCycle) {
  switch (animationCycle) {
    case 1:
      return row === 9 && col === 4;
    case 2:
      return row === 8 && col === 4;
    case 3:
      return row === 7 && col === 4;
    case 4:
      return row === 6 && col === 4;
    case 5:
      return row === 5 && col === 4;
    case 6:
      return row === 4 && col === 4;
    case 7:
      return (row === 3 && col === 3) || (row === 3 && col === 5) 
      || (row === 5 && col === 3) || (row === 5 && col === 5) ;
    case 8:
      return (row === 4 && col === 6) || (row === 2 && col === 4) 
      || (row === 4 && col === 2) ;
    case 9:
      return (row === 2 && col === 2) || (row === 2 && col === 6) 
      || (row === 6 && col === 6) || (row === 6 && col === 2);
    case 10:
      return (row === 5 && col === 1) || (row === 3 && col === 1) 
      || (row === 1 && col === 3) || (row === 1 && col === 5) ||
       (row === 3 && col === 7)|| (row === 5 && col === 7);
    default:
      break;
  }
}

generatePatterns(square);