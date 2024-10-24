const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const menuButton = document.getElementById('menu-button');
const infoModal = document.getElementById('info-modal');
const closeInfo = document.getElementById('close-info');
const shopModal = document.getElementById('shop-modal');
const closeShop = document.getElementById('close-shop');
const charactersModal = document.getElementById('characters-modal');
const closeCharacters = document.getElementById('close-characters');

// Create an audio element for the pickup sound
const pickupSound = new Audio('pickup.mp3'); // Ensure the path to your sound file is correct

// Player initial position
let playerX = 50;
let playerY = 50;
player.style.top = `${playerY}%`;
player.style.left = `${playerX}%`;

// Define the level system
let level = 1;
const levelData = {
    1: { maxTrash: 5, reward: 150 },
    2: { maxTrash: 7, reward: 200 },
    3: { maxTrash: 8, reward: 250 },
    4: { maxTrash: 10, reward: 300 }
};

// Load owned characters from local storage
let ownedCharacters = JSON.parse(localStorage.getItem('ownedCharacters')) || ['Superman']; // Default character
let equippedCharacter = localStorage.getItem('equippedCharacter') || 'Superman'; // Track the equipped character

// Mission object
let mission = {
    description: `Collect ${levelData[level].maxTrash} Trash Items`,
    progress: 0,
    maxProgress: levelData[level].maxTrash,
    coins: parseInt(localStorage.getItem('coins')) || 0,
    levelComplete: false,
    canCollectTrash: true,
    canUpgradeLevel: true,
    ownedCharacters: ownedCharacters, // Load from local storage
    equippedCharacter: equippedCharacter // Load from local storage
};

// Set the player's character image based on the equipped character
player.style.backgroundImage = `url('${equippedCharacter === 'Superman' ? 'player.png' : equippedCharacter === 'Shin-Chan' ? 'player2.png' : 'player3.png'}')`;

// Update mission progress and coin display
function updateMission() {
    document.getElementById('mission-text').textContent = `Collect ${mission.progress}/${mission.maxProgress} Trash Items`;
    document.getElementById('coin-count').textContent = mission.coins;
    localStorage.setItem('coins', mission.coins);

    // Update the progress bar
    const progressPercentage = (mission.progress / mission.maxProgress) * 100;
    document.getElementById('progress-bar'). style.width = `${progressPercentage}%`;

    // Check if level is complete and upgrade if needed
    if (mission.progress >= mission.maxProgress && !mission.levelComplete && mission.canUpgradeLevel) {
        mission.levelComplete = true;
        mission.canUpgradeLevel = false;
        mission.coins += levelData[level].reward;
        level++;
        if (level > 4) {
            alert("You completed all levels!");
            return;
        }
        alert(`Level Complete! You earned ${levelData[level - 1].reward} coins! Upgrading to Level ${level}...`);
        loadLevel(level);
    }
}

// Function to spawn trash items
function spawnTrash(trashClass, top, left, imageIndex) {
    const trash = document.createElement('div');
    trash.className = `trash ${trashClass}`;
    trash.style.top = `${top}% `;
    trash.style.left = `${left}%`;
    trash.style.backgroundImage = `url('trash${imageIndex}.png')`;
    trash.dataset.collected = "false";
    gameContainer.appendChild(trash);
    return trash;
}

// Load level and reset progress
function loadLevel(level) {
    const existingTrash = document.querySelectorAll('.trash');
    existingTrash.forEach(trash => trash.remove());

    mission.progress = 0;
    mission.levelComplete = false;
    mission.maxProgress = levelData[level].maxTrash;
    mission.canCollectTrash = true;
    mission.canUpgradeLevel = true;
    updateMission();

    for (let i = 1; i <= levelData[level].maxTrash; i++) {
        spawnTrash(`trash${i}`, Math.random() * 70, Math.random() * 70, i); // Trash with image index
    }
}

// Initialize level 1
loadLevel(level);

// Collision detection between player and trash
function checkCollision(playerX, playerY, trash) {
    const trashRect = trash.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect(); // Corrected to getBoundingClientRect()
    return !(playerRect.right < trashRect.left ||
             playerRect.left > trashRect.right ||
             playerRect.bottom < trashRect.top ||
             playerRect.top > trashRect.bottom);
}

// Collect trash when player touches it
function collectTrash() {
    if (!mission.canCollectTrash) return;
    const trashItems = document.querySelectorAll('.trash');
    trashItems.forEach((trash) => {
        if (trash.dataset.collected === "false" && checkCollision(playerX, playerY, trash)) {
            trash.dataset.collected = "true";
            trash.style.display = "none"; // Hide the trash
            mission.progress++;
            mission.coins += 10;

            // Play pickup sound
            pickupSound.play();

            updateMission();
        }
    });
}

// Player movement via keyboard
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            playerY = Math.max(playerY - 5, 0);
            break;
        case 'ArrowDown':
            playerY = Math.min(playerY + 5, 100);
            break;
        case 'ArrowLeft':
            playerX = Math.max(playerX - 5, 0);
            break;
        case 'ArrowRight':
            playerX = Math.min(playerX + 5, 100);
            break;
    }
    player.style.top = `${playerY}%`;
    player.style.left = `${playerX}%`;
    collectTrash();
});

// Player movement via on-screen buttons
const leftButton = document.getElementById('left-button');
const upButton = document.getElementById('up-button');
const downButton = document.getElementById('down-button');
const rightButton = document.getElementById('right-button');

leftButton.addEventListener('click', () => {
    playerX = Math.max(playerX - 5, 0);
    player.style.left = `${playerX}%`;
    collectTrash();
});

upButton.addEventListener('click', () => {
    playerY = Math.max(playerY - 5, 0);
    player.style.top = `${playerY}%`;
    collectTrash();
});

downButton.addEventListener('click', () => {
    playerY = Math.min(playerY + 5, 100);
    player.style.top = `${playerY}%`;
    collectTrash();
});

rightButton.addEventListener('click', () => {
    playerX = Math.min(playerX + 5, 100);
    player.style.left = `${playerX}%`;
    collectTrash();
});

// Info modal logic
menuButton.addEventListener('click', () => {
    const menuOptions = document.getElementById('menu-options');
    menuOptions.style.display = "block";
});

document.getElementById('info-button').addEventListener('click', () => {
    infoModal.style.display = "block";
    const menuOptions = document.getElementById('menu-options');
    menuOptions.style.display = "none";
});

document.getElementById('characters-button').addEventListener('click', () => {
    charactersModal.style.display = "block";
    const menuOptions = document.getElementById('menu-options');
    menuOptions.style.display = "none";
    displayCharacters();
});

document.getElementById('shop-button').addEventListener('click', () => {
    shopModal.style.display = "block";
    const menuOptions = document.getElementById('menu-options');
    menuOptions.style.display = "none";
    openShop();
});

closeInfo.addEventListener('click', () => {
    infoModal.style.display = "none";
});

closeShop.addEventListener('click', () => {
    shopModal.style.display = "none";
});

closeCharacters.addEventListener('click', () => {
    charactersModal.style.display = "none";
});

// Shop modal logic
const shopItems = [
    { id: 'shinchan', name: 'Shin-Chan', price: 5000, image: 'player2.png' },
    { id: 'barbie', name: 'Barbie', price: 3500, image: 'player3.png' }
];

function openShop() {
    shopModal.style.display = "block";
    const shopContainer = document.getElementById('shop-content');
    shopContainer.innerHTML = ''; // Clear the shop content
    shopItems.forEach(item => {
        const shopItem = document.createElement('div');
        shopItem.classList.add('shop-item');
        let buttonText = 'Buy';
        if (mission.ownedCharacters.includes(item.id)) {
            buttonText = 'Owned';
        }
        shopItem.innerHTML = `
            <img class="shop-character" src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>Price: ${item.price} coins</p>
            <button ${buttonText === 'Buy' ? `onclick="buyItem(${item.price}, '${item.id}')"` : ''}>${buttonText}</button>
        `;
        shopContainer.appendChild(shopItem);
    });
}

function buyItem(price, id) {
    if (mission.coins >= price) {
        mission.coins -= price;
        localStorage.setItem('coins', mission.coins);
        mission.ownedCharacters.push(id);
        localStorage.setItem('ownedCharacters', JSON.stringify(mission.ownedCharacters));
        alert("Item purchased successfully!");
        shopModal.style.display = "none";
    } else {
        alert("You don't have enough coins!");
    }
}

function displayCharacters() {
    const charactersContainer = document.getElementById('characters-content');
    charactersContainer.innerHTML = ''; // Clear the characters content
    mission.ownedCharacters.forEach((character) => {
        const characterItem = document.createElement('div');
        characterItem.classList.add('character-item');
        // Corrected image paths for characters
        characterItem.innerHTML = `
            <img class="character-img" src="${character === 'Superman' ? 'player.png' : character === 'Shin-Chan' ? 'player2.png' : 'player3.png'}" alt="${character} Character">
            <p>Name: ${character}</p>
            <button id="equip-${character}" onclick="equipCharacter('${character}')">Equip ${character}</button>
        `;
        charactersContainer.appendChild(characterItem);
    });
}

function equipCharacter(character) {
    mission.equippedCharacter = character;
    player.style.backgroundImage = `url('${character === 'Superman' ? 'player.png' : character === 'Shin-Chan' ? 'player2.png' : 'player3.png'}')`;
    localStorage.setItem('equippedCharacter', character);
    alert(`You equipped ${character}!`);
    charactersModal.style.display = "none";
}