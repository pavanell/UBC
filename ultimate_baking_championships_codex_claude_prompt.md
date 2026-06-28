# Build Prompt: Ultimate Baking Championships

You are building a polished, playable 2D browser game called **Ultimate Baking Championships**.

The game must run in modern web browsers on:

- iPhone
- Android phones and tablets
- Desktop and laptop computers

The repository name is not known yet. Before configuring GitHub Pages, ask the user for:

- their GitHub username or organization
- the repository name

Use those values to configure the final GitHub Pages deployment URL and Vite base path.

## 1. Primary Goal

Create a complete, playable prototype of a retro pixel-art baking competition game.

The game should feel inspired by the simplicity, readability, and pixel-art animation style of games such as Retro Bowl, but it must not copy any protected assets, screens, fonts, layouts, characters, logos, or exact visual designs.

The game is also broadly inspired by televised baking competitions, especially children’s baking competitions, but all characters, judges, dialogue, branding, challenges, and presentation must be original.

The game must be appropriate for all ages, especially children under 13.

## 2. Required Technology

Use a web-first 2D game architecture suitable for GitHub Pages.

Recommended stack:

- TypeScript
- Phaser 3
- Vite
- HTML5 Canvas
- CSS for surrounding interface and layout
- GitHub Actions for automated GitHub Pages deployment

Do not build this as a 3D game.

The first version should not require a backend.

The first version should not include:

- user accounts
- cloud saves
- local save slots
- music
- sound effects
- spoken voices
- live AI image generation
- shared online databases

Structure the code so that authentication, cloud saves, shared recipe data, and procedural content services could be added later without rewriting the whole application.

## 3. Deployment Requirements

The project must be easy to run locally with:

```bash
npm install
npm run dev
```

It must build with:

```bash
npm run build
```

It must deploy automatically to GitHub Pages whenever changes are pushed to the `main` branch.

Create:

- a correct Vite configuration
- a GitHub Pages-compatible base path
- a GitHub Actions workflow under `.github/workflows/`
- clear README instructions for enabling GitHub Pages
- clear instructions showing where the user must insert the repository name
- a single-page application fallback strategy suitable for GitHub Pages

Do not hard-code a repository name. Use an obvious placeholder such as:

```text
YOUR_REPOSITORY_NAME
```

Ask the user for the final repository name before replacing the placeholder.

## 4. Visual Style

Use original retro pixel art.

The game should have:

- top-down gameplay
- portrait-first layout on phones
- responsive layout on tablets and desktops
- a warm kitchen palette dominated by tan, cream, brown, and copper
- brighter colors for food, ingredients, clothing, and appliances
- simple readable pixel-art animations
- no emojis
- speech bubbles for dialogue
- enlarged, clear character sprites appropriate for mobile viewing

Use temporary original placeholder sprites that can be replaced later.

Do not copy Retro Bowl character proportions exactly. Choose proportions and zoom levels that work well for a top-down kitchen game.

## 5. Input and Controls

### Desktop

Support both:

- Arrow keys
- WASD

Allow the player to remap keyboard controls in a settings screen.

### Mobile and Tablet

Use touch-friendly movement inspired by simple mobile sports games.

Preferred behavior:

- tap a walkable destination to move there
- tap appliances, counters, doors, and interface buttons to interact
- use direct touch gestures for cooking actions

### Cooking Gestures

For actions such as hand mixing, allow free-form interaction including:

- tapping
- dragging
- circular motion
- up-and-down motion
- swiping

The game is movement-based, not primarily menu-based. The player should physically move around the kitchen between workstations.

Menus may still use buttons and taps when appropriate.

## 6. Opening Character Creation

Before the game begins, show a character creation sequence.

Allow the player to choose:

- name
- gender presentation, including girl, boy, and additional inclusive options
- hairstyle
- hair color
- skin tone
- clothing
- clothing colors

The player must be able to change their name and appearance later.

All character art must remain in the original retro pixel-art style.

## 7. Home Room

After character creation, place the player in a top-down home room.

The room contains three walk-in doors:

1. Normal Mode
2. Hard Mode
3. Free Cook

The player must physically walk through a door to enter a mode.

Also display the player’s current Rating on the home screen once the rating has been established.

The game should not initially show a save or resume system.

For the first version:

- Normal Mode starts a new championship immediately after its intro screen
- Hard Mode starts a new championship immediately after its intro screen
- Free Cook opens the persistent current session only for the current browser session
- refreshing or closing the browser may reset progress in this first version

Clearly document that persistent saves are deferred to a later phase.

## 8. Judges and Contestants

There are five total bakers:

- the player
- four computer-controlled bakers

The judges are fictional original characters named:

- Josh
- Nicole

Josh and Nicole should:

- retain consistent appearances
- wear different outfits in different rounds or playthroughs
- communicate using speech bubbles
- announce challenges
- judge dishes
- announce scores
- explain scores briefly when requested

The four computer-controlled contestants should have:

- randomly selected names
- randomly selected appearances
- skill levels near the player’s current Rating
- no need for extensive personalities or long dialogue

## 9. Championship Structure

A championship has four rounds.

The sequence is:

1. Josh and Nicole introduce themselves.
2. All five bakers introduce themselves.
3. Josh and Nicole announce the challenge.
4. The bakers cook.
5. Josh and Nicole inspect and taste each dish.
6. The judges announce each combined score.
7. The lowest-scoring contestant is eliminated.
8. The cycle repeats from the challenge announcement.
9. After four rounds, one winner remains.

Later rounds must become harder.

Challenges should usually be broad themes instead of fixed recipes.

Examples:

- winter-themed bake
- dessert impostor
- celebration dessert
- layered bake
- pastry challenge
- bread challenge
- plated dessert
- multi-component finale
- giant cake finale
- savory baking challenge

Some later challenges may require multiple components.

If the player is eliminated:

- show the elimination scene
- offer a button to return to the home room
- do not require the player to watch the rest of the competition

If two contestants tie for the lowest score:

- show a spinner wheel
- randomly choose which tied contestant is eliminated

## 10. Challenge Timing

Use accelerated in-game time.

A challenge may represent one hour in the game, but the clock should pass much faster so the player experiences only a few real minutes.

Display both:

- the fictional challenge time
- a clear countdown appropriate for gameplay

When the timer reaches zero:

- display “Hands Up”
- immediately stop active cooking input
- require the player to submit the dish as it currently exists
- unfinished dishes must still be judged

The game may be paused through a pause menu.

Since persistent saving is deferred, the pause menu should include:

- Resume
- Restart Round
- Return to Home Room
- Settings

## 11. Normal Mode

Normal Mode includes:

- five bakers
- four rounds
- progressively harder themed challenges
- one elimination per round
- unrestricted ingredient selection
- full access to cooking stations and tools

The player can make any dish that satisfies the challenge.

## 12. Hard Mode

Hard Mode is identical to Normal Mode except:

- each round assigns three required ingredients
- all three ingredients must be used
- each ingredient must be part of the edible submission
- edible decoration counts
- ingredients may be split across separate components of one submission
- the ingredient combination must be reasonably workable
- Hard Mode has no extra timer penalty
- Hard Mode is unlocked from the beginning

## 13. Free Cook

Free Cook has:

- no judges
- no elimination
- no championship
- access to all ingredients
- access to all appliances
- access to all cooking actions
- freedom to make any dish

Do not show recipe hints for undiscovered recipes.

Recipes discovered in Free Cook should count toward the recipe library and Rating during the current session.

For the first version, Free Cook progress does not need to persist after closing or refreshing the page.

## 14. Recipe Library

The recipe library starts completely empty.

For undiscovered recipes, show nothing:

- no recipe name
- no silhouette
- no ingredients
- no hints
- no technique
- no instructions

A recipe is discovered only when the player completes it using:

- correct ingredients
- correct ingredient quantities
- correct techniques
- sufficiently correct process
- acceptable cooking state

Once discovered, reveal a recipe entry based on what the player actually did.

Store in the current session:

- dish name
- ingredients used
- quantities
- unit system
- steps
- techniques
- appliance settings
- timing
- temperature
- result
- score
- generated dish appearance

The library should grow from zero entries upward.

## 15. Units and Measurements

Before cooking, allow the player to choose:

- Metric
- US customary

Support realistic measurements, including:

- grams
- kilograms
- milliliters
- liters
- teaspoons
- tablespoons
- cups
- ounces
- pounds

Do not use oversimplified labels such as “small amount” unless used only in tutorials for very young players.

Ingredient quantity must affect the result.

## 16. Ingredient System

Create a large, searchable ingredient catalog designed for baking competitions.

The catalog should be extensive and data-driven.

Do not require the player to scroll through the full catalog. Provide:

- search
- categories
- recent ingredients
- favorites for the current session
- filters

Include common ingredients used in baking competitions, such as:

- flours
- sugars
- fats
- dairy
- eggs
- chocolate
- cocoa
- fruits
- vegetables used in baking
- nuts
- seeds
- spices
- herbs
- extracts
- flavorings
- leaveners
- starches
- grains
- fillings
- jams
- preserves
- frostings
- decorations
- candies
- edible flowers
- cheeses
- savory fillings
- breads and pastry components

Do not include:

- alcohol
- fictional ingredients
- unsafe substances
- obviously inappropriate ingredients

Culturally specific ingredients may be included when they are realistic, appropriate, and reasonably likely to appear in a baking competition, but avoid an unnecessarily obscure catalog.

Make the catalog easy to expand through JSON or TypeScript data files.

Do not claim to literally include every ingredient in existence. Instead, implement a broad, expandable competition-focused catalog.

## 17. Recipe Data

Create a broad recipe dataset that is expandable and data-driven.

Include many categories, such as:

- cakes
- cupcakes
- brownies
- cookies
- pies
- tarts
- pastries
- breads
- rolls
- biscuits
- muffins
- cheesecakes
- custards
- puddings
- mousses
- meringues
- macarons
- doughnuts
- choux pastry
- laminated dough
- cobblers
- crisps
- crumbles
- dessert impostors
- plated desserts
- savory pies
- savory breads
- quiches
- pizza-style bakes
- hand pies
- multi-component desserts

Start with as many well-structured recipes as practical, but prioritize:

- correctness
- consistency
- extensibility
- gameplay usefulness

Do not scrape copyrighted recipe text.

Store recipes as structured data containing:

- name
- category
- required ingredients
- acceptable substitutions
- quantity ranges
- required techniques
- optional techniques
- cooking method
- temperature ranges
- time ranges
- likely failure modes
- presentation targets
- creativity opportunities

## 18. Kitchen Layout

Build a practical top-down competition kitchen.

Include walkable stations for:

- ingredient pantry
- refrigerator
- freezer
- sink
- measuring station
- preparation counter
- cutting station
- hand-mixing station
- electric mixer
- blender
- food processor
- stove
- oven
- microwave
- proofing area
- cooling rack
- decorating station
- plating station
- trash or discard station
- judging table

The kitchen should be readable on a phone screen.

Use collision boundaries and pathfinding or direct movement logic so the player can navigate naturally.

## 19. Cooking Actions

Implement interactive mechanics for all major cooking actions.

At minimum include:

- measuring
- pouring
- stirring
- whisking
- beating
- folding
- kneading
- rolling
- shaping
- cutting
- chopping
- blending
- processing
- sifting
- piping
- frosting
- decorating
- frying
- boiling
- simmering
- baking
- chilling
- freezing
- resting
- proofing
- cooling
- assembling
- plating

Each major station should have a distinct interaction rather than using only one generic progress bar.

Examples:

- mixing evaluates motion, speed, direction, and duration
- kneading evaluates rhythm and duration
- oven use evaluates temperature and time
- rolling evaluates pressure and evenness
- piping evaluates path accuracy
- decorating evaluates placement and balance
- chopping evaluates consistency
- measuring evaluates quantity accuracy
- blending evaluates speed and duration

The player should control:

- ingredient order
- ingredient amounts
- mixer speed
- mixing duration
- oven temperature
- baking time
- resting time
- cooling time
- proofing time
- assembly order
- decoration choices

## 20. Cooking Outcomes and Failure Modes

The game must simulate realistic consequences.

Food may become:

- burned
- underbaked
- raw
- dry
- soggy
- overmixed
- undermixed
- curdled
- collapsed
- dense
- too wet
- too salty
- too sweet
- unevenly cooked
- poorly shaped
- badly decorated
- structurally unstable

The player may:

- discard a dish
- restart from scratch during the round

The player may not undo an individual mistake.

## 21. Unknown Dishes

If the player creates something that does not match a known recipe:

- analyze the ingredient combination
- analyze the cooking method
- determine whether it is plausible
- create a procedural pixel-art appearance using existing dish parts

Do not use live generative AI.

Use procedural combinations of:

- plate shapes
- cake shapes
- bread shapes
- crusts
- fillings
- frostings
- toppings
- colors
- garnishes
- layers
- crumbs
- sauces

Filter player-entered dish names for safety and age appropriateness.

Classify unknown results as:

- Dubious Food: strange but edible
- Inedible Food: unsafe, impossible, or not realistically edible

Inedible Food should receive a very low Taste score.

## 22. Judging Rubric

Each dish is judged on:

- Taste
- Presentation
- Creativity

Each category has equal weight.

Use simple whole-number component scores and convert them into a final whole-number score out of 100.

Do not show decimals.

Taste should consider:

- flavor balance
- texture
- doneness
- ingredient compatibility
- correct technique
- seasoning
- structural success

Presentation should consider:

- visual appeal
- neatness
- color
- plating
- decoration
- structure
- whether it looks appetizing

Creativity should consider:

- originality
- thoughtful ingredient combinations
- interpretation of the theme
- added components
- interesting but sensible choices

Random combinations should not automatically score well for creativity.

A more original dish may beat a plain dish when Taste and Presentation are otherwise similar.

Josh and Nicole announce one combined score per contestant.

Provide an optional short explanation such as:

- “Great flavor, but slightly overbaked.”
- “Beautiful presentation and a creative filling.”
- “Interesting idea, but the textures did not work together.”

## 23. Computer-Controlled Bakers

Computer-controlled contestants must use the same underlying cooking and judging systems as the player.

Their performance should be simulated using:

- skill level
- current player Rating
- challenge difficulty
- recipe complexity
- technique success
- occasional believable mistakes

Do not assign arbitrary scores unrelated to the judging system.

Opponent skill should generally be near the player’s current Rating.

## 24. Rating System

Create a global Rating from approximately 0 to 3000.

The Rating is based on dish quality, not simply wins and losses.

The first Rating is assigned after the player discovers three recipes.

Update the Rating after qualifying dishes and judged championship dishes.

Free Cook may affect Rating only when a valid recipe is completed and evaluated.

The Rating should reflect:

- Taste
- Presentation
- Creativity
- technique consistency
- recipe complexity
- repeated performance

Create named tiers covering the entire range.

Use this progression or improve it while preserving the early names:

- 0–99: Kitchen Disaster
- 100–199: Kitchen Screw-Up
- 200–399: Beginner
- 400–599: Home Helper
- 600–799: Mixing Apprentice
- 800–999: Junior Baker
- 1000–1199: Skilled Baker
- 1200–1399: Kitchen Competitor
- 1400–1599: Rising Pastry Star
- 1600–1799: Advanced Baker
- 1800–1999: Championship Baker
- 2000–2199: Expert Pastry Chef
- 2200–2399: Master Baker
- 2400–2599: Grand Champion
- 2600–2799: Baking Legend
- 2800–3000: Ultimate Baking Champion

Display the Rating and tier in the home room.

## 25. Interface Screens

Create these screens:

- Loading screen
- Character creation
- Home room
- Normal Mode intro
- Hard Mode intro
- Free Cook intro
- Championship introductions
- Challenge announcement
- Cooking gameplay
- Pause menu
- Hands Up screen
- Judging sequence
- Score breakdown
- Elimination screen
- Winner screen
- Recipe library
- Rating screen
- Character customization
- Settings
- Credits

## 26. Tutorials

Because the game is intended for children, include brief tutorials.

Tutorials should explain:

- movement
- selecting ingredients
- searching the ingredient library
- using appliances
- measuring
- mixing
- oven temperature
- timers
- discarding a dish
- submitting a dish
- judging
- recipe discovery
- Rating

Use short speech bubbles and visual cues.

Avoid long walls of text.

## 27. Responsiveness

The game must work well in:

- iPhone portrait browsers
- Android portrait browsers
- tablets
- desktop browsers

On desktop:

- center the portrait game viewport
- allow optional full-screen scaling
- preserve pixel-art sharpness
- avoid blurring sprites

On mobile:

- respect safe areas
- prevent accidental page scrolling during gameplay
- ensure buttons are large enough to tap
- keep important controls away from browser UI edges

## 28. Performance

Optimize for mobile browsers.

Requirements:

- lazy-load large data where practical
- use sprite atlases
- reuse procedural sprites
- avoid excessive memory use
- keep animation frame rates stable
- avoid loading the full recipe dataset into every scene
- keep the initial download reasonably small
- use code splitting where useful

## 29. Code Architecture

Use clear modules for:

- scenes
- player movement
- touch input
- keyboard input
- character customization
- ingredient data
- recipe data
- cooking simulation
- cooking mini-games
- judging
- Rating
- challenge generation
- procedural dish rendering
- UI
- dialogue
- settings
- deployment configuration

Use TypeScript types for:

- Ingredient
- Recipe
- Dish
- CookingAction
- CookingResult
- Challenge
- Contestant
- JudgeScore
- RatingTier
- PlayerProfile
- KitchenStation

Keep game data separate from game logic.

## 30. Testing and Quality

Include at least:

- unit tests for scoring
- unit tests for Rating updates
- unit tests for recipe matching
- unit tests for ingredient quantity validation
- unit tests for required Hard Mode ingredients
- unit tests for unknown-dish classification
- a smoke test for loading the main game
- linting
- formatting
- TypeScript strict mode

## 31. Documentation

Create a README containing:

- game overview
- technology stack
- local installation
- local development
- production build
- GitHub Pages deployment
- repository-name placeholder instructions
- project structure
- how to add ingredients
- how to add recipes
- how to add kitchen stations
- how to replace placeholder sprites
- known limitations
- deferred features

## 32. Deferred Features

Clearly list these as future phases:

- user accounts
- cloud saves
- cross-device progress
- multiple save slots
- shared recipe database
- shared generated dishes
- live AI image generation
- sound effects
- music
- spoken dialogue
- native App Store packaging
- native Google Play packaging

## 33. Acceptance Criteria

The first version is complete when:

1. The app launches successfully in a browser.
2. It can be deployed to GitHub Pages.
3. It works on iPhone, Android, and desktop browsers.
4. The player can create and customize a character.
5. The player can walk around the home room.
6. The player can enter Normal, Hard, and Free Cook modes.
7. A complete four-round championship can be played.
8. The player can be eliminated.
9. A winner can be declared.
10. The player can move through a top-down kitchen.
11. The player can select ingredients and quantities.
12. The player can use multiple distinct appliances and cooking actions.
13. Food quality changes based on player choices and execution.
14. Judges score Taste, Presentation, and Creativity.
15. Computer contestants use the same simulation rules.
16. Hard Mode requires three assigned ingredients.
17. Free Cook supports unrestricted cooking.
18. Recipes can be discovered.
19. The recipe library begins empty.
20. The Rating system activates after three discovered recipes.
21. Unknown dishes receive procedural pixel-art appearances.
22. Dubious Food and Inedible Food are supported.
23. Keyboard and touch controls both work.
24. The interface is readable in portrait orientation.
25. The project includes deployment and setup documentation.

## 34. Development Approach

Work in phases, but keep the repository runnable after every phase.

Recommended order:

1. Project setup and GitHub Pages deployment
2. Responsive game shell
3. Character creation
4. Home room and movement
5. Kitchen map and stations
6. Ingredient and recipe data model
7. Core cooking simulation
8. Cooking mini-games
9. Challenge generation
10. Judges and scoring
11. Computer contestants
12. Championship loop
13. Hard Mode
14. Free Cook
15. Recipe discovery
16. Rating system
17. Procedural dish rendering
18. Tutorials
19. Testing and optimization
20. Documentation

After each major phase:

- run tests
- run the production build
- verify GitHub Pages compatibility
- fix all TypeScript errors
- keep the game playable

## 35. First Action Required

Before finalizing deployment configuration, ask the user:

1. What is the GitHub username or organization?
2. What is the exact repository name?

Until those values are provided, keep the deployment base path as a placeholder and document where it must be replaced.
