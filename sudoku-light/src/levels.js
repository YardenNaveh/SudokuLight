/**
 * Level schema:
 * {
 *   id: 1,                     // incremental
 *   gridSize: 2,               // grid size (2x2, 3x3, etc.)
 *   hideCount: 1,              // numbers hidden at start
 *   patterns: ["row","col"],   // allowed orientations
 *   numbers: [1,2],            // pool used in this grid
 *   squares: false,            // whether to include square 2×2 section practice
 *   crossword: false           // whether to insert crossword patterns
 * }
 */

// Levels data
const levels = [
  // Level 1: Very simple 2x2 grids with 1-2 numbers
  {
    id: 1,
    name: "Earth",
    description: "Start here! Learn about rows and columns.",
    subLevels: [
      { gridSize: 2, hideCount: 1, patterns: ["row"], numbers: [1, 2], squares: false, crossword: false },
      { gridSize: 2, hideCount: 1, patterns: ["col"], numbers: [1, 2], squares: false, crossword: false },
      { gridSize: 2, hideCount: 1, patterns: ["row", "col"], numbers: [1, 2], squares: false, crossword: false }
    ]
  },
  
  // Level 2: 3x3 grids with 1-3 numbers
  {
    id: 2,
    name: "Moon",
    description: "New number! Learn about the number 3.",
    subLevels: [
      { gridSize: 3, hideCount: 1, patterns: ["row"], numbers: [1, 2, 3], squares: false, crossword: false },
      { gridSize: 3, hideCount: 1, patterns: ["col"], numbers: [1, 2, 3], squares: false, crossword: false },
      { gridSize: 3, hideCount: 1, patterns: ["row", "col"], numbers: [1, 2, 3], squares: false, crossword: false }
    ]
  },
  
  // Level 3: 3x3 grids with hiding more numbers
  {
    id: 3,
    name: "Saturn",
    description: "Multiple missing numbers!",
    subLevels: [
      { gridSize: 3, hideCount: 2, patterns: ["row"], numbers: [1, 2, 3], squares: false, crossword: false },
      { gridSize: 3, hideCount: 2, patterns: ["col"], numbers: [1, 2, 3], squares: false, crossword: false },
      { gridSize: 3, hideCount: 2, patterns: ["row", "col"], numbers: [1, 2, 3], squares: false, crossword: false }
    ]
  },
  
  // Level 4: Introducing 4x4 grids with square patterns
  {
    id: 4,
    name: "Star",
    description: "Learning about 2x2 squares and number 4!",
    subLevels: [
      { gridSize: 4, hideCount: 1, patterns: ["row", "col"], numbers: [1, 2, 3, 4], squares: false, crossword: false },
      { gridSize: 4, hideCount: 1, patterns: ["row", "col"], numbers: [1, 2, 3, 4], squares: true, crossword: false },
      { gridSize: 4, hideCount: 2, patterns: ["row", "col"], numbers: [1, 2, 3, 4], squares: true, crossword: false }
    ]
  },
  
  // Level 5: 4x4 with more missing numbers
  {
    id: 5,
    name: "Comet",
    description: "Getting trickier with more missing numbers!",
    subLevels: [
      { gridSize: 4, hideCount: 3, patterns: ["row", "col"], numbers: [1, 2, 3, 4], squares: true, crossword: false },
      { gridSize: 4, hideCount: 3, patterns: ["row", "col"], numbers: [1, 2, 3, 4], squares: true, crossword: false },
      { gridSize: 4, hideCount: 4, patterns: ["row", "col"], numbers: [1, 2, 3, 4], squares: true, crossword: false }
    ]
  },
  
  // Level 6: Introducing 6x6 grids
  {
    id: 6,
    name: "Shooting Star",
    description: "Learning about numbers 5 and 6!",
    subLevels: [
      { gridSize: 6, hideCount: 2, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6], squares: false, crossword: false },
      { gridSize: 6, hideCount: 3, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6], squares: false, crossword: false },
      { gridSize: 6, hideCount: 4, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6], squares: true, crossword: false }
    ]
  },
  
  // Level 7: Introducing numbers 7-8
  {
    id: 7,
    name: "Galaxy",
    description: "Learning about numbers 7 and 8!",
    subLevels: [
      { gridSize: 4, hideCount: 2, patterns: ["row", "col"], numbers: [5, 6, 7, 8], squares: true, crossword: false },
      { gridSize: 4, hideCount: 3, patterns: ["row", "col"], numbers: [5, 6, 7, 8], squares: true, crossword: false },
      { gridSize: 8, hideCount: 4, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8], squares: true, crossword: false }
    ]
  },
  
  // Level 8: Introducing number 9 and 3x3 squares
  {
    id: 8,
    name: "Rocket",
    description: "Learning about number 9 and 3x3 squares!",
    subLevels: [
      { gridSize: 3, hideCount: 2, patterns: ["row", "col"], numbers: [7, 8, 9], squares: true, crossword: false },
      { gridSize: 9, hideCount: 3, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: false, crossword: false },
      { gridSize: 9, hideCount: 4, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: false }
    ]
  },
  
  // Level 9: Full 9x9 grid with classic Sudoku rules
  {
    id: 9,
    name: "Alien",
    description: "Almost full Sudoku rules!",
    subLevels: [
      { gridSize: 9, hideCount: 5, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: false },
      { gridSize: 9, hideCount: 6, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: false },
      { gridSize: 9, hideCount: 7, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: false }
    ]
  },
  
  // Level 10: Crossword patterns
  {
    id: 10,
    name: "UFO",
    description: "Introducing crossword patterns!",
    subLevels: [
      { gridSize: 4, hideCount: 2, patterns: ["row", "col"], numbers: [1, 2, 3, 4], squares: true, crossword: true },
      { gridSize: 6, hideCount: 3, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6], squares: true, crossword: true },
      { gridSize: 9, hideCount: 4, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: true }
    ]
  },
  
  // Level 11: Advanced combinations
  {
    id: 11,
    name: "Telescope",
    description: "Mix of everything you've learned!",
    subLevels: [
      { gridSize: 6, hideCount: 4, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6], squares: true, crossword: true },
      { gridSize: 9, hideCount: 5, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: true },
      { gridSize: 9, hideCount: 6, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: true }
    ]
  },
  
  // Level 12: Master level
  {
    id: 12,
    name: "Sun",
    description: "You're a Sudoku master!",
    subLevels: [
      { gridSize: 9, hideCount: 7, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: true },
      { gridSize: 9, hideCount: 8, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: true },
      { gridSize: 9, hideCount: 9, patterns: ["row", "col"], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9], squares: true, crossword: true }
    ]
  }
];

// Get level data by id and sublevel
export function getLevelData(levelId, subLevelId) {
  const level = levels.find(l => l.id === levelId);
  if (!level) return null;
  
  const subLevel = level.subLevels[subLevelId - 1] || level.subLevels[0];
  return {
    ...subLevel,
    id: levelId,
    subId: subLevelId,
    name: level.name,
    description: level.description
  };
}

// Get all levels
export function getAllLevels() {
  return levels;
}

// Export levels array for direct access in game.js
export { levels };

// Get total number of levels
export function getTotalLevelCount() {
  return levels.length;
}

// Get total number of sublevels for a level
export function getSubLevelCount(levelId) {
  const level = levels.find(l => l.id === levelId);
  return level ? level.subLevels.length : 0;
} 