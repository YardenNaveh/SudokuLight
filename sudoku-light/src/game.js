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
};

// Initialize game
export function initGame() {
  loadProgress();
  
  // Show splash screen initially
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="splash-screen">
      <div class="splash-mascot">🚀</div>
      <div class="splash-logo">Sudoku Buddies</div>
      <div class="splash-tap">Tap anywhere to start</div>
    </div>
  `;
  
  // Add event listener to splash screen
  document.querySelector('.splash-screen').addEventListener('click', () => {
    document.querySelector('.splash-screen').style.display = 'none';
    
    // Skip name input if player name already exists
    if (gameState.playerName) {
      console.log(`Player name already exists: ${gameState.playerName}. Skipping name input.`);
      showLevelSelect();
    } else {
      showNameInput();
    }
  });
  
  // Set up parent dashboard (hidden behind long press)
  setupParentDashboard();
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
  
  showLevelSelect();
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
      playerName: gameState.playerName
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

// Start a level
export function startLevel(levelId, subLevelId) {
  gameState.currentLevel = levelId;
  gameState.currentSubLevel = subLevelId;
  gameState.hintsLeft = 3;
  
  const levelData = getLevelData(levelId, subLevelId);
  gameState.board = generateBoard(levelData);
  
  renderGameScreen();
}

// Generate board based on level parameters
function generateBoard(levelData) {
  const { gridSize, hideCount, numbers, patterns } = levelData;
  const board = [];
  
  // Fill the board with numbers according to Sudoku rules
  for (let i = 0; i < gridSize; i++) {
    const row = [];
    for (let j = 0; j < gridSize; j++) {
      // For simplicity and for very young children, we'll use a deterministic pattern
      // In a real Sudoku, we would use a more complex algorithm to ensure uniqueness
      const value = numbers[(i + j) % numbers.length];
      row.push(value);
    }
    board.push(row);
  }
  
  // Hide some cells
  let hiddenCells = 0;
  while (hiddenCells < hideCount) {
    const i = Math.floor(Math.random() * gridSize);
    const j = Math.floor(Math.random() * gridSize);
    
    if (board[i][j] !== null) {
      // Store the original value in a separate property for checking correctness
      const originalValue = board[i][j];
      board[i][j] = { value: null, correctValue: originalValue };
      hiddenCells++;
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
  
  // Remove highlight from previously selected cell
  const previouslySelected = document.querySelector('.cell.selected');
  if (previouslySelected) {
    previouslySelected.classList.remove('selected');
  }
  
  // Only handle empty cells
  if (cell && cell.value === null) {
    console.log('Empty cell found. Preparing number picker.');
    gameState.currentEmptyCell = { element: cellElement, row: rowIndex, col: colIndex };
    
    // Highlight the selected cell
    cellElement.classList.add('selected');
    
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
    /* anime({
      targets: numberPicker,
      translateY: ['100%', '0%'],
      duration: 300,
      easing: 'easeOutCubic'
    }); */
    
    // Populate number picker with correct options
    populateNumberPicker(levelData.numbers);
  } else {
    console.log('Cell not empty or invalid.');
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
  
  // Check if correct
  if (number === cell.correctValue) {
    console.log('Correct number picked!');
    // Update board state
    gameState.board[row][col].value = number;
    
    // Close the number picker when correct
    const numberPicker = document.querySelector('.number-picker');
    if (numberPicker) { // Check if picker exists
      numberPicker.classList.remove('open');
    } else {
      console.error('Number picker element not found when trying to close!');
    }
    
    // Update cell display
    element.textContent = number;
    element.classList.remove('empty');
    element.classList.add('filled');
    element.classList.add('filled-correctly'); // Add animation class
    if (element) {
      element.classList.remove('selected'); // Remove highlight
    }
    // Remove animation class after it finishes
    setTimeout(() => element.classList.remove('filled-correctly'), 400);
    
    // Add score and play sound
    gameState.score += 1;
    updateScoreDisplay(gameState.score);
    console.log('Score updated in state and updateScoreDisplay called. New score:', gameState.score);
    saveProgress();
    
    playSound('correct');
    
    // Use haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Check if level complete
    console.log('Checking if level complete...');
    if (checkLevelComplete()) {
      handleLevelComplete();
    }
    
    // Reset current empty cell only for correct answers
    console.log('Resetting current empty cell.');
    gameState.currentEmptyCell = null;
  } else {
    console.log('Incorrect number picked.');
    // Wrong answer - keep number picker open and cell selected
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
    playSound('wrong');
    
    // Do NOT reset currentEmptyCell to keep the cell selected
    // Do NOT close the number picker to allow for another choice
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
  console.log('--- handleLevelComplete START ---'); // LOG
  // Calculate stars based on hints used and time
  const stars = calculateStars();
  
  // Save stars for this level
  const levelKey = `${gameState.currentLevel}-${gameState.currentSubLevel}`;
  gameState.levelStars[levelKey] = Math.max(gameState.levelStars[levelKey] || 0, stars); // Don't overwrite with fewer stars
  
  // Update unlocked levels
  const nextLevel = gameState.currentLevel + 1;
  if (!gameState.unlockedLevels.includes(nextLevel) && gameState.currentSubLevel >= 3) { // Assuming 3 sublevels per level
    console.log(`Unlocking level ${nextLevel}`);
    gameState.unlockedLevels.push(nextLevel);
  }
  
  // Save progress
  saveProgress();
  
  // Show celebration animation (stars and confetti)
  console.log('Calling showCelebration...'); // LOG
  showCelebration(stars, gameState.playerName);  // Pass player name to celebration
  console.log('Returned from showCelebration.'); // LOG
  
  // Speak congratulations with player's name if available
  if (gameState.playerName) {
    speakText(`Great job, ${gameState.playerName}!`);
  } else {
    speakText("Great job!");
  }
  
  // Enable the "Next Riddle" button immediately
  console.log('Enabling Next Riddle button...'); // LOG
  const nextButton = document.getElementById('next-riddle-btn');
  console.log('Found Next Riddle button element:', nextButton); // LOG
  if (nextButton) {
    nextButton.disabled = false;
    console.log('Next Riddle button ENABLED.'); // LOG
    // Optional: Add a visual cue like a class
    nextButton.classList.add('enabled'); 
  } else {
    console.error('Could not find Next Riddle button to enable!'); // LOG
  }
  console.log('--- handleLevelComplete END ---'); // LOG
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
  
  gameState.hintsLeft--;
  updateHintDisplay(gameState.hintsLeft);
  
  const { row, col, element } = gameState.currentEmptyCell;
  const correctValue = gameState.board[row][col].correctValue;
  console.log(`Showing hint for cell [${row}, ${col}]. Correct value: ${correctValue}`);

  // Store original state if needed (e.g., if it had temporary user input)
  const originalText = element.textContent;
  const originalClasses = element.className;

  // Apply flash styling
  element.textContent = correctValue; // Show the correct number
  element.classList.add('hint-flash'); // Add class for animation

  // Remove flash styling and text after 3 seconds
  setTimeout(() => {
    if (element) { // Check if element still exists (might have been filled)
      element.textContent = originalText; // Restore original text (likely empty)
      element.className = originalClasses; // Restore original classes
      // Ensure 'selected' class is still applied
      if (gameState.currentEmptyCell && gameState.currentEmptyCell.element === element) {
        element.classList.add('selected');
      }
    }
  }, 3000);
  
  // Deduct points
  gameState.score = Math.max(0, gameState.score - 10);
  updateScoreDisplay(gameState.score);
  
  // Play hint sound
  playSound('hint');
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
  let nextLevelId = gameState.currentLevel;
  let nextSubLevelId = gameState.currentSubLevel + 1;

  // Check if there are more sublevels in the current level
  const currentLevelData = getLevelData(gameState.currentLevel, 1); // Need level info
  const subLevelCount = levels.find(l => l.id === gameState.currentLevel)?.subLevels.length || 3; // Get sublevel count

  if (nextSubLevelId > subLevelCount) {
    // Move to the first sublevel of the next level
    nextSubLevelId = 1;
    nextLevelId++;
    // Handle wrapping after the last level (e.g., go back to level 1 or stay on map)
    const totalLevels = getTotalLevelCount(); // Need a function in levels.js for this
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
}
