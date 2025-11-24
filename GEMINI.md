# CoderQuest Project

## Project Overview

This project is a 2D educational game called CoderQuest. It's built with a modern web stack, combining a **Phaser 3** game engine for the gameplay with a **React** UI for the educational content and user interface. The project is designed to be modular and scalable, with a clear separation of concerns between the game and the UI.

The project is guided by two key documents:

*   `corequest.md`: The main architecture document that outlines the technical specifications, data models, and development phases.
*   `coderquest-checklist.md`: A detailed, hour-by-hour checklist for building the game, based on the architecture document.

## Core Technologies

*   **Build System:** Vite
*   **Game Engine:** Phaser 3
*   **UI Framework:** React
*   **Styling:** SASS/CSS Modules
*   **Map Editor:** Tiled

## Architecture

The architecture is based on a clear separation between the game layer and the UI layer, with an **event bus** acting as a bridge between them.

*   **Game Layer (Phaser):** Handles the world rendering, player movement, physics, and interactions with game objects like NPCs and portals.
*   **UI Layer (React):** Renders the educational content, including lessons and quizzes, as well as the game's HUD, menus, and dialog boxes.
*   **Event Bus:** A singleton that allows the game and the UI to communicate with each other without being directly coupled.

## Data Models

The project uses a set of well-defined data models for quests, worlds, and save data. This data is stored in JSON files in the `/public/content/` directory.

*   **Quest Data Model:** Defines the structure of a quest, including its milestones (lessons and quizzes), rewards, and prerequisites.
*   **World Data Model:** Defines the structure of a game world, including its map, tileset, quests, NPCs, and portals.
*   **Save Data Model:** Defines the structure of the save data, which is stored in `localStorage`.

## Development Plan

The project is divided into four phases:

1.  **Phase 1: Core Foundation (MVP):** Build a playable single-world prototype with a basic quest system.
2.  **Phase 2: Multi-World Expansion:** Add support for multiple interconnected worlds and a progression system.
3.  **Phase 3: Backend Integration (Optional):** Add a backend for cloud-based user accounts and content management.
4.  **Phase 4: Enhancement & Polish:** Add additional features, such as advanced quiz types, mini-games, and an achievements system.

## Getting Started

To get started with the project, you'll need to follow the steps outlined in the `coderquest-checklist.md` file. The first step is to set up the project scaffolding with Vite and install the necessary dependencies.

### Key Commands

*   `npm run dev`: Starts the Vite development server.
*   `npm run build`: Creates a production build of the project.
*   `npm run preview`: Starts a local server to preview the production build.

## Building and Running

### Running the Game

1.  **Follow the setup instructions** in `coderquest-checklist.md` to create the Vite project and install dependencies.
2.  **Start the development server:**
    ```bash
    npm run dev
    ```
3.  Open your web browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

### Compiling SCSS

The project uses SCSS for styling. Vite will automatically compile the SCSS files to CSS when you run the development server.