import * as animeModule from 'animejs';
const anime = animeModule.default || animeModule;
import { getLevelData } from './levels.js';
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
    showLevelSelect();
  });
  
  // Set up parent dashboard (hidden behind long press)
  setupParentDashboard();
}

// Load progress from localStorage
function loadProgress() {
  const savedState = localStorage.getItem('sudokuBuddiesState');
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState);
      gameState = { ...gameState, ...parsedState };
    } catch (e) {
      console.error('Failed to parse saved state', e);
    }
  }
}

// Save progress to localStorage
export function saveProgress() {
  try {
    localStorage.setItem('sudokuBuddiesState', JSON.stringify({
      currentLevel: gameState.currentLevel,
      currentSubLevel: gameState.currentSubLevel,
      score: gameState.score,
      unlockedLevels: gameState.unlockedLevels,
      levelStars: gameState.levelStars
    }));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

// Show level select screen
export function showLevelSelect() {
  renderLevelSelect(gameState.unlockedLevels, level => {
    gameState.currentLevel = level;
    showSubLevelSelect(level);
  });
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
  const cell = gameState.board[rowIndex][colIndex];
  
  // Only handle empty cells
  if (cell && cell.value === null) {
    gameState.currentEmptyCell = { element: cellElement, row: rowIndex, col: colIndex };
    
    // Get the level data to know which numbers to show
    const levelData = getLevelData(gameState.currentLevel, gameState.currentSubLevel);
    const numberPicker = document.querySelector('.number-picker');
    
    // Show the number picker with animation
    numberPicker.classList.add('open');
    anime({
      targets: numberPicker,
      translateY: ['100%', '0%'],
      duration: 300,
      easing: 'easeOutCubic'
    });
    
    // Populate number picker with correct options
    populateNumberPicker(levelData.numbers);
  }
}

// Populate number picker with options
function populateNumberPicker(numbers) {
  const optionsContainer = document.querySelector('.number-picker-options');
  optionsContainer.innerHTML = '';
  
  numbers.forEach(num => {
    const option = document.createElement('div');
    option.className = 'number-option';
    option.textContent = num;
    option.dataset.number = num;
    option.addEventListener('click', () => handleNumberPick(num));
    optionsContainer.appendChild(option);
  });
}

// Handle number pick
export function handleNumberPick(number) {
  if (!gameState.currentEmptyCell) return;
  
  const { row, col, element } = gameState.currentEmptyCell;
  const cell = gameState.board[row][col];
  
  // Close the number picker
  const numberPicker = document.querySelector('.number-picker');
  numberPicker.classList.remove('open');
  anime({
    targets: numberPicker,
    translateY: ['0%', '100%'],
    duration: 300,
    easing: 'easeInCubic'
  });
  
  // Check if correct
  if (number === cell.correctValue) {
    // Update board state
    gameState.board[row][col].value = number;
    
    // Update cell display
    element.textContent = number;
    element.classList.remove('empty');
    element.classList.add('filled');
    
    // Add score and play sound
    gameState.score += 50;
    updateScoreDisplay(gameState.score);
    playSound('correct');
    
    // Use haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Check if level complete
    if (checkLevelComplete()) {
      handleLevelComplete();
    }
  } else {
    // Wrong answer
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
    playSound('wrong');
  }
  
  // Reset current empty cell
  gameState.currentEmptyCell = null;
}

// Check if level is complete
function checkLevelComplete() {
  for (let i = 0; i < gameState.board.length; i++) {
    for (let j = 0; j < gameState.board[i].length; j++) {
      const cell = gameState.board[i][j];
      if (cell && cell.value === null) {
        return false;
      }
    }
  }
  return true;
}

// Handle level complete
function handleLevelComplete() {
  // Calculate stars based on hints used and time
  const stars = calculateStars();
  
  // Save stars for this level
  const levelKey = `${gameState.currentLevel}-${gameState.currentSubLevel}`;
  gameState.levelStars[levelKey] = stars;
  
  // Update unlocked levels
  if (!gameState.unlockedLevels.includes(gameState.currentLevel + 1) && gameState.currentSubLevel >= 3) {
    gameState.unlockedLevels.push(gameState.currentLevel + 1);
  }
  
  // Save progress
  saveProgress();
  
  // Show celebration
  showCelebration(stars);
  
  // Speak congratulations
  speakText("Great job!");
  
  // Navigate back to level select after a delay
  setTimeout(() => {
    showLevelSelect();
  }, 3000);
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
  if (gameState.hintsLeft <= 0 || !gameState.currentEmptyCell) return;
  
  gameState.hintsLeft--;
  updateHintDisplay(gameState.hintsLeft);
  
  // Show hint animation
  const { row, col, element } = gameState.currentEmptyCell;
  const correctValue = gameState.board[row][col].correctValue;
  
  // Display the correct number temporarily
  const tempDisplay = document.createElement('div');
  tempDisplay.className = 'hint-display';
  tempDisplay.textContent = correctValue;
  tempDisplay.style.position = 'absolute';
  tempDisplay.style.top = `${element.offsetTop}px`;
  tempDisplay.style.left = `${element.offsetLeft}px`;
  tempDisplay.style.width = `${element.offsetWidth}px`;
  tempDisplay.style.height = `${element.offsetHeight}px`;
  tempDisplay.style.display = 'flex';
  tempDisplay.style.alignItems = 'center';
  tempDisplay.style.justifyContent = 'center';
  tempDisplay.style.fontSize = '2rem';
  tempDisplay.style.fontWeight = 'bold';
  tempDisplay.style.color = 'rgba(0, 0, 0, 0.7)';
  tempDisplay.style.backgroundColor = 'rgba(255, 249, 204, 0.8)';
  tempDisplay.style.borderRadius = '8px';
  tempDisplay.style.zIndex = '5';
  
  document.querySelector('.container').appendChild(tempDisplay);
  
  // Animate and remove after 3 seconds
  anime({
    targets: tempDisplay,
    opacity: [0, 1, 1, 0],
    scale: [0.8, 1.2, 1, 0.8],
    duration: 3000,
    easing: 'easeInOutQuad',
    complete: () => {
      tempDisplay.remove();
    }
  });
  
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
  dashboard.innerHTML = `
    <h2 class="dashboard-title">Parent Dashboard</h2>
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
  document.getElementById('reset-progress').addEventListener('click', () => {
    localStorage.removeItem('sudokuBuddiesState');
    gameState = {
      currentLevel: 1,
      currentSubLevel: 1,
      score: 0,
      hintsLeft: 3,
      board: [],
      currentEmptyCell: null,
      unlockedLevels: [1],
      levelStars: {},
    };
    document.querySelector('.parent-dashboard').classList.remove('visible');
    initGame();
  });
  
  document.getElementById('toggle-audio').addEventListener('click', () => {
    // Toggle audio logic would go here
    document.querySelector('.parent-dashboard').classList.remove('visible');
  });
  
  document.getElementById('view-scores').addEventListener('click', () => {
    // Show scores logic would go here
    alert(`Current Score: ${gameState.score}`);
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