# Connect Four

This is a classic Connect Four game built with Next.js and Tailwind CSS.

## Gameplay

Two players, Red and Yellow, take turns dropping their colored discs into a 7x6 grid. The first player to get four of their discs in a row—horizontally, vertically, or diagonally—wins the game.

## How to Play

1.  The game will start with an empty board.
2.  Player 1 (Red) clicks on a column to drop a red disc.
3.  Player 2 (Yellow) clicks on a column to drop a yellow disc.
4.  The players continue to take turns until one player achieves four in a row or the board is full, resulting in a draw.
5.  A message will announce the winner or a draw, and you can start a new game by clicking the "Play Again" button.

## Deployment on Vercel

Deploying this application to Vercel is a simple process.

1.  **Push to a Git Repository:** Make sure your project is in a Git repository (e.g., on GitHub, GitLab, or Bitbucket).
2.  **Import Project on Vercel:**
    *   Go to your Vercel dashboard.
    *   Click the "Add New..." button and select "Project".
    *   Import the Git repository that contains your Connect Four project.
3.  **Configure Project:**
    *   Vercel will automatically detect that you are using Next.js and configure the build settings for you.
    *   You do not need to set any environment variables.
4.  **Deploy:**
    *   Click the "Deploy" button.
    *   Vercel will build and deploy your application. You will be provided with a URL to your live site.