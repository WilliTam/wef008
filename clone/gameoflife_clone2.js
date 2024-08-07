// initial conditions
const unitLength = 30;
const boxColor = [150,120,130];
const strokeColor = 50;
let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let currentBoard;
let nextBoard;
let pace;

//q-Sel and eventListeners: pace
let runsPerSecond = document.querySelector("#runs-per-second");
let showRunsPerSecondValue = document.querySelector("#show-runs-per-second-value");
pace = runsPerSecond.value;
showRunsPerSecondValue.textContent = runsPerSecond.value;


//****** HOW ABOUT THAT WE ALSO ALLOW INPUTTING THE PACE NUMBER*/
runsPerSecond.addEventListener("input", ()=>
    {
        showRunsPerSecondValue.textContent = runsPerSecond.value;
        pace = parseInt(runsPerSecond.value);       //remember to parse the value into integer
    }
)

//q-Sel and eventListeners: survival and reproduction rules

let survivalMin = document.querySelector('#survival-min');
let survivalMax = document.querySelector('#survival-max');

//need to reset the constraint "max" when the "min" is input, and vice-versa
survivalMin.addEventListener("input", ()=> survivalMax.setAttribute('min', survivalMin.value));    
survivalMax.addEventListener("input", ()=> survivalMin.setAttribute('max', survivalMax.value));

let reproductionMin = document.querySelector('#reproduction-min');
let reproductionMax = document.querySelector('#reproduction-max');

reproductionMin.addEventListener("input", ()=> reproductionMax.setAttribute('min', reproductionMin.value));    
reproductionMax.addEventListener("input", ()=> reproductionMin.setAttribute('max', reproductionMax.value));


function setup() {
    /* Set the canvas to be under the element #canvas*/
    const canvas = createCanvas(windowWidth*0.8, windowHeight*0.8-100);
    canvas.parent(document.querySelector("#canvas"));
  
    /*Calculate the number of columns and rows */
    columns = floor(width / unitLength);
    rows = floor(height / unitLength);
  
    /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
    currentBoard = [];
    nextBoard = [];
    for (let i = 0; i < columns; i++) {
      currentBoard[i] = [];
      nextBoard[i] = [];
    }

    frameRate(pace/20);

    // Now both currentBoard and nextBoard are array of array of undefined values.
    init(); // Set the initial values of the currentBoard and nextBoard
    noLoop();
  }

  /**
 * Initialize/reset the board state
 */
function init() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = 0;
      nextBoard[i][j] = 0;
    }
  }
}

function draw() {
  background(255);
  generate();
  
  console.log(pace);  //for testing only
  frameRate(pace/20);

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (currentBoard[i][j] == 1) {
        fill(boxColor);
      } else {
        fill(255);
      }
      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
  console.log(currentBoard[10]);
  console.log(nextBoard[10]);
}

function generate() {
    //Loop over every single box on the board
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
              currentBoard[(x + i + columns) % columns][(y + j + rows) % rows];
          }
        }
  
        // Rules of Life
        if (currentBoard[x][y] == 1 && neighbors < survivalMin.value) {
          // Die of Loneliness
          nextBoard[x][y] = 0;
        } else if (currentBoard[x][y] == 1 && neighbors > survivalMax.value) {
          // Die of Overpopulation
          nextBoard[x][y] = 0;
        } else if (currentBoard[x][y] == 0 && (neighbors <= reproductionMax.value && neighbors >= reproductionMin.value)) {
          // New life due to Reproduction
          nextBoard[x][y] = 1;
        } else {
          // Stasis
          nextBoard[x][y] = currentBoard[x][y];
        }
      }
    }
  
    // Swap the nextBoard to be the current Board
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
  }

  /**
 * When mouse is dragged
 */
function mouseDragged() {
    /**
     * If the mouse coordinate is outside the board
     */
    if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
      return;
    }
    const x = Math.floor(mouseX / unitLength);
    const y = Math.floor(mouseY / unitLength);
    // console.log(`x, y: ${Math.floor(mouseX)}, ${Math.floor(mouseY)}; value: ${currentBoard[x][y]}`)
    currentBoard[x][y] = 1;
    // console.log(`x, y: ${Math.floor(mouseX)}, ${Math.floor(mouseY)}; value: ${currentBoard[x][y]}`)
    fill(boxColor);
    stroke(strokeColor);
    rect(x * unitLength, y * unitLength, unitLength, unitLength);
  }
  
  /**
   * When mouse is pressed
   */
  function mousePressed() {
    noLoop();
    // currentBoard = nextBoard;         //CAN I NOT TO ITERATE ONE MORE TIME WHEN PRESSING MOUSE
    mouseDragged();
    // console.log(currentBoard[10]);
    // console.log(nextBoard[10]);
  }
  
  /**
   * When mouse is released
   */
  
  // function mouseReleased() {
  //   loop();
  // }


  let startButton = document.querySelector("#start-game");
  startButton.addEventListener("click",()=>loop());

  let stopButton = document.querySelector("#stop-game");
  stopButton.addEventListener("click",()=>noLoop());


  document.querySelector("#reset-game").addEventListener("click", function () {
    init();
    redraw();
  });