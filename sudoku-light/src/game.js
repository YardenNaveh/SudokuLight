import { getLevelData, levels, getTotalLevelCount } from './levels.js';
import { renderBoard, renderNumberPicker, updateScoreDisplay, renderLevelSelect, showCelebration, playSound } from './ui.js';

// Game state
let gameState = {
  currentLevel: 1,
  currentSubLevel: 1,
  score: 0,
  hintsLeft: 3,
  board: [],
  currentEmptyCell: null,
  unlockedLevels: [1],
  levelStars: {},
  playerName: '',
  consecutiveCorrect: 0,  // Track consecutive correct solutions
  squareOptions: [],      // Track available options for each square
};

// Initialize game
export function initGame() {
  // Create initial game state if needed
  gameState = {
    currentLevel: 1,
    currentSubLevel: 1,
    score: 0,
    hintsLeft: 3,
    board: [],
    currentEmptyCell: null,
    unlockedLevels: [1],
    levelStars: {},
    playerName: '',
    consecutiveCorrect: 0,
    squareOptions: []
  };
  
  // Try to load saved progress
  try {
    loadProgress();
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  
  // Create simple splash screen
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="splash-screen" style="cursor: pointer; text-align: center; padding: 20px;">
      <div class="splash-mascot" style="font-size: 64px; margin-bottom: 20px;">🚀</div>
      <div class="splash-logo" style="font-size: 2.5em; font-weight: bold; margin-bottom: 30px; color: #6200ee;">Sudoku Buddies</div>
      <button id="start-button" style="font-size: 1.2em; padding: 10px 20px; background-color: #6200ee; color: white; border: none; border-radius: 8px; cursor: pointer;">Tap to Start</button>
    </div>
  `;
  
  // Use a simple button with a direct click handler
  document.getElementById('start-button').onclick = function() {
    // Go to level select screen to avoid any issues
    showLevelSelect();
  };
}

// Show name input screen
function showNameInput() {
  const app = document.getElementById('app');
  
  // Create name input screen
  app.innerHTML = `
    <div class="name-input-screen">
      <h1>What's your name?</h1>
      <div class="name-input-container">
        <input type="text" id="player-name" class="player-name-input" placeholder="Enter your name" maxlength="20" autocomplete="off">
        <button id="start-game-btn" class="button primary">Let's Play!</button>
      </div>
      <div class="name-input-skip">or <a href="#" id="skip-name">skip</a></div>
    </div>
  `;
  
  // Style the input screen
  const nameInputScreen = document.querySelector('.name-input-screen');
  nameInputScreen.style.display = 'flex';
  nameInputScreen.style.flexDirection = 'column';
  nameInputScreen.style.alignItems = 'center';
  nameInputScreen.style.justifyContent = 'center';
  nameInputScreen.style.height = '100vh';
  
  const nameInput = document.getElementById('player-name');
  nameInput.style.fontSize = '1.5rem';
  nameInput.style.padding = '10px 15px';
  nameInput.style.borderRadius = '10px';
  nameInput.style.border = '2px solid #ccc';
  nameInput.style.marginBottom = '20px';
  nameInput.style.textAlign = 'center';
  nameInput.style.width = '80%';
  nameInput.style.maxWidth = '300px';
  
  const startButton = document.getElementById('start-game-btn');
  startButton.style.fontSize = '1.2rem';
  startButton.style.padding = '10px 20px';
  startButton.style.margin = '10px auto';
  startButton.style.display = 'block';
  
  const skipLink = document.querySelector('.name-input-skip');
  skipLink.style.marginTop = '20px';
  skipLink.style.fontSize = '1rem';
  skipLink.style.color = '#666';
  
  // Focus the input
  nameInput.focus();
  
  // Add event listeners
  startButton.addEventListener('click', handleNameSubmit);
  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    }
  });
  
  document.getElementById('skip-name').addEventListener('click', (e) => {
    e.preventDefault();
    gameState.playerName = '';
    showLevelSelect();
  });
}

// Handle name submission
function handleNameSubmit() {
  const nameInput = document.getElementById('player-name');
  const name = nameInput.value.trim();
  
  if (name) {
    gameState.playerName = name;
    saveProgress();
  }
  
  // Go directly to level 1 instead of the map
  startLevel(1, 1);
}

// Load progress from localStorage
function loadProgress() {
  console.log('Attempting to load progress...');
  const savedState = localStorage.getItem('sudokuLightState');
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      console.log('Loaded state:', parsedState);
      gameState.currentLevel = parsedState.currentLevel || 1;
      gameState.score = parsedState.score || 0;
      gameState.unlockedLevels = parsedState.unlockedLevels || [1];
      gameState.levelStars = parsedState.levelStars || {};
      gameState.playerName = parsedState.playerName || '';
      gameState.consecutiveCorrect = parsedState.consecutiveCorrect || 0;
      gameState.squareOptions = parsedState.squareOptions || [];
      console.log('Applied loaded state to gameState.');
    } catch (e) {
      console.error('Failed to parse saved state:', e);
      localStorage.removeItem('sudokuLightState');
    }
  } else {
    console.log('No saved progress found.');
  }
  updateScoreDisplay(gameState.score);
}

// Save progress to localStorage
export function saveProgress() {
  try {
    const stateToSave = {
      currentLevel: gameState.currentLevel,
      score: gameState.score,
      unlockedLevels: gameState.unlockedLevels,
      levelStars: gameState.levelStars,
      playerName: gameState.playerName,
      consecutiveCorrect: gameState.consecutiveCorrect,
      squareOptions: gameState.squareOptions
    };
    localStorage.setItem('sudokuLightState', JSON.stringify(stateToSave));
    console.log('Progress saved:', stateToSave);
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

// Function to reset progress
export function resetProgress() {
  console.log('Resetting progress...');
  localStorage.removeItem('sudokuLightState');
  gameState = {
    currentLevel: 1,
    currentSubLevel: 1,
    score: 0,
    hintsLeft: 3,
    board: [],
    currentEmptyCell: null,
    unlockedLevels: [1],
    levelStars: {},
    playerName: '',
    consecutiveCorrect: 0,
    squareOptions: [],
  };
  console.log('GameState reset.');
  showLevelSelect();
}

// Show level select screen
export function showLevelSelect() {
  renderLevelSelect(gameState.unlockedLevels, level => {
    gameState.currentLevel = level;
    showSubLevelSelect(level);
  }, gameState.score);
}

// Show sub-level select screen
function showSubLevelSelect(level) {
  // For simplicity, just start the level directly
  // In a full implementation, this would show sub-levels with stars
  startLevel(level, 1);
}

// Start a level with given parameters
export function startLevel(levelId, subLevelId) {
  console.log(`Starting level ${levelId}-${subLevelId}`);
  
  try {
    // Load level data
    const levelData = getLevelData(levelId, subLevelId);
    console.log('Level data:', levelData);
    
    // Store current level data in window object for UI access
    window.currentLevelData = levelData;
    
    // Initialize game state
    gameState.currentLevel = levelId;
    gameState.currentSubLevel = subLevelId;
    gameState.score = gameState.score || 0;
    gameState.consecutiveCorrect = gameState.consecutiveCorrect || 0;
    gameState.hintsLeft = 3; // Reset hints for each level
    
    // Special handling for level 6 (6x6 grids)
    if (levelId === 6) {
      console.log('Using special handling for Level 6 (6x6 grid)');
      try {
        // Generate board with timeout and error handling
        const generateBoardWithTimeout = () => {
          try {
            return generateBoard(levelData);
          } catch (e) {
            console.error('Error generating Level 6 board:', e);
            
            // Create a simple 6x6 board as fallback
            const fallbackBoard = Array.from({ length: 6 }, () => Array(6).fill(null));
            for (let i = 0; i < 6; i++) {
              for (let j = 0; j < 6; j++) {
                // Fill with correct values first
                fallbackBoard[i][j] = levelData.numbers[(i + j) % 6];
              }
            }
            
            // Hide some cells based on hideCount
            let hiddenCount = 0;
            while (hiddenCount < levelData.hideCount) {
              const i = Math.floor(Math.random() * 6);
              const j = Math.floor(Math.random() * 6);
              
              if (typeof fallbackBoard[i][j] !== 'object') {
                const correctValue = fallbackBoard[i][j];
                fallbackBoard[i][j] = { value: null, correctValue: correctValue };
                hiddenCount++;
              }
            }
            
            return fallbackBoard;
          }
        };
        
        // Try to generate the board with a timeout
        const boardPromise = new Promise((resolve) => {
          const board = generateBoardWithTimeout();
          resolve(board);
        });
        
        // Set a timeout to ensure we don't block too long
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.warn('Board generation timed out, using fallback');
            
            // Create a simple Latin Square pattern as fallback
            const fallbackBoard = Array.from({ length: 6 }, () => Array(6).fill(null));
            for (let i = 0; i < 6; i++) {
              for (let j = 0; j < 6; j++) {
                // Fill with Latin square pattern
                if (Math.random() < 0.7) { // 70% of cells filled
                  fallbackBoard[i][j] = levelData.numbers[(i + j) % 6];
                } else {
                  // Hide some cells
                  const correctValue = levelData.numbers[(i + j) % 6];
                  fallbackBoard[i][j] = { value: null, correctValue: correctValue };
                }
              }
            }
            
            resolve(fallbackBoard);
          }, 2000); // 2 second timeout
        });
        
        // Use the first result that completes
        Promise.race([boardPromise, timeoutPromise])
          .then(board => {
            gameState.board = board;
            renderGameScreen();
          })
          .catch(e => {
            console.error('Error in board generation promises:', e);
            // Final fallback
            const simpleBoard = Array.from({ length: 6 }, (_, i) => 
              Array.from({ length: 6 }, (_, j) => 
                (Math.random() < 0.7) ? 
                  levelData.numbers[(i + j) % 6] : 
                  { value: null, correctValue: levelData.numbers[(i + j) % 6] }
              )
            );
            gameState.board = simpleBoard;
            renderGameScreen();
          });
          
        return; // Early return to avoid normal flow
      } catch (e) {
        console.error('Critical error in Level 6 special handling:', e);
        // Continue to normal flow as fallback
      }
    }
    
    // Normal flow for other levels
    try {
      // Generate board based on level parameters
      gameState.board = generateBoard(levelData);
      renderGameScreen();
    } catch (e) {
      console.error('Error generating board:', e);
      showToast('Error loading level. Returning to level select...');
      setTimeout(() => showLevelSelect(), 2000);
    }
  } catch (e) {
    console.error('Error starting level:', e);
    showToast('Error loading level. Returning to level select...');
    setTimeout(() => showLevelSelect(), 2000);
  }
}

// Helper function to shuffle an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Generate a valid Sudoku board
function generateValidSudokuBoard(board, gridSize, numbers) {
  // Determine block dimensions (handle non-square grids like 6x6)
  let blockHeight, blockWidth;
  if (gridSize === 6) {
    blockHeight = 2;
    blockWidth = 3;
  } else if (Number.isInteger(Math.sqrt(gridSize))) {
    blockHeight = blockWidth = Math.sqrt(gridSize);
  } else {
    // Default or error for unsupported non-square, non-6x6 grids with squares
    // For now, default to simple pattern if squares are somehow enabled
    blockHeight = 1; 
    blockWidth = gridSize;
    console.warn(`Unsupported grid size ${gridSize} for square constraints. Using row/col only.`);
  }

  // Check if squares (block constraints) are enabled for this level
  const squaresEnabled = window.currentLevelData && window.currentLevelData.squares;

  // If squares are enabled, generate a board respecting row, column, AND block constraints
  if (squaresEnabled) {
    // This formula ensures row, column, and block constraints are met
    const pattern = (r, c) => (blockWidth * (r % blockHeight) + Math.floor(r / blockHeight) + c) % gridSize;
    const symbols = shuffle([...numbers]); // Shuffle the number pool [1, 2, 3, 4, 5, 6]

    // 1. Generate the base valid board using the pattern
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        board[r][c] = symbols[pattern(r, c)];
      }
    }
    
    // 2. Apply valid transformations for more randomness
    // Shuffle rows within bands
    for (let band = 0; band < gridSize / blockHeight; band++) {
      const startRow = band * blockHeight;
      const rowsInBand = [];
      for (let i = 0; i < blockHeight; i++) {
        rowsInBand.push(startRow + i);
      }
      const shuffledRowsInBand = shuffle([...rowsInBand]);
      
      // Apply the shuffle by swapping rows (need temporary storage)
      const bandRowsData = rowsInBand.map(r => [...board[r]]); // Copy rows in the band
      for(let i=0; i< blockHeight; i++){
         board[rowsInBand[i]] = bandRowsData[shuffledRowsInBand.indexOf(rowsInBand[i])];
      }
    }

    // Shuffle columns within stacks
    for (let stack = 0; stack < gridSize / blockWidth; stack++) {
      const startCol = stack * blockWidth;
      const colsInStack = [];
      for (let i = 0; i < blockWidth; i++) {
        colsInStack.push(startCol + i);
      }
      const shuffledColsInStack = shuffle([...colsInStack]);

      // Apply the shuffle by swapping columns (more complex)
      const stackColsData = []; 
      // Read the original data column by column for this stack
      for(let c=0; c< blockWidth; c++){
          const colIndex = colsInStack[c];
          stackColsData.push(board.map(row => row[colIndex])); // Get column data
      }
      // Write the shuffled data back column by column
      for(let c=0; c< blockWidth; c++){
          const originalColIndex = colsInStack[c];
          const targetColIndex = shuffledColsInStack[c];
          const dataToWrite = stackColsData[colsInStack.indexOf(targetColIndex)];
          for(let r=0; r<gridSize; r++){
              board[r][originalColIndex] = dataToWrite[r];
          }
      }
    }

    console.log(`Generated ${gridSize}x${gridSize} board with block constraints and shuffling.`);
    return; // Board generated with block constraints
  }
  
  // Fallback: For grids where squares aren't enabled, use a simple Latin Square pattern
  // This only guarantees unique numbers in rows and columns.
  console.warn(`Generating ${gridSize}×${gridSize} grid using simple Latin Square pattern (no block constraints).`);
  const symbols = shuffle([...numbers]); // Shuffle numbers for some variety
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      board[r][c] = symbols[(r + c) % gridSize];
    }
  }
}

// Special function to generate valid 6x6 Sudoku with 3x3 square constraints
// function generateValid6x6Board(board, numbers) { ... } // NO LONGER NEEDED

// Check if a move is valid in a 6x6 grid with 3x3 square constraints
// function isValid6x6Move(board, row, col, num) { ... } // NO LONGER NEEDED

// Validate that the board follows Sudoku rules
function validateBoard(board, gridSize, numbers) {
  try {
    const base = Math.sqrt(gridSize);
    const isSquareGrid = Number.isInteger(base);
    
    // Check if squares are enabled for this level
    const squaresEnabled = window.currentLevelData && window.currentLevelData.squares;
    
    // Safety check for invalid board
    if (!board || !Array.isArray(board) || board.length !== gridSize) {
      console.error('Invalid board structure in validateBoard');
      return false;
    }
    
    // Check each row
    for (let i = 0; i < gridSize; i++) {
      if (!board[i] || !Array.isArray(board[i]) || board[i].length !== gridSize) {
        console.error(`Row ${i} is not properly initialized`);
        return false;
      }
      
      const rowNumbers = new Set();
      for (let j = 0; j < gridSize; j++) {
        if (board[i][j] === null || board[i][j] === undefined) {
          console.error(`Cell at [${i},${j}] is null or undefined`);
          return false;
        }
        rowNumbers.add(board[i][j]);
      }
      if (rowNumbers.size !== gridSize) {
        console.error(`Row ${i} has duplicate numbers`);
        return false;
      }
    }
    
    // Check each column
    for (let j = 0; j < gridSize; j++) {
      const colNumbers = new Set();
      for (let i = 0; i < gridSize; i++) {
        colNumbers.add(board[i][j]);
      }
      if (colNumbers.size !== gridSize) {
        console.error(`Column ${j} has duplicate numbers`);
        return false;
      }
    }
    
    // Only check blocks if squares are enabled for this level
    if (!squaresEnabled) {
      return true; // Skip block validation if squares are not enabled
    }
    
    // For perfect square grids, check each block too
    if (isSquareGrid) {
      for (let br = 0; br < base; br++) {
        for (let bc = 0; bc < base; bc++) {
          const blockNumbers = new Set();
          for (let r = 0; r < base; r++) {
            for (let c = 0; c < base; c++) {
              blockNumbers.add(board[br * base + r][bc * base + c]);
            }
          }
          if (blockNumbers.size !== gridSize) {
            console.error(`Block at [${br},${bc}] has duplicate numbers`);
            return false;
          }
        }
      }
    }
    // Special case for 6x6 grid - check 2x3 blocks
    else if (gridSize === 6) {
      const blockHeight = 2;
      const blockWidth = 3;
      // Iterate through the blocks: 3 rows of blocks, 2 columns of blocks
      for (let blockRow = 0; blockRow < 3; blockRow++) { // Total rows (6) / Block height (2) = 3
        for (let blockCol = 0; blockCol < 2; blockCol++) { // Total cols (6) / Block width (3) = 2
          const blockNumbers = new Set();
          for (let r = 0; r < blockHeight; r++) {
            for (let c = 0; c < blockWidth; c++) {
              const cellRow = blockRow * blockHeight + r;
              const cellCol = blockCol * blockWidth + c;
              const cellValue = board[cellRow][cellCol];
              
              // When validating a GENERATED board, null/undefined is an error
              if (cellValue === null || cellValue === undefined) {
                console.error(`Validation Error: Generated board has empty cell at [${cellRow},${cellCol}] in block [${blockRow}, ${blockCol}]`);
                return false;
              }
              blockNumbers.add(cellValue);
            }
          }
          // A full 2x3 block in a solved 6x6 puzzle must contain exactly gridSize (6) unique numbers
          if (blockNumbers.size !== gridSize) {
             console.error(`Validation Error: Block at [${blockRow},${blockCol}] (2x3) has ${blockNumbers.size} unique numbers, expected ${gridSize}. Numbers: ${[...blockNumbers].join(',')}`);
             return false;
          }
        }
      }
    }
    
    return true;
  } catch (e) {
    console.error(`Global error in validateBoard: ${e.message}`);
    return false;
  }
}

// Generate board based on level parameters
function generateBoard(levelData) {
  const { gridSize, hideCount, numbers, patterns, squares } = levelData;
  
  console.log('Generating board with parameters:', { gridSize, hideCount, numbers });
  
  // Initialize the board with all empty cells
  const board = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
  
  // Initialize squareOptions to track available options for each cell
  gameState.squareOptions = Array.from({ length: gridSize }, () => 
    Array.from({ length: gridSize }, () => [...numbers])
  );
  
  // Generate a valid Sudoku board where each row and column contains each number exactly once
  generateValidSudokuBoard(board, gridSize, numbers);
  
  // Verify board validity
  const isValid = validateBoard(board, gridSize, numbers);
  console.log('Board validity check:', isValid);
  
  if (!isValid) {
    console.error('Generated an invalid board, retrying...');
    return generateBoard(levelData); // Recursive retry
  }
  
  // Hide some cells
  let hiddenCells = 0;
  let attempts = 0;
  const maxAttempts = gridSize * gridSize * 2; // Avoid infinite loops
  
  while (hiddenCells < hideCount && attempts < maxAttempts) {
    const i = Math.floor(Math.random() * gridSize);
    const j = Math.floor(Math.random() * gridSize);
    
    if (board[i][j] !== null && typeof board[i][j] !== 'object') {
      // Store the original value in a separate property for checking correctness
      const originalValue = board[i][j];
      
      // Ensure originalValue is a primitive (string or number), not an object
      let correctValue;
      if (originalValue === null || originalValue === undefined) {
        console.error(`Invalid value at position [${i}, ${j}]`);
        correctValue = 1; // Default to 1 if invalid
      } else if (typeof originalValue === 'object') {
        // Convert object to string
        correctValue = String(originalValue);
        console.warn(`Object found at [${i}, ${j}], converting to string: ${correctValue}`);
      } else {
        correctValue = originalValue;
      }
      
      console.log(`Setting cell [${i}, ${j}] correctValue to ${correctValue} (${typeof correctValue})`);
      
      board[i][j] = { 
        value: null, 
        correctValue: correctValue
      };
      hiddenCells++;
    }
    attempts++;
  }
  
  // Final verification to catch any issues
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = board[i][j];
      if (cell && typeof cell === 'object') {
        if (cell.correctValue === undefined || cell.correctValue === null) {
          console.error(`Missing correctValue at [${i}, ${j}]`);
          cell.correctValue = 1; // Set a default value to prevent errors
        } else if (typeof cell.correctValue === 'object') {
          console.error(`Object correctValue at [${i}, ${j}]: ${JSON.stringify(cell.correctValue)}`);
          cell.correctValue = String(cell.correctValue); // Convert to string
        }
      }
    }
  }
  
  return board;
}

// Render game screen
function renderGameScreen() {
  const app = document.getElementById('app');
  
  // Create container
  const container = document.createElement('div');
  container.className = 'container';
  
  // Level info
  const levelInfo = document.createElement('div');
  levelInfo.className = 'level-info';
  levelInfo.innerHTML = `<span>Planet ${gameState.currentLevel}</span> · <span>Riddle ${gameState.currentSubLevel}</span>`;
  levelInfo.style.margin = '10px 0';
  levelInfo.style.fontWeight = 'bold';
  levelInfo.style.color = '#4a2c91';
  container.appendChild(levelInfo);
  
  // Score banner
  const scoreBanner = document.createElement('div');
  scoreBanner.className = 'score-banner';
  scoreBanner.innerHTML = `
    <div class="score">
      <div class="score-label">Score</div>
      <div class="score-number">${gameState.score}</div>
    </div>
    <div class="hint-count">
      <div class="hint-label">Hints</div>
      <div class="hint-number">${gameState.hintsLeft}</div>
    </div>
    <div class="streak-count">
      <div class="streak-label">Streak</div>
      <div class="streak-number">${gameState.consecutiveCorrect}/5</div>
    </div>
  `;
  container.appendChild(scoreBanner);
  
  // Game board
  const boardElement = renderBoard(gameState.board, handleCellTap);
  container.appendChild(boardElement);
  
  // Controls
  const controls = document.createElement('div');
  controls.className = 'controls';
  
  // Hint button
  const hintButton = document.createElement('div');
  hintButton.className = 'button hint';
  hintButton.textContent = '💡 Hint';
  hintButton.addEventListener('click', handleHint);
  controls.appendChild(hintButton);
  
  // Next Riddle Button (initially disabled)
  const nextRiddleButton = document.createElement('button');
  nextRiddleButton.id = 'next-riddle-btn'; // Add ID for easy selection
  nextRiddleButton.className = 'button next-riddle-button';
  nextRiddleButton.textContent = 'Next Riddle →';
  nextRiddleButton.disabled = true; // Start disabled
  nextRiddleButton.addEventListener('click', goToNextRiddle);
  controls.appendChild(nextRiddleButton);
  console.log('Next Riddle button added to controls (disabled).'); // LOG
  
  // Back button
  const backButton = document.createElement('div');
  backButton.className = 'button';
  backButton.textContent = '🏠 Map';
  backButton.addEventListener('click', showLevelSelect);
  controls.appendChild(backButton);
  
  container.appendChild(controls);
  
  // Number picker (initially hidden)
  const numberPicker = renderNumberPicker(handleNumberPick);
  
  // Clear app and append new elements
  app.innerHTML = '';
  app.appendChild(container);
  app.appendChild(numberPicker);
  
  // === NEW: Auto-focus on the first empty cell ===
  let firstEmptyRow = -1, firstEmptyCol = -1;
  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      if (gameState.board[i][j] && gameState.board[i][j].value === null) {
        firstEmptyRow = i;
        firstEmptyCol = j;
        break; // Found the first empty cell
      }
    }
    if (firstEmptyRow !== -1) break;
  }

  if (firstEmptyRow !== -1) {
    // Need to slightly delay the tap to ensure the element is fully rendered
    setTimeout(() => {
      const firstEmptyCellElement = document.querySelector(`.cell[data-row="${firstEmptyRow}"][data-col="${firstEmptyCol}"]`);
      if (firstEmptyCellElement) {
        console.log(`Auto-focusing first empty cell: [${firstEmptyRow}, ${firstEmptyCol}]`);
        handleCellTap(firstEmptyCellElement, firstEmptyRow, firstEmptyCol);
      } else {
          console.error(`Could not find DOM element for first empty cell [${firstEmptyRow}, ${firstEmptyCol}]`)
      }
    }, 100); // 100ms delay should be sufficient
  }
  // === END NEW ===

  // Celebrations container
  const celebrations = document.createElement('div');
  celebrations.className = 'celebrations';
  app.appendChild(celebrations);
  
  // First-time voice guidance (if this is the first level)
  if (gameState.currentLevel === 1 && gameState.currentSubLevel === 1) {
    setTimeout(() => {
      speakText("Find the missing number!");
    }, 1000);
  }
}

// Handle cell tap
export function handleCellTap(cellElement, rowIndex, colIndex) {
  console.log('Cell tapped:', rowIndex, colIndex);
  const cell = gameState.board[rowIndex][colIndex];
  
  // Remove highlight from previously selected cell and threatening cells
  const previouslySelected = document.querySelector('.cell.selected');
  if (previouslySelected) {
    previouslySelected.classList.remove('selected');
  }
  const threateningCells = document.querySelectorAll('.cell.threatening');
  threateningCells.forEach(cell => cell.classList.remove('threatening'));
  
  // Only handle empty cells
  if (cell && cell.value === null) {
    console.log('Empty cell found. Preparing number picker.');
    gameState.currentEmptyCell = { element: cellElement, row: rowIndex, col: colIndex };
    
    // Highlight the selected cell
    cellElement.classList.add('selected');
    
    // Highlight threatening cells (same row, column, and block)
    highlightThreateningCells(rowIndex, colIndex);
    
    // Get the level data to know which numbers to show
    const levelData = getLevelData(gameState.currentLevel, gameState.currentSubLevel);
    console.log('Level data for picker:', levelData);
    const numberPicker = document.querySelector('.number-picker');
    console.log('Number picker element:', numberPicker);
    
    if (!numberPicker) {
      console.error('Number picker element not found!');
      return;
    }
    
    // Show the number picker (without the problematic animation for now)
    numberPicker.classList.add('open');
    
    // Populate number picker with correct options
    populateNumberPicker(gameState.squareOptions[rowIndex][colIndex] || levelData.numbers);
  } else {
    console.log('Cell not empty or invalid.');
  }
}

// Highlight cells that share the same row, column, or block as the selected cell
function highlightThreateningCells(rowIndex, colIndex) {
  const gridSize = gameState.board.length;
  const base = Math.sqrt(gridSize);
  const isSquareGrid = Number.isInteger(base);
  
  // Check if square restrictions are enabled for this level
  const squaresEnabled = window.currentLevelData && window.currentLevelData.squares;
  
  // Get all cells
  const cells = document.querySelectorAll('.cell');
  
  // Highlight cells in the same row
  for (let j = 0; j < gridSize; j++) {
    if (j !== colIndex) {
      const cellIndex = rowIndex * gridSize + j;
      cells[cellIndex].classList.add('threatening');
    }
  }
  
  // Highlight cells in the same column
  for (let i = 0; i < gridSize; i++) {
    if (i !== rowIndex) {
      const cellIndex = i * gridSize + colIndex;
      cells[cellIndex].classList.add('threatening');
    }
  }
  
  // Only highlight cells in the same block if square restrictions are enabled
  if (!squaresEnabled) {
    return; // Skip block highlighting if squares are not enabled
  }
  
  // For perfect square grids (4x4, 9x9), highlight cells in the same block
  if (isSquareGrid) {
    const blockRowStart = Math.floor(rowIndex / base) * base;
    const blockColStart = Math.floor(colIndex / base) * base;
    
    for (let i = 0; i < base; i++) {
      for (let j = 0; j < base; j++) {
        const r = blockRowStart + i;
        const c = blockColStart + j;
        if (r !== rowIndex || c !== colIndex) {
          const cellIndex = r * gridSize + c;
          cells[cellIndex].classList.add('threatening');
        }
      }
    }
  } 
  // Special case for 6x6 grid - use 2x3 regions
  else if (gridSize === 6) {
    const blockHeight = 2;
    const blockWidth = 3;
    // Determine which 2x3 block the cell is in
    const blockRowStart = Math.floor(rowIndex / blockHeight) * blockHeight; 
    const blockColStart = Math.floor(colIndex / blockWidth) * blockWidth; 
    
    // Highlight cells in the same 2x3 block
    for (let i = 0; i < blockHeight; i++) { // Iterate 0 to 1 (height 2)
      for (let j = 0; j < blockWidth; j++) { // Iterate 0 to 2 (width 3)
        const r = blockRowStart + i;
        const c = blockColStart + j;
        // Don't highlight the selected cell itself
        if (r !== rowIndex || c !== colIndex) {
          const cellIndex = r * gridSize + c;
          // Check if cell exists before adding class
          if(cells[cellIndex]) {
              cells[cellIndex].classList.add('threatening');
          }
        }
      }
    }
  }
}

// Populate number picker with options
function populateNumberPicker(numbers) {
  console.log('Populating number picker with:', numbers);
  const optionsContainer = document.querySelector('.number-picker-options');
  console.log('Options container:', optionsContainer);
  
  if (!optionsContainer) {
    console.error('Number picker options container not found!');
    return;
  }
  
  optionsContainer.innerHTML = '';
  
  numbers.forEach(num => {
    const option = document.createElement('div');
    option.className = 'number-option';
    option.textContent = num;
    option.dataset.number = num;
    option.addEventListener('click', () => handleNumberPick(num));
    optionsContainer.appendChild(option);
  });
  console.log('Number picker populated.');
}

// Handle number pick
export function handleNumberPick(number) {
  console.log('handleNumberPick called with number:', number);
  console.log('Current empty cell state:', gameState.currentEmptyCell);
  
  if (!gameState.currentEmptyCell) {
    console.error('handleNumberPick: No current empty cell selected!');
    return;
  }
  
  const { row, col, element } = gameState.currentEmptyCell;
  const cell = gameState.board[row][col];
  console.log(`Checking cell [${row}, ${col}]. Correct value: ${cell.correctValue}`);
  
  // Ensure number is of same type as correctValue for comparison (both should be strings or numbers)
  const numToCheck = typeof number === 'string' ? parseInt(number, 10) : number;
  const correctVal = typeof cell.correctValue === 'string' ? parseInt(cell.correctValue, 10) : cell.correctValue;
  
  console.log(`Comparing: number=${numToCheck} (${typeof numToCheck}), correctValue=${correctVal} (${typeof correctVal})`);
  
  // Check if correct
  if (numToCheck === correctVal) {
    console.log('Correct number picked!');
    // Update board state
    gameState.board[row][col].value = number;
    
    // Update cell display (use original number)
    element.textContent = number;
    element.classList.remove('empty');
    element.classList.add('filled');
    element.classList.add('filled-correctly');
    if (element) {
        element.classList.remove('selected');
        element.classList.remove('threatening');
    }
    document.querySelectorAll('.cell.threatening').forEach(cell => {
        cell.classList.remove('threatening');
    });
    setTimeout(() => element.classList.remove('filled-correctly'), 400);

    // Add score and play sound
    gameState.score += 1;
    updateScoreDisplay(gameState.score);
    saveProgress();
    playSound('correct');
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    // === NEW: Auto-advance logic ===
    let nextEmptyRow = -1, nextEmptyCol = -1;
    const gridSize = gameState.board.length;

    // Start searching from the cell AFTER the one just filled
    let searchRow = row;
    let searchCol = col + 1; // Start checking next column
    let searchComplete = false;
    
    while (!searchComplete) {
        if (searchCol >= gridSize) { // Move to next row
            searchRow++;
            searchCol = 0;
        }
        if (searchRow >= gridSize) { // Wrap around to start of board
            searchRow = 0;
            searchCol = 0;
        }
        if (searchRow === row && searchCol === col) { 
            // Completed a full loop back to the start
            searchComplete = true; 
            break; // Stop searching
        }
        
        // Check the current search cell
        if (gameState.board[searchRow][searchCol] && gameState.board[searchRow][searchCol].value === null) {
            nextEmptyRow = searchRow;
            nextEmptyCol = searchCol;
            searchComplete = true; // Found the next empty cell
            break;
        }
        
        // Move to the next column for the next iteration
        searchCol++;
    }

    // If we found a next empty cell, select it
    if (nextEmptyRow !== -1) {
      const nextCellElement = document.querySelector(`.cell[data-row="${nextEmptyRow}"][data-col="${nextEmptyCol}"]`);
      if (nextCellElement) {
        console.log(`Auto-advancing to next empty cell: [${nextEmptyRow}, ${nextEmptyCol}]`);
        // Close the current picker *before* tapping the next cell
        const currentPicker = document.querySelector('.number-picker');
        if (currentPicker) currentPicker.classList.remove('open');
        // Tap the next cell
        handleCellTap(nextCellElement, nextEmptyRow, nextEmptyCol);
        return; // Exit handleNumberPick early, as handleCellTap takes over
      } else {
           console.error(`Could not find DOM element for next empty cell [${nextEmptyRow}, ${nextEmptyCol}]`)
      }
    }
    // === END NEW ===

    // If we reach here, it means either no next empty cell was found (level complete)
    // or we couldn't find the DOM element for it. Proceed with normal completion check.

    // Close the number picker (if it wasn't closed by auto-advance)
    const numberPicker = document.querySelector('.number-picker');
    if (numberPicker) numberPicker.classList.remove('open');

    // Check if level complete
    console.log('Checking if level complete...');
    if (checkLevelComplete()) {
      // Only increment streak counter when the entire riddle is solved
      gameState.consecutiveCorrect++;
      console.log(`Consecutive correct answers: ${gameState.consecutiveCorrect}/5`);
      updateStreakDisplay(gameState.consecutiveCorrect);
      
      // Unlock next level if streak reaches 5
      if (gameState.consecutiveCorrect >= 5) {
        const nextLevel = gameState.currentLevel + 1;
        if (!gameState.unlockedLevels.includes(nextLevel)) {
          console.log(`Unlocking level ${nextLevel}`);
          gameState.unlockedLevels.push(nextLevel);
          showToast(`Congratulations! You've unlocked Planet ${nextLevel}!`);
          saveProgress();
        }
      }
      
      handleLevelComplete();
    }

    // Reset current empty cell as we are not auto-advancing
    console.log('Resetting current empty cell.');
    gameState.currentEmptyCell = null;

  } else {
    console.log('Incorrect number picked.');
    console.log(`Number picked: ${number} (${typeof number}), expected: ${cell.correctValue} (${typeof cell.correctValue})`);
    
    // Reset consecutive correct counter on incorrect answer ONLY if a riddle is incomplete
    // We don't want to reset streak when starting a new riddle
    if (gameState.consecutiveCorrect > 0) {
      gameState.consecutiveCorrect = 0;
      updateStreakDisplay(0);
      saveProgress();
      showToast("Streak reset! You need 5 correct answers in a row to advance.");
    }
    
    // Wrong answer - keep number picker open and cell selected
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
    playSound('wrong');
    
    // Do NOT reset currentEmptyCell to keep the cell selected
    // Do NOT close the number picker to allow for another choice
  }
}

// Update streak display
function updateStreakDisplay(count) {
  const streakNumber = document.querySelector('.streak-number');
  if (streakNumber) {
    streakNumber.textContent = `${count}/5`;
    
    // Add visual emphasis as the streak grows
    if (count >= 5) {
      streakNumber.style.color = '#ff5722'; // Bright orange color
      streakNumber.style.fontWeight = 'bold';
      streakNumber.style.fontSize = '1.2em';
      streakNumber.classList.add('pulse-animation');
    } else if (count >= 3) {
      // Getting close to achievement
      streakNumber.style.color = '#ff9800'; // Orange color
      streakNumber.style.fontWeight = 'bold';
      streakNumber.style.fontSize = '1.1em';
      streakNumber.classList.remove('pulse-animation');
    } else {
      // Reset style
      streakNumber.style.color = '';
      streakNumber.style.fontWeight = '';
      streakNumber.style.fontSize = '';
      streakNumber.classList.remove('pulse-animation');
    }
  }
  
  // Add pulse animation class if it doesn't exist
  if (!document.querySelector('.pulse-animation-style')) {
    const style = document.createElement('style');
    style.className = 'pulse-animation-style';
    style.textContent = `
      @keyframes pulse-streak {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      .pulse-animation {
        animation: pulse-streak 1s infinite;
      }
    `;
    document.head.appendChild(style);
  }
}

// Check if level is complete
function checkLevelComplete() {
  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      const cell = gameState.board[i][j];
      if (cell && cell.value === null) {
        console.log('checkLevelComplete: Found empty cell, returning false');
        return false;
      }
    }
  }
  console.log('checkLevelComplete: No empty cells found, returning true');
  return true;
}

// Handle level complete
function handleLevelComplete() {
  console.log('--- handleLevelComplete START ---');
  // Calculate stars based on hints used and time
  const stars = calculateStars();
  
  // Save stars for this level
  const levelKey = `${gameState.currentLevel}-${gameState.currentSubLevel}`;
  gameState.levelStars[levelKey] = Math.max(gameState.levelStars[levelKey] || 0, stars);
  
  // Update unlocked levels - Only if player has achieved 5 consecutive correct answers
  const nextLevel = gameState.currentLevel + 1;
  if (gameState.consecutiveCorrect >= 5 && !gameState.unlockedLevels.includes(nextLevel)) {
    console.log(`Unlocking level ${nextLevel}`);
    gameState.unlockedLevels.push(nextLevel);
    showToast(`Congratulations! You've unlocked Planet ${nextLevel}!`);
  }
  
  // Save progress
  saveProgress();
  
  // Show celebration animation (stars and confetti)
  console.log('Calling showCelebration...');
  showCelebration(stars, gameState.playerName);
  console.log('Returned from showCelebration.');
  
  // Speak congratulations with player's name if available
  if (gameState.playerName) {
    speakText(`Great job, ${gameState.playerName}!`);
  } else {
    speakText("Great job!");
  }
  
  // Enable the "Next Riddle" button immediately
  console.log('Enabling Next Riddle button...');
  const nextButton = document.getElementById('next-riddle-btn');
  console.log('Found Next Riddle button element:', nextButton);
  if (nextButton) {
    nextButton.disabled = false;
    console.log('Next Riddle button ENABLED.');
    // Optional: Add a visual cue like a class
    nextButton.classList.add('enabled');
  } else {
    console.error('Could not find Next Riddle button to enable!');
  }
  console.log('--- handleLevelComplete END ---');
}

// Calculate stars based on performance
function calculateStars() {
  const hintsUsed = 3 - gameState.hintsLeft;
  if (hintsUsed === 0) return 3;
  if (hintsUsed === 1) return 2;
  return 1;
}

// Handle hint button
function handleHint() {
  console.log('handleHint called with currentEmptyCell:', gameState.currentEmptyCell);
  
  if (gameState.hintsLeft <= 0) {
    console.log('No hints left.');
    return;
  }
  
  // If number picker is open but no cell is selected, try to find the selected cell
  if (!gameState.currentEmptyCell) {
    const selectedCell = document.querySelector('.cell.selected');
    console.log('No currentEmptyCell. Looking for selected cell:', selectedCell);
    
    if (selectedCell) {
      // Find the row and column from the DOM
      const cells = Array.from(document.querySelectorAll('.cell'));
      const cellIndex = cells.indexOf(selectedCell);
      if (cellIndex !== -1) {
        const boardSize = Math.sqrt(cells.length);
        const row = Math.floor(cellIndex / boardSize);
        const col = cellIndex % boardSize;
        console.log(`Found selected cell at row ${row}, col ${col}`);
        
        // Recreate the currentEmptyCell object
        gameState.currentEmptyCell = {
          element: selectedCell,
          row: row,
          col: col
        };
      }
    }
    
    // If we still don't have a currentEmptyCell, return
    if (!gameState.currentEmptyCell) {
      console.log('Could not find a selected cell for hint.');
      return;
    }
  }
  
  const { row, col, element } = gameState.currentEmptyCell;
  
  // Make sure we have a valid board cell at this position
  if (!gameState.board[row] || !gameState.board[row][col]) {
    console.error(`Invalid board position: [${row}, ${col}]`);
    return;
  }
  
  // Get the correct value
  const correctValue = String(gameState.board[row][col].correctValue);
  console.log(`Correct value for cell [${row}, ${col}] is ${correctValue}`);
  
  // Get the current options for this cell
  let options = gameState.squareOptions[row][col];
  if (!options || options.length === 0) {
    const levelData = getLevelData(gameState.currentLevel, gameState.currentSubLevel);
    options = [...levelData.numbers];
    gameState.squareOptions[row][col] = options;
  }
  
  console.log(`Current options for cell [${row}, ${col}]:`, options);
  
  // Filter out the correct value
  const wrongOptions = options.filter(opt => String(opt) !== correctValue);
  
  // If there are wrong options, remove one randomly
  if (wrongOptions.length > 0) {
    // Choose a random wrong option to remove
    const randomIndex = Math.floor(Math.random() * wrongOptions.length);
    const optionToRemove = wrongOptions[randomIndex];
    
    console.log(`Removing wrong option ${optionToRemove} from available options`);
    
    // Update the options for this cell
    gameState.squareOptions[row][col] = options.filter(opt => opt !== optionToRemove);
    
    // If the number picker is open, update it
    populateNumberPicker(gameState.squareOptions[row][col]);
    
    // Show a toast notification
    showToast(`Hint: ${optionToRemove} is not the correct number!`);
    
    // Play hint sound
    playSound('hint');
    
    // Deduct points and update hint count
    gameState.hintsLeft--;
    updateHintDisplay(gameState.hintsLeft);
    gameState.score = Math.max(0, gameState.score - 10);
    updateScoreDisplay(gameState.score);
  } else {
    // No wrong options left, just show a message
    showToast("The correct number is the only option left!");
  }
}

// Show a toast notification
function showToast(message) {
  let toast = document.getElementById('toast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  // Hide the toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Update hint display
function updateHintDisplay(count) {
  const hintNumber = document.querySelector('.hint-number');
  if (hintNumber) {
    hintNumber.textContent = count;
  }
}

// Set up parent dashboard
function setupParentDashboard() {
  const app = document.getElementById('app');
  
  // Create parent dashboard element
  const dashboard = document.createElement('div');
  dashboard.className = 'parent-dashboard';
  dashboard.innerHTML = `    <h2 class="dashboard-title">Parent Dashboard</h2>
    <button class="button dashboard-button" id="change-name">Change Player Name</button>
    <button class="button dashboard-button" id="reset-progress">Reset Progress</button>
    <button class="button dashboard-button" id="toggle-audio">Toggle Audio</button>
    <button class="button dashboard-button" id="view-scores">View Scores</button>
    <button class="button dashboard-button" id="close-dashboard">Close</button>
  `;
  
  app.appendChild(dashboard);
  
  // Set up long-press detection on app element
  let longPressTimer;
  const longPressTime = 3000; // 3 seconds
  
  app.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) { // Require 3 fingers
      longPressTimer = setTimeout(() => {
        document.querySelector('.parent-dashboard').classList.add('visible');
      }, longPressTime);
    }
  });
  
  app.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
  });
  
  // Add event listeners for dashboard buttons
  document.getElementById('change-name').addEventListener('click', () => {
    document.querySelector('.parent-dashboard').classList.remove('visible');
    showNameInput();
  });
  
  document.getElementById('reset-progress').addEventListener('click', () => {
    // Prompt for password
    const password = prompt("Please enter parent password to reset progress:");
    
    // Check if password is correct
    if (password === "1234") {
      localStorage.removeItem('sudokuLightState');
      gameState = {
        currentLevel: 1,
        currentSubLevel: 1,
        score: 0,
        hintsLeft: 3,
        board: [],
        currentEmptyCell: null,
        unlockedLevels: [1],
        levelStars: {},
        playerName: '',
        consecutiveCorrect: 0,
        squareOptions: [],
      };
      document.querySelector('.parent-dashboard').classList.remove('visible');
      initGame();
    } else if (password !== null) { // Only show error if user didn't cancel
      alert("Incorrect password. Progress not reset.");
    }
  });
  
  document.getElementById('toggle-audio').addEventListener('click', () => {
    // Toggle audio logic would go here
    document.querySelector('.parent-dashboard').classList.remove('visible');
  });
  
  document.getElementById('view-scores').addEventListener('click', () => {
    // Show scores logic would go here
    alert(`Current Score: ${gameState.score}${gameState.playerName ? '\nPlayer: ' + gameState.playerName : ''}`);
    document.querySelector('.parent-dashboard').classList.remove('visible');
  });
  
  document.getElementById('close-dashboard').addEventListener('click', () => {
    document.querySelector('.parent-dashboard').classList.remove('visible');
  });
}

// Helper function to speak text using Web Speech API
function speakText(text) {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech to prevent overlapping
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for children
    utterance.pitch = 1.2; // Slightly higher pitch
    speechSynthesis.speak(utterance);
  }
}

// Expose resetProgress globally for the button
window.resetGameProgress = resetProgress; 

// Function to navigate to the next riddle
function goToNextRiddle() {
  console.log('goToNextRiddle called.');
  
  // If we have 5 consecutive correct answers, proceed to next sublevel/level
  if (gameState.consecutiveCorrect >= 5) {
    let nextLevelId = gameState.currentLevel;
    let nextSubLevelId = gameState.currentSubLevel + 1;

    // Check if there are more sublevels in the current level
    const currentLevelData = getLevelData(gameState.currentLevel, 1);
    const subLevelCount = levels.find(l => l.id === gameState.currentLevel)?.subLevels.length || 3;

    if (nextSubLevelId > subLevelCount) {
      // Move to the first sublevel of the next level
      nextSubLevelId = 1;
      nextLevelId++;
      console.log('Moving to next major level. Resetting streak.');
      gameState.consecutiveCorrect = 0; // Reset streak when level increases
      
      // Handle wrapping after the last level (e.g., go back to level 1 or stay on map)
      const totalLevels = getTotalLevelCount();
      if (nextLevelId > totalLevels) {
        console.log('All levels completed! Showing level select.');
        showLevelSelect();
        return; // Stop here
      }
      // Check if the next level is unlocked
      if (!gameState.unlockedLevels.includes(nextLevelId)) {
         console.log(`Next level ${nextLevelId} is locked. Showing level select.`);
         showLevelSelect(); // Go to map if next level isn't unlocked
         return;
      }
    }
    
    console.log(`Starting next riddle: Level ${nextLevelId}, SubLevel ${nextSubLevelId}`);
    startLevel(nextLevelId, nextSubLevelId);
  } else {
    // Generate a new riddle at the same level
    console.log('Generating a new riddle at the same level');
    startLevel(gameState.currentLevel, gameState.currentSubLevel);
  }
}
