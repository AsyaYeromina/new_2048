"use strict";

/* #region Variables */
let gameMatrix;
let score;
const MATRIX_COLUMNS = 4;
const MATRIX_ROWS = 4;
const WINNING_NUMBER = 2048;
const fieldRows = document.querySelectorAll(".field-row");
const fieldCells = Array.from(fieldRows).map((row) =>
  row.querySelectorAll(".field-cell")
);
const messages = document.querySelectorAll(".message");
const messageAfterStart = document.querySelector(".message-afterstart");
const messageLose = document.querySelector(".message-lose");
const messageWin = document.querySelector(".message-win");
const startButton = document.querySelector(".button");
const scoreNumberText = document.querySelector(".game-score");
const directionLeft = "ArrowLeft";
const directionRight = "ArrowRight";
const directionDown = "ArrowDown";
const directionUp = "ArrowUp";
const gameContainer = document.querySelector(".container");
/* #endregion */

/* #region Prevent scrolling on mobile */
// Function to check if an element is fully in the viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/* #endregion */

/* #region Main */
startButton.addEventListener("click", startGame);

function startGame() {
  gameMatrix = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  score = 0;
  updateFieldAppearance();
  scoreNumberText.innerText = `${score}`;
  startButton.classList.add("restart");
  startButton.innerText = "Restart";

  messages.forEach((message) => {
    if (message.className !== "hidden") {
      message.classList.add("hidden");
    }
  });
  messageAfterStart.classList.remove("hidden");

  addNewNumberToMatrix();
  addNewNumberToMatrix();
  updateFieldAppearance();
}

document.addEventListener("keyup", (e) => {
  messageAfterStart.classList.add("hidden");
  makeMove(e.key);
});

/* #region Touch Controls */
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const minSwipeDistance = 30; // Minimum distance for a swipe to be registered

// Add touch event listeners to the game field
const gameField = document.querySelector(".game-field");
gameField.addEventListener("touchstart", handleTouchStart, false);
gameField.addEventListener("touchmove", handleTouchMove, false);
gameField.addEventListener("touchend", handleTouchEnd, false);

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  // Prevent scrolling when swiping on the game
  event.preventDefault();
}

function handleTouchEnd(event) {
  touchEndX = event.changedTouches[0].clientX;
  touchEndY = event.changedTouches[0].clientY;

  // Calculate swipe distance
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  // Check if swipe distance is significant enough
  if (
    Math.abs(deltaX) > minSwipeDistance ||
    Math.abs(deltaY) > minSwipeDistance
  ) {
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Right swipe
        messageAfterStart.classList.add("hidden");
        makeMove(directionRight);
      } else {
        // Left swipe
        messageAfterStart.classList.add("hidden");
        makeMove(directionLeft);
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        // Down swipe
        messageAfterStart.classList.add("hidden");
        makeMove(directionDown);
      } else {
        // Up swipe
        messageAfterStart.classList.add("hidden");
        makeMove(directionUp);
      }
    }
  }
}

// Prevent default touch behavior when game container is in viewport
// But allow clicks on interactive elements like buttons
document.addEventListener(
  "touchmove",
  function (e) {
    // Check if the touch target is a button or other interactive element
    const target = e.target;
    const isButton =
      target.tagName === "BUTTON" ||
      target.classList.contains("button") ||
      target.closest(".button");

    // Don't prevent default if touching a button
    if (isButton) {
      return;
    }

    // Otherwise prevent scrolling when the game container is in viewport
    if (isElementInViewport(gameContainer)) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// For the game field, we still want to prevent scrolling but allow swipes
gameField.addEventListener(
  "touchmove",
  function (e) {
    // We still need this for the game field to handle swipes correctly
    e.preventDefault();
  },
  { passive: false }
);
/* #endregion */

function makeMove(direction) {
  const originalMatrix = gameMatrix.map((row) => [...row]);

  switch (direction) {
    case directionLeft:
      slideLeft(gameMatrix);
      break;
    case directionRight:
      slideRight(gameMatrix);
      break;
    case directionUp:
      slideUp(gameMatrix);
      break;
    case directionDown:
      slideDown(gameMatrix);
      break;
    default:
      break;
  }

  if (!areMatricesEqual(originalMatrix, gameMatrix)) {
    runAfterMoveTasks();
  }
}

function runAfterMoveTasks() {
  addNewNumberToMatrix();
  updateFieldAppearance();
  scoreNumberText.innerText = `${score}`;
  isGameOver();
}

function updateFieldAppearance() {
  for (let row = 0; row < gameMatrix.length; row++) {
    for (let col = 0; col < gameMatrix[row].length; col++) {
      const num = gameMatrix[row][col];
      const cell = fieldCells[row][col];

      cell.innerText = num === 0 ? "" : `${num}`;
      cell.className = "field-cell";

      if (num !== 0) {
        cell.classList.add(`field-cell--${num}`);
      }
    }
  }
}

function addNewNumberToMatrix() {
  const newRandomNum = getRandomIncluding(1, 10) === 10 ? 4 : 2;
  const emptyCells = [];

  for (let r = 0; r < gameMatrix.length; r++) {
    for (let c = 0; c < gameMatrix[r].length; c++) {
      if (gameMatrix[r][c] === 0) {
        emptyCells.push({
          row: r,
          col: c,
        });
      }
    }
  }

  if (emptyCells.length > 0) {
    const randomEmptyCell =
      emptyCells[getRandomIncluding(0, emptyCells.length - 1)];

    gameMatrix[randomEmptyCell.row][randomEmptyCell.col] = newRandomNum;

    // Apply the appear animation after the cell is updated
    setTimeout(() => {
      const cell = fieldCells[randomEmptyCell.row][randomEmptyCell.col];
      cell.classList.add("appear");

      // Remove the animation class after it completes to allow it to be reapplied
      setTimeout(() => {
        cell.classList.remove("appear");
      }, 300); // slightly longer than animation duration to ensure it completes
    }, 50); // small delay to ensure the DOM has updated
  }
}
/* #endregion */

/* #region Slide functions */
function mergeRow(row) {
  let mergedRow = row.filter((num) => num !== 0);

  for (let cell = 0; cell < mergedRow.length; cell++) {
    if (mergedRow[cell] === mergedRow[cell + 1]) {
      mergedRow[cell] = mergedRow[cell] * 2;
      mergedRow[cell + 1] = 0;
      score += mergedRow[cell];
      checkWin(mergedRow[cell]);
    }
  }
  mergedRow = mergedRow.filter((num) => num !== 0);

  return mergedRow;
}

function slideLeft(matrix) {
  for (let r = 0; r < matrix.length; r++) {
    const currentRow = matrix[r];

    if (currentRow.length) {
      const mergedRow = mergeRow(currentRow);
      const zeroesToAdd = matrix[r].length - mergedRow.length;
      const resultRow = mergedRow.concat(Array(zeroesToAdd).fill(0));

      matrix[r] = resultRow;
    }
  }

  return matrix;
}

function slideRight(matrix) {
  for (let r = 0; r < matrix.length; r++) {
    const currentRow = matrix[r];

    if (currentRow.length) {
      const reversedRow = currentRow.reverse();
      const mergedReversedRow = mergeRow(reversedRow);
      const mergedRevercedBackRow = mergedReversedRow.reverse();
      const zeroesToAdd = matrix[r].length - mergedRevercedBackRow.length;
      const resultRow = Array(zeroesToAdd)
        .fill(0)
        .concat(mergedRevercedBackRow);

      matrix[r] = resultRow;
    }
  }

  return matrix;
}

function slideDown(matrix) {
  const matrixRotated = rotateMatrix(matrix);
  const matrixRotatedSlidedLeft = slideLeft(matrixRotated);
  const matrixRotatedBack = rotateMatrixBack(matrixRotatedSlidedLeft);

  gameMatrix = matrixRotatedBack;
}

function slideUp(matrix) {
  const matrixRotated = rotateMatrix(matrix);
  const matrixRotatedSlidedRight = slideRight(matrixRotated);
  const matrixRotatedBack = rotateMatrixBack(matrixRotatedSlidedRight);

  gameMatrix = matrixRotatedBack;
}
/* #endregion */

/* #region Additional Functions */
function getRandomIncluding(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function isGameOver() {
  const hasEmptyCells = gameMatrix.some((row) =>
    row.some((cell) => cell === 0)
  );

  if (hasEmptyCells || isMovePossible()) {
    return false;
  }

  messageLose.classList.remove("hidden");

  return true;
}

function isMovePossible() {
  for (let r = 0; r < gameMatrix.length; r++) {
    for (let c = 0; c < gameMatrix[r].length - 1; c++) {
      if (gameMatrix[r][c] === gameMatrix[r][c + 1]) {
        return true;
      }
    }
  }

  for (let r = 0; r < gameMatrix.length - 1; r++) {
    for (let c = 0; c < gameMatrix[r].length; c++) {
      if (gameMatrix[r][c] === gameMatrix[r + 1][c]) {
        return true;
      }
    }
  }

  return false;
}

function checkWin(num) {
  if (num === WINNING_NUMBER) {
    messageWin.classList.remove("hidden");
  }
}

function rotateMatrix(matrix) {
  const matrixRotated = [...Array(MATRIX_COLUMNS)].map(() =>
    Array(MATRIX_ROWS)
  );

  for (let row = 0; row < MATRIX_ROWS; row++) {
    for (let cell = 0; cell < MATRIX_COLUMNS; cell++) {
      const currentElement = matrix[row][cell];

      matrixRotated[cell][MATRIX_ROWS - 1 - row] = currentElement;
    }
  }

  return matrixRotated;
}

function rotateMatrixBack(matrix) {
  const matrixRotated = [...Array(MATRIX_COLUMNS)].map(() =>
    Array(MATRIX_ROWS)
  );

  for (let row = 0; row < MATRIX_ROWS; row++) {
    for (let cell = 0; cell < MATRIX_COLUMNS; cell++) {
      const currentElement = matrix[row][cell];

      matrixRotated[MATRIX_COLUMNS - 1 - cell][row] = currentElement;
    }
  }

  return matrixRotated;
}

function areMatricesEqual(oldMatrix, newMatrix) {
  for (let r = 0; r < oldMatrix.length; r++) {
    for (let c = 0; c < oldMatrix[r].length; c++) {
      if (oldMatrix[r][c] !== newMatrix[r][c]) {
        return false;
      }
    }
  }

  return true;
}
/* #endregion */
