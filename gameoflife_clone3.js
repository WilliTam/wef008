// initial conditions
const unitLength = 30;
const boxColor = [
  [200, 170, 170],
  [150, 130, 130],
  [110, 90, 90],
];
const candidateName = ["A"];
const strokeColor = 100;
let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let currentBoard;
let nextBoard;
let previousBoard;
let pace;

//q-Sel and eventListeners: pace
let runsPerSecond = document.querySelector("#runs-per-second");
let showRunsPerSecondValue = document.querySelector(
  "#show-runs-per-second-value"
);
pace = runsPerSecond.value;
showRunsPerSecondValue.textContent = runsPerSecond.value;

//q-Sel and eventListeners: candidate
const candidate = document.querySelector("#candidate"); //SELF-ADDED VARIABLE TO STORE MORE THAN ONE CANDIDATE

//****** HOW ABOUT THAT WE ALSO ALLOW INPUTTING THE PACE NUMBER*/
runsPerSecond.addEventListener("input", () => {
  showRunsPerSecondValue.textContent = runsPerSecond.value;
  pace = parseInt(runsPerSecond.value); //remember to parse the value into integer
});

//q-Sel and eventListeners: survival and reproduction rules
let survivalMin = document.querySelector("#survival-min");
let survivalMax = document.querySelector("#survival-max");

//need to reset the constraint "max" when the "min" is input, and vice-versa
survivalMin.addEventListener("input", () =>
  survivalMax.setAttribute("min", survivalMin.value)
);
survivalMax.addEventListener("input", () =>
  survivalMin.setAttribute("max", survivalMax.value)
);

let reproductionMin = document.querySelector("#reproduction-min");
let reproductionMax = document.querySelector("#reproduction-max");

reproductionMin.addEventListener("input", () =>
  reproductionMax.setAttribute("min", reproductionMin.value)
);
reproductionMax.addEventListener("input", () =>
  reproductionMin.setAttribute("max", reproductionMax.value)
);

//define the formula of size of canvas
function getCanvasWidth(width) {
  return floor((width * 0.8) / unitLength) * unitLength + 20;
}
function getCanvasHeight(height) {
  return floor((height * 0.8 - 100) / unitLength) * unitLength + 20;
}

function setup() {
  /* Set the canvas to be under the element #canvas*/

  const canvas = createCanvas(
    getCanvasWidth(windowWidth),
    getCanvasHeight(windowHeight)
  );
  canvas.parent(document.querySelector("#canvas"));

  produceEmptyMatrix();
  // Now both currentBoard and nextBoard are array of array of undefined values.
  init(); // Set the initial values of the currentBoard and nextBoard
  frameRate(pace / 20);

  noLoop();
}

function windowResized() {
  resizeCanvas(getCanvasWidth(windowWidth), getCanvasHeight(windowHeight));
  /*Calculate the number of columns and rows */
  produceEmptyMatrix();
  init();
  redraw();
}

/**
 * Initialize/reset the board state
 */
function init() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = 0;
      nextBoard[i][j] = 0;
      previousBoard[i][j] = 0;
    }
  }
}

function draw() {
  background(255);
  generate();

  console.log(pace); //for testing only
  paintboard();
  frameRate(pace / 20);
}

function paintboard() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (currentBoard[i][j] == "A") {
        if (previousBoard[i][j] == "A" || nextBoard[i][j] == "A") {
          if (previousBoard[i][j] == "A" && nextBoard[i][j] == "A") {
            fill(boxColor[2]);
          } else {
            fill(boxColor[1]);
          }
        } else {
          fill(boxColor[0]);
        }
      }
      // else if (currentBoard[i][j] == "B") {
      //   fill(boxColor[1]);
      // }
      else {
        fill(255);
      }
      stroke(strokeColor);
      strokeWeight(2);
      rect(i * unitLength + 10, j * unitLength + 10, unitLength, unitLength);
    }
  }
}

function generate() {
  // Loop over every single box on the board

  // for candidate A
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Count all living members in the Moore neighborhood(8 boxes surrounding)
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (i == 0 && j == 0) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge
          neighbors +=
            currentBoard[(x + i + columns) % columns][(y + j + rows) % rows] ===
            "A";
        }
      }

      // Rules of Life
      if (currentBoard[x][y] == "A" && neighbors < survivalMin.value) {
        // Die of Loneliness
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] == "A" && neighbors > survivalMax.value) {
        // Die of Overpopulation
        nextBoard[x][y] = 0;
      } else if (
        currentBoard[x][y] != "A" &&
        neighbors <= reproductionMax.value &&
        neighbors >= reproductionMin.value
      ) {
        // New life due to Reproduction
        nextBoard[x][y] = "A";
      } else {
        // Stasis
        nextBoard[x][y] = currentBoard[x][y];
      }
    }
  }

  // Swap the nextBoard to be the current Board
  [currentBoard, previousBoard, nextBoard] = [
    nextBoard,
    currentBoard,
    previousBoard,
  ];
  // console.log(nextBoard[10]);
  // console.log(currentBoard[10]);
  // console.log(previousBoard[10]);
}

/**
 * When mouse is dragged
 */
function mouseDragged() {
  /**
   * If the mouse coordinate is outside the board
   */
  if (mouseX - 10 > unitLength * columns || mouseY - 10 > unitLength * rows) {
    return;
  }
  const x = Math.floor((mouseX - 10) / unitLength);
  const y = Math.floor((mouseY - 10) / unitLength);
  if (x < 0 || y < 0) {
    return;
  }
  if (currentBoard[x][y] != "A") {
    currentBoard[x][y] = "A";
    fill(boxColor[0]);
    stroke(strokeColor);
    strokeWeight(2);
    rect(x * unitLength + 10, y * unitLength + 10, unitLength, unitLength);
  }
}

/**
 * When mouse is pressed
 */
function mousePressed() {
  console.log(mouseX,mouseY)
  if ((mouseX > 0 && mouseX < width) && (mouseY > 0 && mouseY < height)){
    console.log(mouseX,mouseY)
    noLoop();
    mouseDragged();
  }
  // currentBoard = nextBoard;         //CAN I NOT TO ITERATE ONE MORE TIME WHEN PRESSING MOUSE
}

/**
 * When mouse is released
 */
// function mouseReleased() {
//   loop();
// }

function produceEmptyMatrix() {
  /*Calculate the number of columns and rows */
  columns = floor((width - 20) / unitLength);
  rows = floor((height - 20) / unitLength);

  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];
  previousBoard = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
    previousBoard[i] = [];
  }
}

//q-Sel: buttons

let startPauseButton = document.querySelector("#start-pause");
startPauseButton.addEventListener("click", function () {
  console.log(isLooping());
  if (isLooping() === true) {
    noLoop();
    [nextBoard, currentBoard, previousBoard] = [
      currentBoard,
      previousBoard,
      nextBoard,
    ];
    paintboard();
  } else {
    loop();
  }
});

// loop());

//   return false;

// let stopButton = document.querySelector("#stop-game");
// stopButton.addEventListener("click", () => {
//   noLoop();
//   [nextBoard, currentBoard, previousBoard] = [
//     currentBoard,
//     previousBoard,
//     nextBoard,
//   ];
//   paintboard();
// });

let stepwiseButton = document.querySelector("#stepwise");
stepwiseButton.addEventListener("click", () => redraw());

let resetButton = document.querySelector("#reset-game");
resetButton.addEventListener("click", function () {
  init();
  runsPerSecond.value = 20;
  showRunsPerSecondValue.textContent = runsPerSecond.value;
  paintboard();
});

let randomButton = document.querySelector("#random-spawn");
let randomSpawnNumber = document.querySelector("#random-spawn-number");
randomButton.addEventListener("click", function () {
  init();
  console.log(randomSpawnNumber.value);
  for (n = 0; n < randomSpawnNumber.value; n++) {
    console.log("col: ", columns, ", row: ", rows);
    i = floor(random(columns));
    j = floor(random(rows));
    console.log("i: ", i, ", j ", j);
    while (currentBoard[i][j] != 0) {
      i = floor(random(columns));
      j = floor(random(rows));
    }
    currentBoard[i][j] = "A";
  }
  console.log(currentBoard);
  paintboard();
});

// keyboard setting
// let running = false;

let keyboardInsert = 0;
let boxNow = [,];
let boxPrevious = [,];

function keyPressed() {
  //spacebar to toggle looping and non-looping
  if (keyCode === 32) {
    console.log("space pressed");
    if (isLooping() === true) {
      noLoop();
      [nextBoard, currentBoard, previousBoard] = [
        currentBoard,
        previousBoard,
        nextBoard,
      ];
      paintboard();
    } else {
      loop();
    }
    return false;
  }

  //key 'P' for triggering keyboard spawning of cells.
  if (keyCode === 80) {
    noLoop();
    const x = floor(columns / 2);
    const y = floor(rows / 2);
    boxNow = [x, y];

    stroke([255, 128, 255]);
    strokeWeight(2);
    rect(
      boxNow[0] * unitLength + 10,
      boxNow[1] * unitLength + 10,
      unitLength,
      unitLength
    );

    keyboardInsert = 1;
  }

  //down
  if (keyCode === 40) {
    if (keyboardInsert == 1 && boxNow[1] < rows - 1) {
      boxPrevious = boxNow;
      boxNow = [boxNow[0], boxNow[1] + 1];
      moveBox();
    }
  }

  //up
  if (keyCode === 38) {
    if (keyboardInsert == 1 && boxNow[1] > 0) {
      boxPrevious = boxNow;
      boxNow = [boxNow[0], boxNow[1] - 1];
      moveBox();
    }
  }

  //left
  if (keyCode === 37) {
    if (keyboardInsert == 1 && boxNow[0] > 0) {
      boxPrevious = boxNow;
      boxNow = [boxNow[0] - 1, boxNow[1]];
      moveBox();
    }
  }

  //right
  if (keyCode === 39) {
    if (keyboardInsert == 1 && boxNow[0] < columns - 1) {
      boxPrevious = boxNow;
      boxNow = [boxNow[0] + 1, boxNow[1]];
      moveBox();
    }
  }

  if (keyCode === 13) {
    if (keyboardInsert == 1) {
      if (currentBoard[boxNow[0]][boxNow[1]] != "A") {
        currentBoard[boxNow[0]][boxNow[1]] = "A";
        fill(boxColor[0]);
        rect(
          boxNow[0] * unitLength + 10,
          boxNow[1] * unitLength + 10,
          unitLength,
          unitLength
        );
      }
    }
    console.log(boxNow[0], boxNow[1], currentBoard[boxNow[0]][boxNow[1]]);
  }

  // }
}

function moveBox() {
  noFill();
  stroke(strokeColor);
  strokeWeight(2);
  rect(
    boxPrevious[0] * unitLength + 10,
    boxPrevious[1] * unitLength + 10,
    unitLength,
    unitLength
  );
  stroke([255, 128, 255]);
  strokeWeight(2);
  rect(
    boxNow[0] * unitLength + 10,
    boxNow[1] * unitLength + 10,
    unitLength,
    unitLength
  );
}
