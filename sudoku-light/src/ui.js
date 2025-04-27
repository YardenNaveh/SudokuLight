import * as animeModule from 'animejs';
const anime = animeModule.default || animeModule;

// Audio cache
const audioCache = {};

// Renders the game board
export function renderBoard(boardData, onCellTap) {
  const boardElement = document.createElement('div');
  boardElement.className = `board size-${boardData.length}`;
  
  for (let i = 0; i < boardData.length; i++) {
    for (let j = 0; j < boardData[i].length; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      
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
    anime({
      targets: scoreNumber,
      scale: [1, 1.2, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });
    
    scoreNumber.textContent = score;
  }
}

// Renders the level select screen
export function renderLevelSelect(unlockedLevels, onLevelSelect) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  
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
}

// Shows celebration animation
export function showCelebration(stars) {
  const celebrations = document.querySelector('.celebrations');
  
  // Clear any existing celebrations
  celebrations.innerHTML = '';
  
  // Create confetti
  for (let i = 0; i < 50; i++) {
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
    
    celebrations.appendChild(confetti);
    
    // Animate each confetti piece
    anime({
      targets: confetti,
      translateY: [
        { value: window.innerHeight + 50, duration: 1000 + Math.random() * 3000 }
      ],
      translateX: [
        { value: x + (-50 + Math.random() * 100), duration: 1000 + Math.random() * 3000 }
      ],
      rotate: {
        value: Math.random() * 360,
        duration: 1000,
        easing: 'easeInOutSine'
      },
      opacity: [
        { value: 1, duration: 100 },
        { value: 1, duration: 800 },
        { value: 0, duration: 200 }
      ],
      easing: 'easeOutSine',
      complete: function() {
        confetti.remove();
      }
    });
  }
  
  // Create stars based on count
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars-container';
  starsContainer.style.position = 'absolute';
  starsContainer.style.top = '30%';
  starsContainer.style.left = '50%';
  starsContainer.style.transform = 'translate(-50%, -50%)';
  starsContainer.style.display = 'flex';
  starsContainer.style.justifyContent = 'center';
  starsContainer.style.gap = '15px';
  starsContainer.style.zIndex = '2000';
  
  for (let i = 0; i < 3; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = '⭐';
    star.style.fontSize = '4rem';
    star.style.opacity = i < stars ? '1' : '0.3';
    star.style.transform = 'scale(0)';
    
    starsContainer.appendChild(star);
    
    // Animate stars appearing one by one
    if (i < stars) {
      anime({
        targets: star,
        scale: [0, 1.2, 1],
        opacity: [0, 1],
        delay: i * 300,
        duration: 600,
        easing: 'easeOutElastic(1, .5)'
      });
    }
  }
  
  celebrations.appendChild(starsContainer);
  
  // Show celebration message
  const messageElement = document.createElement('div');
  messageElement.className = 'celebration-message';
  messageElement.textContent = 'Great Job!';
  messageElement.style.position = 'absolute';
  messageElement.style.top = '50%';
  messageElement.style.left = '50%';
  messageElement.style.transform = 'translate(-50%, -50%)';
  messageElement.style.fontSize = '3rem';
  messageElement.style.fontWeight = 'bold';
  messageElement.style.color = '#fff';
  messageElement.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
  messageElement.style.opacity = '0';
  messageElement.style.zIndex = '2000';
  
  celebrations.appendChild(messageElement);
  
  // Animate message
  anime({
    targets: messageElement,
    opacity: [0, 1],
    translateY: ['-30%', '-50%'],
    delay: 500,
    duration: 800,
    easing: 'easeOutQuad'
  });
  
  // Play celebration sound
  playSound('celebration');
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
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDMzMzMzM0dHR0dHR1VVVVVVVWhoaGhoaHZ2dnZ2doODg4ODg5GRkZGRkZ+fn5+fn6ysrKysrLq6urq6usXFxcXFxdLS0tLS0uDg4ODg4O3t7e3t7f////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/+xDEAAPkAFUAZpwAAPnsRAibuQmgOp/wMAABi9GeBgQDxf5ED/4bGBh/+5UQwggw/kQGQEYFJIlFGlscDAwwMlg04DDA4eDVYjgZo/8Z8v//l4+Y/24pWiox4GBgAGIyYYGQ4SGOBgYEGPgOYcGB7pmHAqWN0KjxLf/+3DE0RSKPVVdeA5rirn4qv9jTN/5T4GDwQahA4MHAQwOChgMMQCgwUIh5gwGBwcEdikKDxKMGhMxWBDBQGBiqZHEAYFLpl0DCQmEAgcYzSRQLAwAQDDYQOqhoIHGA0EggZJDZg0aTaAMZLHg4cGHQwYvA5hQSmAQ0NtlZQYOBQsulixiUJGxnP/sYEMGHhEYNCZgobGk2j/zGXn/+LFRnUXXRQcqAhlT//7cMTFFNZ7o42cEdZA8X///iSIXETsYRD0Zh1f+3JBSYnAQENDhQyYRjIzOPD0xGCDCYHPmnw8aUYGCQuYQDBhwCGCgiYIARgoFGMSaYcCBiobA5ZHBhgKGHQqcgNxgEbg1Jmpw4YmBQ8wmETSoNGAwCChEqPnBQkGzFOYdDZlsYmFwsYCBhkoEGHSaGmQGYCaBsYvhkOGtjnUaC6xsLmiySeeFiZhfwYWMH0S3GiBUuNKiswQEDRZBP/7kMSpFGxLkVm9nFyJcGJDAZiLhxM1BwcCgIBB4LBICDCLkDBDscDGdg4gxTYMGWDFYYOGpgwQzQxYOHAocUCgZQMHWDwgQGa0DCAIXGGAw0TCeRDUhoQmDQqY+DJjoXlZjTUIAoMNFlkcjhg9lCQICAxUIDK46OLnQgYYTKppMCEERAwMHjz//mU3/+s/1szndf65lN3/+ZTd//M1f//0Df//zt1QYfBIJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UMSzFMJCzs9mKADmA+e8MYQAAAABWZXKGUMBTUUAAAAAA/QZWKGUxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
        audio.volume = 0.3;
      break;
    case 'hint':
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDMzMzMzM0dHR0dHR1VVVVVVVWhoaGhoaHZ2dnZ2doODg4ODg5GRkZGRkZ+fn5+fn6ysrKysrLq6urq6usXFxcXFxdLS0tLS0uDg4ODg4O3t7e3t7f////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/+xDEAAPkAGkAbwQAAPqfC+c7YjWAejn1UAAgjfr0AIJDVch0Ff5ID/4bGBv/51xDCCDzKQGQIYaJIlFGjRjwwMYFDAxwMlg8MCDABQbZdABAgwwMDBAIJqLAYcJoJKXjLMAQrewf/+3DE1dSiS1WbeAeJi/lwrv9rJ9zF8FcNUELQKDAxwUMUGBlCMChkYOiZiAYJIAoX7CgvMY4YXdwYHHIq/bmOBMZDLn4a77oYPQ8vRNDYKB8XDJpYQD7yNaORIjAZEwUGAgYYKGDAYVSgYOMBhDQQvAghAQgDAggLBAYb8rUTN/9xzC6B0aDAuY2DIA/8aGRv/8YH/4sVOYRD0ZVgX/IG//iOYVo99DTYx6kGIGJ//7cMTJFVlsYZGcMuY0Y1GBAWYNMf48aGZgM6ZLTRg4OmBzFEwQUDBQZHvDH+GGFgaYVTbgc4bgfIXlj7HAAIkQeGCyYWP5gA3HQYYc/5BSYjAhUqcgg7rkg5gAR6cR+L/Kgxa6P/6DFcwEDCgsMJDIAMMGkgwgquhYJDfGOAYCBhUIGDBwQHqGBQYJBhuAZ8iNgnwsAA5KeDE4REREjiYah5KUHAQYADw4eGpYGIC//uQxKkU40uRkVnYaonwYkHBQRMXBcwaD0RMHg1C6BUcVL6eYKEg4YKCQEIGAQ2I6gEBAwCBEYkFRiASGQhEQqEmgw0LjBQYBQkUFQYHAgkLnRucCAxMBiQMwCgoqLzCg0MJA0BAYQBDIzSBTr//lT/+s/1szndf65ky7/+ZTf/ztXv/9A5v//n7Tqgw4PAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7YMSxlOxCzs1rLADmhCfEEYQAAABWZXKGUxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
        audio.volume = 0.4;
      break;
    case 'celebration':
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgoKCgoKDMzMzMzM0dHR0dHR1VVVVVVVWhoaGhoaHZ2dnZ2doODg4ODg5GRkZGRkZ+fn5+fn6ysrKysrLq6urq6usXFxcXFxdLS0tLS0uDg4ODg4O3t7e3t7f////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/+xDEAAPkAFUAZpwAAPnsRAibuQmgOp/wMAABi9GeBgQDxf5ED/4bGBh/+5UQwggw/kQGQEYFJIlFGlscDAwwMlg04DDA4eDVYjgZo/8Z8v//l4+Y/24pWiox4GBgAGIyYYGQ4SGOBgYEGPgOYcGB7pmHAqWN0KjxLf/+3DE0RSKPVVdeA5rirn4qv9jTN/5T4GDwQahA4MHAQwOChgMMQCgwUIh5gwGBwcEdikKDxKMGhMxWBDBQGBiqZHEAYFLpl0DCQmEAgcYzSRQLAwAQDDYQOqhoIHGA0EggZJDZg0aTaAMZLHg4cGHQwYvA5hQSmAQ0NtlZQYOBQsulixiUJGxnP/sYEMGHhEYNCZgobGk2j/zGXn/+LFRnUXXRQcqAhlT//7cMTFFNZ7o42cEdZA8X///iSIXETsYRD0Zh1f+3JBSYnAQENDhQyYRjIzOPD0xGCDCYHPmnw8aUYGCQuYQDBhwCGCgiYIARgoFGMSaYcCBiobA5ZHBhgKGHQqcgNxgEbg1Jmpw4YmBQ8wmETSoNGAwCChEqPnBQkGzFOYdDZlsYmFwsYCBhkoEGHSaGmQGYCaBsYvhkOGtjnUaC6xsLmiySeeFiZhfwYWMH0S3GiBUuNKiswQEDRZBP/7kMSpFGxLkVm9nFyJcGJDAZiLhxM1BwcCgIBB4LBICDCLkDBDscDGdg4gxTYMGWDFYYOGpgwQzQxYOHAocUCgZQMHWDwgQGa0DCAIXGGAw0TCeRDUhoQmDQqY+DJjoXlZjTUIAoMNFlkcjhg9lCQICAxUIDK46OLnQgYYTKppMCEERAwMHjz//mU3/+s/1szndf65lN3/+ZTd//M1f//0Df//zt1QYfBIJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UMSzFMJCzs9mKADmA+e8MYQAAAABWZXKGUMBTUUAAAAAA/QZWKGUxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
        audio.volume = 0.6;
      break;
    default:
      return; // Unknown sound type
  }
  
  // Cache and play the audio
  audioCache[type] = audio;
  audio.play().catch(e => console.log('Audio playback prevented: ', e));
} 