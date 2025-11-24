# CoderQuest Asset Integration Guide

This guide provides detailed instructions for replacing placeholder assets and integrating new maps into the CoderQuest project.

## Part 1: Replacing Visual Assets (.png files)

The project currently uses empty placeholder files for all visual assets. To make the game visible, you need to replace these with valid `.png` image files.

### Asset Locations:

-   **Tilesets:** `public/assets/tilesets/`
-   **Sprites:** `public/assets/sprites/`

### Replacement Steps:

1.  **Create your assets:** Design your player, NPC, portal, and tile assets. Transparent backgrounds are recommended for sprites.
    -   `player.png`: The player character sprite. A 32x32 pixel dimension is a good starting point.
    -   `npc.png`: A generic NPC sprite. Also 32x32 pixels.
    -   `portal.png`: The portal sprite. Also 32x32 pixels.
    -   `tiles.png`: The tileset image containing all the tiles for your map (e.g., grass, walls, paths). The size will depend on your tile size and arrangement.

2.  **Replace the placeholders:**
    -   Navigate to the directories listed above.
    -   Delete the existing empty `.png` files.
    -   Place your new, valid `.png` files in the appropriate directories, keeping the filenames the same.

After replacing the files, restart the Vite development server (`npm run dev`) or refresh your browser. The "Failed to process file" errors should disappear, and your assets should be visible in the game.

---

## Part 2: Integrating a New Tiled Map

To replace the placeholder `world_01.json` with your own custom map from the [Tiled Map Editor](https://www.mapeditor.org/), follow these steps carefully.

### Step 2.1: Tiled Editor Configuration

1.  **Create Your Map:** Design your level in Tiled.

2.  **Layer Structure:** The game engine expects a specific layer structure. Create the following layers in this order:
    -   `Ground`: A **Tile Layer** for floor tiles and non-colliding scenery.
    -   `Walls`: A **Tile Layer** for any tiles the player should collide with (e.g., walls, trees, rocks).
    -   `Objects`: An **Object Layer** to place interactive items like the player spawn point, NPCs, and portals.

3.  **Collision Setup:**
    -   In Tiled, select your `Walls` layer.
    -   In the "Properties" panel on the left, add a new **Custom Property**.
    -   Set the **Type** to `bool`.
    -   Set the **Name** to `collides`.
    -   Check the box to set its value to `true`.
    -   Our code in `GameScene.js` specifically looks for this property (`wallsLayer.setCollisionByProperty({ collides: true });`) to make a layer solid. You can reuse this for any tile layer you want to be collidable.

4.  **Object Properties:**
    -   Select the `Objects` layer.
    -   Use the "Insert Rectangle" or "Insert Point" tool to place your objects.
    -   For each object, you **must** set its **Type** and **Custom Properties** in the "Properties" panel.

    -   **Player Spawn Point:**
        -   **Name:** `spawn`
        -   **Type:** (leave blank)

    -   **NPCs:**
        -   **Type:** `npc`
        -   **Custom Properties:**
            -   `dialogId` (string): The filename of the dialog JSON in `public/content/dialogs/` (e.g., `dialog_intro`).

    -   **Portals:**
        -   **Type:** `portal`
        -   **Custom Properties:**
            -   `questId` (string): The filename of the quest JSON in `public/content/` (e.g., `quest_01`).

### Step 2.2: Exporting from Tiled

**This is the most critical step.**

1.  Go to **File > Export As...**
2.  For "Save as type", choose **JSON map files (*.json)**.
3.  Name your file (e.g., `new_world.json`) and save it into the `public/maps/` directory.
4.  **IMPORTANT:** A "JSON Export Options" dialog will appear. Make sure **"Embed tilesets"** is **CHECKED**. The game cannot load external tilesets.

### Step 2.3: Loading the New Map in Code

1.  Open `src/game/scenes/GameScene.js`.
2.  In the `preload()` function, change the `load.tilemapTiledJSON` key and URL to match your new file:
    ```javascript
    // Before
    this.load.tilemapTiledJSON('world_01', 'maps/world_01.json');

    // After
    this.load.tilemapTiledJSON('new_world_key', 'maps/new_world.json');
    ```
3.  In the `create()` function, update the key used to create the map:
    ```javascript
    // Before
    const map = this.make.tilemap({ key: 'world_01' });

    // After
    const map = this.make.tilemap({ key: 'new_world_key' });
    ```

---

## Part 3: Implementing New Collisions

### Player-NPC Collision

As requested, the player and NPCs will now collide with each other. This was implemented by adding the following line to `src/game/scenes/GameScene.js`:

```javascript
this.physics.add.collider(this.player, this.npcs);
```

Since NPCs are set to be immovable, the player will be stopped by them, but the player won't be able to push them.

### Custom Collision Layers

If your new map has additional layers you want to be collidable (e.g., a "Water" layer the player can't cross), follow the same process as the `Walls` layer:

1.  In Tiled, select your new layer (e.g., `Water`).
2.  Add the custom boolean property `collides` and set it to `true`.
3.  In `src/game/scenes/GameScene.js`, find where the `wallsLayer` is created and add code for your new layer:
    ```javascript
    // In create()
    const wallsLayer = map.createLayer('Walls', tileset, 0, 0);
    const waterLayer = map.createLayer('Water', tileset, 0, 0); // Add this

    wallsLayer.setCollisionByProperty({ collides: true });
    waterLayer.setCollisionByProperty({ collides: true }); // Add this

    // ...

    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.player, waterLayer); // Add this
    ```
This allows for flexible and powerful level design directly from the Tiled editor.
