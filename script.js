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

