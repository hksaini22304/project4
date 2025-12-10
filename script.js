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
async function fetchProductsForLook(vibeKey) {
    const productTypes = ['lipstick', 'blush', 'eyeshadow'];
    const productPromises = productTypes.map(type => 
        fetch(`https://makeup-api.herokuapp.com/api/v1/products.json?product_type=${type}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${type} products`);
                }
                return response.json();
            })
            .then(data => {
                // Randomly select 1-2 items from each category
                const count = Math.floor(Math.random() * 2) + 1;
                const shuffled = [...data].sort(() => 0.5 - Math.random());
                return shuffled.slice(0, count);
            })
            .catch(error => {
                console.error(`Error fetching ${type}:`, error);
                return [];
            })
    );

      try {
        const results = await Promise.all(productPromises);
        
        return {
            face: results[1] || [], // blush
            eyes: results[2] || [], // eyeshadow
            lips: results[0] || []  // lipstick
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Generate Look Function
async function generateLook() {
    const vibeKey = vibeSelect.value;
    const occasion = occasionSelect.value;
    
    if (!vibeKey) {
        alert('✨ Please select a vibe first!');
        return;
    }
    
    // Show loading state
    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    lookCard.style.display = 'none';
    
    try {
        // Fetch palette and products
        const [palette, products] = await Promise.all([
            fetchPaletteForVibe(vibeKey),
            fetchProductsForLook(vibeKey)
        ]);
        
        // Construct look object
        const look = {
            id: Date.now(),
            mood: VIBES[vibeKey].label,
            occasion: occasion || null,
            palette: palette,
            originalPalette: [...palette], // Store original for reset
            products: products
        };
        
        // Save to state
        state.currentLook = look;
        
        // Hide loading, show result
        loadingMessage.style.display = 'none';
        renderCurrentLook();
        
    } catch (error) {
        console.error('Error generating look:', error);
        loadingMessage.style.display = 'none';
        errorMessage.style.display = 'block';
        lookCard.style.display = 'none';
    }
}

// Rendering Functions
function renderCurrentLook() {
    if (!state.currentLook) return;
    
    const look = state.currentLook;
    
    // Set mood and occasion with emojis
    const moodEmojis = {
        "Soft Glam": "✨",
        "Clean Girl": "🌸",
        "Coquette": "💕",
        "Bold": "🔥",
        "Grunge": "🖤"
    };
    const occasionEmojis = {
        "everyday": "☀️",
        "date-night": "🌙",
        "party": "🎉",
        "wedding": "💍",
        "photoshoot": "📸"
    };
    
    moodLabel.textContent = `${moodEmojis[look.mood] || "✨"} Mood: ${look.mood}`;
    if (look.occasion) {
        const occasionLabelText = look.occasion.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        occasionLabel.textContent = `${occasionEmojis[look.occasion] || "📅"} Occasion: ${occasionLabelText}`;
        occasionLabel.style.display = 'block';
    } else {
        occasionLabel.style.display = 'none';
    }

     // Render color swatches with click handlers
    colorSwatches.innerHTML = '';
    look.palette.forEach((hex, index) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch clickable-swatch';
        swatch.style.backgroundColor = hex;
        swatch.title = `Click to adjust: ${hex}`;
        swatch.dataset.index = index;
        swatch.dataset.hex = hex;
        
        // Add click handler
        swatch.addEventListener('click', () => openColorPicker(swatch, index, look));
        
        // Add visual indicator that it's clickable
        const editIcon = document.createElement('span');
        editIcon.className = 'edit-icon';
        editIcon.textContent = '✏️';
        editIcon.style.display = 'none';
        swatch.appendChild(editIcon);
        
        // Show edit icon on hover
        swatch.addEventListener('mouseenter', () => {
            editIcon.style.display = 'block';
        });
        swatch.addEventListener('mouseleave', () => {
            editIcon.style.display = 'none';
        });
        
        colorSwatches.appendChild(swatch);
    });
    
    // Add reset button if palette has been modified
    if (JSON.stringify(look.palette) !== JSON.stringify(look.originalPalette)) {
        addResetPaletteButton(look);
    }
     // Render products
    renderProductList(faceList, look.products.face);
    renderProductList(eyesList, look.products.eyes);
    renderProductList(lipsList, look.products.lips);
    
    // Render tips
    renderTips(look.mood);
    
    // Show the look card
    lookCard.style.display = 'block';
}

function renderProductList(listElement, products) {
    listElement.innerHTML = '';
    
    if (products.length === 0) {
        const li = document.createElement('li');
        li.textContent = '😔 No products available';
        li.style.color = '#999';
        li.style.fontStyle = 'italic';
        listElement.appendChild(li);
        return;
    }
    
    products.forEach(product => {
        const li = document.createElement('li');
        li.className = 'product-item';
        
        // Create product image if available
        if (product.image_link) {
            const img = document.createElement('img');
            img.src = product.image_link;
            img.alt = `${product.brand || 'Unknown'} - ${product.name || 'Unnamed Product'}`;
            img.className = 'product-image';
            img.onerror = function() {
                // Hide image if it fails to load
                this.style.display = 'none';
            };
            li.appendChild(img);
        }
        
        // Create product link
        const link = document.createElement('a');
        link.href = product.product_link || '#';
        link.target = '_blank';
        link.className = 'product-link';
        link.textContent = `${product.brand || 'Unknown'} - ${product.name || 'Unnamed Product'}`;
        li.appendChild(link);
        
        listElement.appendChild(li);
    });
}

function renderFavorites() {
    favoritesContainer.innerHTML = '';
    
    if (state.favoriteLooks.length === 0) {
        noFavorites.style.display = 'block';
        return;
    }
    
    noFavorites.style.display = 'none';
    
    state.favoriteLooks.forEach(look => {
        const card = renderFavoriteCard(look);
        favoritesContainer.appendChild(card);
    });
}

function renderFavoriteCard(look) {
    const card = document.createElement('div');
    card.className = 'favorite-card';
    
    const moodEmojis = {
        "Soft Glam": "✨",
        "Clean Girl": "🌸",
        "Coquette": "💕",
        "Bold": "🔥",
        "Grunge": "🖤"
    };
    const occasionEmojis = {
        "everyday": "☀️",
        "date-night": "🌙",
        "party": "🎉",
        "wedding": "💍",
        "photoshoot": "📸"
    };
    const moodEmoji = moodEmojis[look.mood] || "✨";
    const occasionEmoji = look.occasion ? (occasionEmojis[look.occasion] || "📅") : "";
    const occasionLabelText = look.occasion ? look.occasion.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : '';
    
    card.innerHTML = `
        <h3>${moodEmoji} ${look.mood}</h3>
        <p class="mood-label">${moodEmoji} Mood: ${look.mood}</p>
        ${look.occasion ? `<p class="occasion-label">${occasionEmoji} Occasion: ${occasionLabelText}</p>` : ''}
        <div class="color-swatches"></div>
        <div class="products-container">
            <div class="product-category">
                <h4>Face</h4>
                <ul class="face-list"></ul>
            </div>
            <div class="product-category">
                <h4>Eyes</h4>
                <ul class="eyes-list"></ul>
            </div>
            <div class="product-category">
                <h4>Lips</h4>
                <ul class="lips-list"></ul>
            </div>
        </div>
        <button class="remove-btn" data-id="${look.id}">🗑️ Remove from Favorites</button>
    `;
    
     // Render color swatches
    const swatchesContainer = card.querySelector('.color-swatches');
    look.palette.forEach(hex => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hex;
        swatch.title = hex;
        swatchesContainer.appendChild(swatch);
    });

     // Render products
    const faceList = card.querySelector('.face-list');
    const eyesList = card.querySelector('.eyes-list');
    const lipsList = card.querySelector('.lips-list');
    
    renderProductList(faceList, look.products.face);
    renderProductList(eyesList, look.products.eyes);
    renderProductList(lipsList, look.products.lips);
     