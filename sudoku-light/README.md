# Sudoku Buddies 🧩

A colorful, full-screen Progressive Web App (PWA) that runs entirely in the browser and teaches young children (3+ years) the logic of Sudoku through graduated mini-puzzles.

## Features

- 🌈 Colorful, kid-friendly UI with large tap targets
- 🎮 Progressive difficulty with 12 levels and 36 mini-puzzles
- 🔄 Automatic progress saving
- 🌟 Star-based level scoring
- 🎉 Fun celebrations and audio feedback
- 📱 Works offline as a PWA
- 👪 Parent dashboard (triple-tap and hold for 3 seconds to access)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/sudoku-buddies.git
cd sudoku-buddies
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:5173

## Building for Production

To create a production build:

```bash
npm run build
```

This will generate a `dist` folder with the production-ready files.

## Deploying to GitHub Pages

1. Build the project:
```bash
npm run build
```

2. Deploy to GitHub Pages:
```bash
npx gh-pages -d dist
```

This will deploy your app to `https://your-username.github.io/sudoku-buddies/`

## Resetting Progress

You can reset game progress in two ways:

1. Through the Parent Dashboard (triple-tap and hold for 3 seconds, then tap "Reset Progress")

2. Manually by opening the browser console and typing:
```javascript
localStorage.removeItem('sudokuBuddiesState');
```

## Game Structure

The game progresses through several stages:

1. **Splash screen** (3 seconds)
2. **Level select** - 12 planet-themed levels
3. **Mini-level screen** - sudoku-style board with hint button
4. **Gameplay** - tap empty cells, select numbers, earn points
5. **Celebration** - confetti and stars when completing levels

## Technologies Used

- Vanilla JavaScript with ES Modules
- Vite for bundling and development
- Animejs for animations
- Web Storage API for saving progress
- Web Speech API for voice guidance
- Service Workers for offline functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by educational puzzle games that build logical thinking skills
- Designed with early childhood education principles in mind 