// Audio cache
const audioCache = {};

// Renders the game board
export function renderBoard(boardData, onCellTap) {
  const boardElement = document.createElement('div');
  const gridSize = boardData.length;
  // KEEP original class name pattern for CSS grid compatibility
  boardElement.className = `board size-${gridSize}`; 
  
  // Determine block dimensions
  let blockHeight, blockWidth;
  const squaresEnabled = window.currentLevelData && window.currentLevelData.squares;
  
  if (squaresEnabled) {
      // Add class to board if squares are enabled (used by CSS)
      boardElement.classList.add('squares-enabled'); 
      
      if (gridSize === 6) {
          blockHeight = 2;
          blockWidth = 3;
      } else if (Number.isInteger(Math.sqrt(gridSize))) {
          blockHeight = blockWidth = Math.sqrt(gridSize);
      } else {
          // Fallback for unsupported grids where squares might be enabled
          blockHeight = gridSize; // Treat as one large block
          blockWidth = gridSize;
      }
  } else {
      // Default if squares are not enabled
      blockHeight = gridSize;
      blockWidth = gridSize;
  }

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = i;
      cell.dataset.col = j;
      
      // Add border classes if squares are enabled and we have multiple blocks
      if (squaresEnabled && blockHeight < gridSize) { 
        // Add thicker border to the left of cells starting a new block column
        if (j % blockWidth === 0 && j > 0) {
          cell.classList.add('left-border');
        }
        // Add thicker border to the top of cells starting a new block row
        if (i % blockHeight === 0 && i > 0) {
          cell.classList.add('top-border');
        }
      }
      
      const cellData = boardData[i][j];
      
      if (cellData && cellData.value === null) {
        cell.classList.add('empty');
        cell.addEventListener('click', () => onCellTap(cell, i, j));
      } else {
        const value = cellData?.value || boardData[i][j];
        cell.textContent = value;
      }
      
      boardElement.appendChild(cell);
    }
  }
  
  return boardElement;
}

// Renders the number picker
export function renderNumberPicker(onNumberPick) {
  const picker = document.createElement('div');
  picker.className = 'number-picker';
  
  const options = document.createElement('div');
  options.className = 'number-picker-options';
  picker.appendChild(options);
  
  return picker;
}

// Updates the score display
export function updateScoreDisplay(score) {
  const scoreNumber = document.querySelector('.score-number');
  if (scoreNumber) {
    // Add animation when score changes
    /* anime({
      targets: scoreNumber,
      scale: [1, 1.2, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    }); */ // Commented out problematic anime call
    
    scoreNumber.textContent = score;
  }
}

// Renders the level select screen
export function renderLevelSelect(unlockedLevels, onLevelSelect, score = 0) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  
  // Score display
  const scoreDisplay = document.createElement('div');
  scoreDisplay.className = 'map-score-display';
  scoreDisplay.innerHTML = `
    <div class="score">
      <div class="score-label">Total Score</div>
      <div class="score-number">${score}</div>
    </div>
  `;
  scoreDisplay.style.margin = '10px 0';
  scoreDisplay.style.padding = '15px';
  scoreDisplay.style.backgroundColor = '#4a2c91'; // Deep purple background
  scoreDisplay.style.color = 'white'; // White text for contrast
  scoreDisplay.style.borderRadius = '10px';
  scoreDisplay.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2)';
  scoreDisplay.style.display = 'inline-block';
  scoreDisplay.style.minWidth = '150px';
  scoreDisplay.style.fontWeight = 'bold';
  
  // Style the score number specifically
  const scoreNumberElement = scoreDisplay.querySelector('.score-number');
  if (scoreNumberElement) {
    scoreNumberElement.style.fontSize = '28px';
    scoreNumberElement.style.fontWeight = 'bold';
    scoreNumberElement.style.color = '#ffcc00'; // Gold color for better visibility
    scoreNumberElement.style.marginTop = '5px';
  }
  
  // Style the score label
  const scoreLabelElement = scoreDisplay.querySelector('.score-label');
  if (scoreLabelElement) {
    scoreLabelElement.style.fontSize = '14px';
    scoreLabelElement.style.color = '#e0e0e0'; // Light gray
  }
  
  app.appendChild(scoreDisplay);
  
  // Title
  const title = document.createElement('h1');
  title.className = 'level-select-title';
  title.textContent = 'Select a Planet';
  title.style.textAlign = 'center';
  title.style.margin = '20px 0';
  app.appendChild(title);
  
  // Level select grid
  const levelGrid = document.createElement('div');
  levelGrid.className = 'level-select';
  
  // Create 12 planet buttons
  for (let i = 1; i <= 12; i++) {
    const planetButton = document.createElement('div');
    planetButton.className = 'planet-button';
    
    // Check if level is unlocked
    const isUnlocked = unlockedLevels.includes(i);
    if (!isUnlocked) {
      planetButton.classList.add('locked');
    } else {
      planetButton.addEventListener('click', () => onLevelSelect(i));
    }
    
    // Set planet number
    planetButton.textContent = i;
    
    // Use emoji based on level number
    const planetEmojis = ['🌎', '🌙', '🪐', '⭐', '☄️', '🌠', '🌌', '🚀', '👾', '🛸', '🔭', '🌞'];
    planetButton.innerHTML = `${planetEmojis[i-1]}<br>${i}`;
    
    levelGrid.appendChild(planetButton);
  }
  
  app.appendChild(levelGrid);
  
  // Practice mode button for extra suggestion
  const practiceButton = document.createElement('div');
  practiceButton.className = 'button primary';
  practiceButton.textContent = '🎮 Practice Mode';
  practiceButton.style.margin = '20px auto';
  practiceButton.style.width = '200px';
  practiceButton.style.textAlign = 'center';
  practiceButton.addEventListener('click', () => {
    const randomLevel = Math.min(Math.max(...unlockedLevels), 9);
    onLevelSelect(randomLevel);
  });
  
  app.appendChild(practiceButton);
  
  // Reset progress button
  const resetButton = document.createElement('div');
  resetButton.className = 'button reset-button';
  resetButton.textContent = '🔄 Reset Progress';
  resetButton.style.margin = '10px auto';
  resetButton.style.width = '200px';
  resetButton.style.textAlign = 'center';
  resetButton.style.backgroundColor = '#ffcdd2'; // Light red
  resetButton.addEventListener('click', () => {
    // Prompt for password first
    const password = prompt("Please enter parent password to reset progress:");
    
    // Only proceed if password is correct
    if (password === "1234") {
      if (confirm('Are you sure you want to reset all progress?')) {
        // Need to import or access resetProgress function from game.js
        // For now, let's assume it's globally accessible or imported
        window.resetGameProgress(); // We'll expose it globally from game.js
      }
    } else if (password !== null) { // Only show error if user didn't cancel
      alert("Incorrect password. Progress not reset.");
    }
  });
  app.appendChild(resetButton);
}

// Shows celebration animation
export function showCelebration(stars, playerName = '') {
  const celebrations = document.querySelector('.celebrations');
  
  // Clear any existing celebrations
  celebrations.innerHTML = '';
  
  // Reduce confetti count for better performance (from 50 to 25)
  const confettiCount = 25;
  
  // Create stars first to ensure they're visible immediately
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars-container';
  starsContainer.style.position = 'absolute';
  starsContainer.style.top = '60%';
  starsContainer.style.left = '50%';
  starsContainer.style.transform = 'translate(-50%, -50%)';
  starsContainer.style.display = 'flex';
  starsContainer.style.flexDirection = 'column';
  starsContainer.style.alignItems = 'center';
  starsContainer.style.justifyContent = 'center';
  starsContainer.style.gap = '15px';
  starsContainer.style.zIndex = '1000'; // Lower z-index so it doesn't block buttons
  // Stars should be visible but not interfere with interactions
  starsContainer.style.pointerEvents = 'none';
  
  // Stars row
  const starsRow = document.createElement('div');
  starsRow.style.display = 'flex';
  starsRow.style.justifyContent = 'center';
  starsRow.style.gap = '15px';
  
  for (let i = 0; i < 3; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '⭐';
    star.style.fontSize = '4rem';
    star.style.opacity = i < stars ? '1' : '0.3';
    
    // Simple CSS animation instead of anime.js
    if (i < stars) {
      star.style.animation = `star-appear 0.6s ${i * 0.3}s forwards`;
    }
    
    starsRow.appendChild(star);
  }
  
  starsContainer.appendChild(starsRow);
  
  // Add congratulation text with player name if available
  if (playerName) {
    const congratsText = document.createElement('div');
    congratsText.className = 'congrats-text';
    congratsText.textContent = `Good job, ${playerName}!`;
    congratsText.style.fontSize = '1.8rem';
    congratsText.style.fontWeight = 'bold';
    congratsText.style.color = '#FF9800';
    congratsText.style.marginTop = '20px';
    congratsText.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
    congratsText.style.animation = 'fadeIn 1s forwards';
    starsContainer.appendChild(congratsText);
  }
  
  celebrations.appendChild(starsContainer);
  
  // Ensure Next Riddle button is accessible by explicitly checking and setting it to enabled
  setTimeout(() => {
    const nextButton = document.getElementById('next-riddle-btn');
    if (nextButton) {
      nextButton.disabled = false;
      nextButton.classList.add('enabled');
      // Ensure the button is above celebrations
      nextButton.style.zIndex = '3000';
      // Make sure it's clickable
      nextButton.style.pointerEvents = 'auto';
    }
  }, 100); // Small delay to ensure DOM is updated
  
  // Create a dedicated container for confetti to ensure they don't block interactions
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  confettiContainer.style.position = 'absolute';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.pointerEvents = 'none'; // Ensure confetti doesn't block interactions
  confettiContainer.style.zIndex = '500'; // Lower z-index to keep below UI elements
  celebrations.appendChild(confettiContainer);
  
  // Play celebration sound immediately
  playSound('celebration');
  
  // Use requestAnimationFrame for better performance when creating confetti
  requestAnimationFrame(() => {
    // Create confetti in batches to improve performance
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random position
      const x = Math.random() * window.innerWidth;
      const y = -20 - Math.random() * 100;
      
      // Random size
      const size = 5 + Math.random() * 15;
      
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.left = `${x}px`;
      confetti.style.top = `${y}px`;
      confetti.style.pointerEvents = 'none'; // Additional safety to ensure no interaction blocking
      
      // Set the animation properties directly to avoid JS overhead
      confetti.style.animation = `confetti-fall ${1 + Math.random() * 3}s linear forwards`;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      confettiContainer.appendChild(confetti);
      
      // Remove after animation completes to free up memory
      setTimeout(() => {
        if (confettiContainer.contains(confetti)) {
          confetti.remove();
        }
      }, 3000);
    }
  });
}

// Play a sound
export function playSound(type) {
  // Check if audio is cached
  if (audioCache[type]) {
    audioCache[type].currentTime = 0;
    audioCache[type].play().catch(e => console.log('Audio playback prevented: ', e));
    return;
  }
  
  // Create and cache the audio
  const audio = new Audio();
  
  // Use emojis with simple sounds for now
  // In a production app, you would use actual sound files
  switch (type) {
    case 'correct':
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDMzMzMzM0dHR0dHR1VVVVVVVWhoaGhoaHZ2dnZ2doODg4ODg5GRkZGRkZ+fn5+fn6ysrKysrLq6urq6usXFxcXFxdLS0tLS0uDg4ODg4O3t7e3t7f////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/+xDEAAPkAGkAbwQAAPqfC+c7YjWAejn1UAAgjfr0AIJDVch0Ff5ID/4bGBv/51xDCCDzKQGQIYaJIlFGjRjwwMYFDAxwMlg8MCDABQbZdABAgwwMDBAIJqLAYcJoJKXjLMAQrewf/+3DE1dSiS1WbeAeJi/lwrv9rJ9zF8FcNUELQKDAxwUMUGBlCMChkYOiZiAYJIAoX7CgvMY4YXdwYHHIq/bmOBMZDLn4a77oYPQ8vRNDYKB8XDJpYQD7yNaORIjAZEwUGAgYYKGDAYVSgYOMBhDQQvAghAQgDAggLBAYb8rUTN/9xzC6B0aDAuY2DIA/8aGRv/8YH/4sVOYRD0ZVgX/IG//iOYVo99DTYx6kGIGJ//7cMTJFVlsYZGcMuY0Y1GBAWYNMf48aGZgM6ZLTRg4OmBzFEwQUDBQZHvDH+GGFgaYVTbgc4bgfIXlj7HAAIkQeGCyYWP5gA3HQYYc/5BSYjAhUqcgg7rkg5gAR6cR+L/Kgxa6P/6DFcwEDCgsMJDIAMMGkgwgquhYJDfGOAYCBhUIGDBwQHqGBQYJBhuAZ8iNgnwsAA5KeDE4REREjiYah5KUHAQYADw4eGpYGIC//uQxKkU40uRkVnYaonwYkHBQRMXBcwaD0RMHg1C6BUcVL6eYKEg4YKCQEIGAQ2I6gEBAwCBEYkFRiASGQhEQqEmgw0LjBQYBQkUFQYHAgkLnRucCAxMBiQMwCgoqLzCg0MJA0BAYQBDIzSBTr//lT/+s/1szndf65ky7/+ZTf/ztXv/9A5v//n7Tqgw4PAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7YMSxlOxCzs1rLADmhCfEEYQAAABWZXKGUxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
        audio.volume = 0.5;
      break;
    case 'wrong':
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDMzMzMzM0dHR0dHR1VVVVVVVWhoaGhoaHZ2dnZ2doODg4ODg5GRkZGRkZ+fn5+fn6ysrKysrLq6urq6usXFxcXFxdLS0tLS0uDg4ODg4O3t7e3t7f////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/+xDEAAPkAFUAZpwAAPnsRAibuQmgOp/wMAABi9GeBgQDxf5ED/4bGBh/+5UQwggw/kQGQEYFJIlFGlscDAwwMlg04DDA4eDVYjgZo/8Z8v//l4+Y/24pWiox4GBgAGIyYYGQ4SGOBgYEGPgOYcGB7pmHAqWN0KjxLf/+3DE0RSKPVVdeA5rirn4qv9jTN/5T4GDwQahA4MHAQwOChgMMQCgwUIh5gwGBwcEdikKDxKMGhMxWBDBQGBiqZHEAYFLpl0DCQmEAgcYzSRQLAwAQDDYQOqhoIHGA0EggZJDZg0aTaAMZLHg4cGHQwYvA5hQSmAQ0NtlZQYOBQsulixiUJGxnP/sYEMGHhEYNCZgobGk2j/zGXn/+LFRnUXXRQcqAhlT//7cMTFFNZ7o42cEdZA8X///iSIXETsYRD0Zh1f+3JBSYnAQENDhQyYRjIzOPD0xGCDCYHPmnw8aUYGCQuYQDBhwCGCgiYIARgoFGMSaYcCBiobA5ZHBhgKGHQqcgNxgEbg1Jmpw4YmBQ8wmETSoNGAwCChEqPnBQkGzFOYdDZlsYmFwsYCBhkoEGHSaGmQGYCaBsYvhkOGtjnUaC6xsLmiySeeFiZhfwYWMH0S3GiBUuNKiswQEDRZBP/7kMSpFGxLkVm9nFyJcGJDAZiLhxM1BwcCgIBB4LBICDCLkDBDscDGdg4gxTYMGWDFYYOGpgwQzQxYOHAocUCgZQMHWDwgQGa0DCAIXGGAw0TCeRDUhoQmDQqY+DJjoXlZjTUIAoMNFlkcjhg9lCQICAxUIDK46OLnQgYYTKppMCEERAwMHjz//mU3/+s/1szndf65lN3/+ZTd//M1f//0Df//zt1QYfBIJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UMSzFMJCzs9mKADmA+e8MYQAAAABWZXKGUMBTUUAAAAAA/QZWKGUxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
        audio.volume = 0.3;
      break;
    case 'hint':
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDMzMzMzM0dHR0dHR1VVVVVVVWhoaGhoaHZ2dnZ2doODg4ODg5GRkZGRkZ+fn5+fn6ysrKysrLq6urq6usXFxcXFxdLS0tLS0uDg4ODg4O3t7e3t7f////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/+xDEAAPkAGkAbwQAAPqfC+c7YjWAejn1UAAgjfr0AIJDVch0Ff5ID/4bGBv/51xDCCDzKQGQIYaJIlFGjRjwwMYFDAxwMlg8MCDABQbZdABAgwwMDBAIJqLAYcJoJKXjLMAQrewf/+3DE1dSiS1WbeAeJi/lwrv9rJ9zF8FcNUELQKDAxwUMUGBlCMChkYOiZiAYJIAoX7CgvMY4YXdwYHHIq/bmOBMZDLn4a77oYPQ8vRNDYKB8XDJpYQD7yNaORIjAZEwUGAgYYKGDAYVSgYOMBhDQQvAghAQgDAggLBAYb8rUTN/9xzC6B0aDAuY2DIA/8aGRv/8YH/4sVOYRD0ZVgX/IG//iOYVo99DTYx6kGIGJ//7cMTJFVlsYZGcMuY0Y1GBAWYNMf48aGZgM6ZLTRg4OmBzFEwQUDBQZHvDH+GGFgaYVTbgc4bgfIXlj7HAAIkQeGCyYWP5gA3HQYYc/5BSYjAhUqcgg7rkg5gAR6cR+L/Kgxa6P/6DFcwEDCgsMJDIAMMGkgwgquhYJDfGOAYCBhUIGDBwQHqGBQYJBhuAZ8iNgnwsAA5KeDE4REREjiYah5KUHAQYADw4eGpYGIC//uQxKkU40uRkVnYaonwYkHBQRMXBcwaD0RMHg1C6BUcVL6eYKEg4YKCQEIGAQ2I6gEBAwCBEYkFRiASGQhEQqEmgw0LjBQYBQkUFQYHAgkLnRucCAxMBiQMwCgoqLzCg0MJA0BAYQBDIzSBTr//lT/+s/1szndf65ky7/+ZTf/ztXv/9A5v//n7Tqgw4PAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7YMSxlOxCzs1rLADmhCfEEYQAAABWZXKGUxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
        audio.volume = 0.4;
      break;
    case 'celebration':
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDMzMzMzM0dHR0dHR1VVVVVVVWhoaGhoaHZ2dnZ2doODg4ODg5GRkZGRkZ+fn5+fn6ysrKysrLq6urq6usXFxcXFxdLS0tLS0uDg4ODg4O3t7e3t7f////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/+xDEAAPkAFUAZpwAAPnsRAibuQmgOp/wMAABi9GeBgQDxf5ED/4bGBh/+5UQwggw/kQGQEYFJIlFGlscDAwwMlg04DDA4eDVYjgZo/8Z8v//l4+Y/24pWiox4GBgAGIyYYGQ4SGOBgYEGPgOYcGB7pmHAqWN0KjxLf/+3DE0RSKPVVdeA5rirn4qv9jTN/5T4GDwQahA4MHAQwOChgMMQCgwUIh5gwGBwcEdikKDxKMGhMxWBDBQGBiqZHEAYFLpl0DCQmEAgcYzSRQLAwAQDDYQOqhoIHGA0EggZJDZg0aTaAMZLHg4cGHQwYvA5hQSmAQ0NtlZQYOBQsulixiUJGxnP/sYEMGHhEYNCZgobGk2j/zGXn/+LFRnUXXRQcqAhlT//7cMTFFNZ7o42cEdZA8X///iSIXETsYRD0Zh1f+3JBSYnAQENDhQyYRjIzOPD0xGCDCYHPmnw8aUYGCQuYQDBhwCGCgiYIARgoFGMSaYcCBiobA5ZHBhgKGHQqcgNxgEbg1Jmpw4YmBQ8wmETSoNGAwCChEqPnBQkGzFOYdDZlsYmFwsYCBhkoEGHSaGmQGYCaBsYvhkOGtjnUaC6xsLmiySeeFiZhfwYWMH0S3GiBUuNKiswQEDRZBP/7kMSpFGxLkVm9nFyJcGJDAZiLhxM1BwcCgIBB4LBICDCLkDBDscDGdg4gxTYMGWDFYYOGpgwQzQxYOHAocUCgZQMHWDwgQGa0DCAIXGGAw0TCeRDUhoQmDQqY+DJjoXlZjTUIAoMNFlkcjhg9lCQICAxUIDK46OLnQgYYTKppMCEERAwMHjz//mU3/+s/1szndf65lN3/+ZTd//M1f//0Df//zt1QYfBIJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UMSzFMJCzs9mKADmA+e8MYQAAAABWZXKGUMBTUUAAAAAA/QZWKGUxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
        audio.volume = 0.6;
      break;
    default:
      return; // Unknown sound type
  }
  
  // Cache and play the audio
  audioCache[type] = audio;
  audio.play().catch(e => console.log('Audio playback prevented: ', e));
}

// Create and initialize game controls and UI elements
export function initializeGameUI() {
  console.log('Initializing game UI');
  
  // Create score and level display banner  
  const scoreBanner = document.createElement('div');
  scoreBanner.className = 'score-banner';
  
  const scoreNumber = document.createElement('div');
  scoreNumber.className = 'score-number';
  scoreNumber.textContent = '0';
  
  const levelDisplay = document.createElement('div');
  levelDisplay.className = 'level-display';
  levelDisplay.textContent = 'Planet 1 - Riddle 1';
  
  const streakDisplay = document.createElement('div');
  streakDisplay.className = 'streak-display';
  streakDisplay.innerHTML = 'Streak: <span class="streak-number">0/5</span>';
  
  scoreBanner.appendChild(levelDisplay);
  scoreBanner.appendChild(scoreNumber);
  scoreBanner.appendChild(streakDisplay);
  document.getElementById('game-container').appendChild(scoreBanner);
  
  // Create bottom controls
  createBottomControls();
}

// Function to create a toast notification
export function showToast(message, duration = 3000) {
  // Check if toast already exists, remove it to avoid stacking
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show the toast with an animation
  setTimeout(() => toast.classList.add('visible'), 10);

  // Hide and remove after duration
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300); // Remove after fade animation
  }, duration);
}

export function addStyles() {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :root {
      --primary-color: #4a90e2;
      --secondary-color: #f5a623;
      --success-color: #7ed321;
      --error-color: #d0021b;
      --bg-color: #f0f4f8;
      --text-color: #333;
      --board-border-color: #bbb;
      --cell-border-color: #ddd;
      --cell-selected-color: #e3f2fd;
      --cell-highlight-color: #f0f7ff;
      --cell-correct-color: #eaffea;
      --cell-incorrect-color: #ffeeee;
      --main-font: 'Roboto', sans-serif;
    }

    body {
      font-family: var(--main-font);
      margin: 0;
      padding: 0;
      background-color: var(--bg-color);
      color: var(--text-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overscroll-behavior: none; /* Prevents pull-to-refresh on mobile */
    }

    #game-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 auto;
      max-width: 600px;
      width: 95%;
      padding: 10px;
      position: relative;
    }

    .score-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 15px;
      padding: 10px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .level-display {
      font-weight: bold;
      font-size: 16px;
      color: var(--primary-color);
    }

    .score-number {
      font-size: 22px;
      font-weight: bold;
      color: var(--secondary-color);
    }
    
    .streak-display {
      font-size: 16px;
      color: var(--text-color);
    }
    
    .streak-number {
      font-weight: bold;
    }
    
    .streak-active {
      color: var(--success-color);
    }

    /* Bottom Controls */
    .bottom-controls {
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-top: 15px;
      padding: 10px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .control-button {
      padding: 10px 15px;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .control-button:hover {
      background-color: #3a80d2;
    }

    .control-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    /* Toast notifications */
    .toast {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      z-index: 1000;
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
      text-align: center;
      max-width: 80%;
    }
    
    .toast.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Media Queries for responsiveness */
    @media (max-width: 480px) {
      #game-container {
        width: 100%;
        padding: 5px;
      }
      
      .score-banner,
      .bottom-controls {
        padding: 8px;
      }
      
      .control-button {
        padding: 8px 12px;
        font-size: 14px;
      }
    }
  `;
  document.head.appendChild(styleEl);
} 