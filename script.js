// Global State Object
const state = {
    currentLook: null,
    favoriteLooks: [],
    tipsData: null,
};

// Vibe Configuration Object
const VIBES = {
    "soft-glam": { label: "Soft Glam", baseHex: "F4C2C2" },
    "clean-girl": { label: "Clean Girl", baseHex: "F9F5EB" },
    "coquette": { label: "Coquette", baseHex: "FEC5E5" },
    "bold": { label: "Bold", baseHex: "B91C1C" },
    "grunge": { label: "Grunge", baseHex: "3B3B58" }
};

// DOM Elements
const vibeSelect = document.getElementById('vibe-select');
const occasionSelect = document.getElementById('occasion-select');
const generateBtn = document.getElementById('generate-btn');
const lookResult = document.getElementById('look-result');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const lookCard = document.getElementById('look-card');
const moodLabel = document.getElementById('mood-label');
const occasionLabel = document.getElementById('occasion-label');
const colorSwatches = document.getElementById('color-swatches');
const faceList = document.getElementById('face-list');
const eyesList = document.getElementById('eyes-list');
const lipsList = document.getElementById('lips-list');
const saveFavoriteBtn = document.getElementById('save-favorite-btn');
const favoritesContainer = document.getElementById('favorites-container');
const noFavorites = document.getElementById('no-favorites');
const tipsList = document.getElementById('tips-list');

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    populateVibeDropdown();
    loadFavoritesFromStorage();
    await loadTipsData();
    renderFavorites();
    
    generateBtn.addEventListener('click', generateLook);
    saveFavoriteBtn.addEventListener('click', saveCurrentLookToFavorites);
});

// Populate Vibe Dropdown
function populateVibeDropdown() {
    const vibeEmojis = {
        "soft-glam": "✨",
        "clean-girl": "🌸",
        "coquette": "💕",
        "bold": "🔥",
        "grunge": "🖤"
    };
    
    Object.keys(VIBES).forEach(vibeKey => {
        const option = document.createElement('option');
        option.value = vibeKey;
        option.textContent = `${vibeEmojis[vibeKey] || "✨"} ${VIBES[vibeKey].label}`;
        vibeSelect.appendChild(option);
    });
}

// Load Tips Data
async function loadTipsData() {
    try {
        const response = await fetch('tips.json');
        if (!response.ok) {
            throw new Error('Failed to load tips');
        }
        state.tipsData = await response.json();
    } catch (error) {
        console.error('Error loading tips:', error);
        state.tipsData = null;
    }
}

// LocalStorage Helpers
function loadFavoritesFromStorage() {
    const stored = localStorage.getItem('favoriteLooks');
    if (stored) {
        try {
            state.favoriteLooks = JSON.parse(stored);
            // Ensure all favorites have originalPalette for backwards compatibility
            state.favoriteLooks.forEach(look => {
                if (!look.originalPalette && look.palette) {
                    look.originalPalette = [...look.palette];
                }
            });
        } catch (error) {
            console.error('Error loading favorites from storage:', error);
            state.favoriteLooks = [];
        }
    }
}

function saveFavoritesToStorage() {
    try {
        localStorage.setItem('favoriteLooks', JSON.stringify(state.favoriteLooks));
    } catch (error) {
        console.error('Error saving favorites to storage:', error);
    }
}

// API Fetch Functions
async function fetchPaletteForVibe(vibeKey) {
    const baseHex = VIBES[vibeKey].baseHex;
    const url = `https://www.thecolorapi.com/scheme?hex=${baseHex}&mode=analogic&count=5`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch color palette');
        }
        const data = await response.json();
          // Extract hex colors from the API response
        const colors = data.colors.map(color => color.hex.value);
        return colors;
    } catch (error) {
        console.error('Error fetching palette:', error);
        throw error;
    }
} 