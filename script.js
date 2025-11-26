/**
 * PHOTO CLICKER EVOLUTION
 * Czysty JS (Vanilla) - Brak frameworków
 */

// === KONFIGURACJA DANYCH (ITEMS) ===
const UPGRADES_DATA = [
    { id: 'click_1', name: 'Mocniejszy Palec', type: 'click', value: 1, basePrice: 50, icon: '👆', desc: '+1 punkt/klik' },
    { id: 'auto_1', name: 'Auto-Kliker', type: 'auto', value: 2, basePrice: 150, icon: '⚙️', desc: '+2 pkt/sek' },
    { id: 'click_2', name: 'Młot Pneumatyczny', type: 'click', value: 5, basePrice: 500, icon: '🔨', desc: '+5 punktów/klik' },
    { id: 'auto_2', name: 'Bot Farma', type: 'auto', value: 10, basePrice: 1200, icon: '🤖', desc: '+10 pkt/sek' },
    { id: 'multi_1', name: 'Złoty Mnożnik', type: 'multiplier', value: 1.2, basePrice: 5000, icon: '🌟', desc: 'Mnożnik x1.2' }
];

const PETS_DATA = [
    { id: 'pet_cat', name: 'Cyber Kot', bonus: 5, price: 1000, icon: '🐱', animation: 'bounce' },
    { id: 'pet_dog', name: 'Space Dog', bonus: 15, price: 3000, icon: '🐶', animation: 'spin' },
    { id: 'pet_dragon', name: 'Neon Dragon', bonus: 50, price: 10000, icon: '🐲', animation: 'pulse' }
];

const SKINS_DATA = [
    { id: 'skin-cyberpunk', name: 'Cyberpunk', price: 0, styleClass: 'skin-cyberpunk' },
    { id: 'skin-forest', name: 'Magiczny Las', price: 2000, styleClass: 'skin-forest' },
    { id: 'skin-candy', name: 'Cukierkowy Świat', price: 5000, styleClass: 'skin-candy' }
];

// === STAN GRY (GAME STATE) ===
let gameState = {
    score: 0,
    clickValue: 1,
    autoClickPerSecond: 0,
    multiplier: 1,
    image: null, // Base64 obrazka
    upgrades: {}, // { id: poziom }
    pets: [],     // [id, id]
    skins: ['skin-cyberpunk'],
    activeSkin: 'skin-cyberpunk',
    lastSave: Date.now()
};

// === ELEMENTY DOM ===
const ui = {
    score: document.getElementById('score-display'),
    mps: document.getElementById('mps'),
    clicker: document.getElementById('clicker-circle'),
    clickerImg: document.getElementById('clicker-image'),
    fileInput: document.getElementById('image-upload'),
    petsContainer: document.getElementById('pets-container'),
    shopLists: {
        upgrades: document.getElementById('upgrades-list'),
        pets: document.getElementById('pets-list'),
        skins: document.getElementById('skins-list')
    },
    particles: document.getElementById('particles-container')
};

// === INICJALIZACJA ===
function init() {
    loadGame();
    setupEventListeners();
    renderShop();
    renderPets();
    applySkin(gameState.activeSkin);
    
    // Pętla gry (Auto-Click) - co 1 sekunda
    setInterval(() => {
        if (gameState.autoClickPerSecond > 0) {
            addScore(gameState.autoClickPerSecond, false); // False = bez efektów kliknięcia
        }
        updateTitle();
    }, 1000);

    // Pętla zapisu - co 5 sekund
    setInterval(saveGame, 5000);
    
    // Pętla renderowania (60fps dla płynności UI)
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    ui.score.innerText = Math.floor(gameState.score).toLocaleString();
    ui.mps.innerText = (gameState.autoClickPerSecond * gameState.multiplier).toFixed(1);
    requestAnimationFrame(gameLoop);
}

// === LOGIKA GRY ===

// Dodawanie punktów
function addScore(amount, visual = true, x = 0, y = 0) {
    const finalAmount = amount * gameState.multiplier;
    gameState.score += finalAmount;
    
    if (visual) {
        // Animacja tekstu +1
        createFloatingText(finalAmount, x, y);
        // Animacja powiększenia licznika
        ui.score.style.transform = "scale(1.2)";
        setTimeout(() => ui.score.style.transform = "scale(1)", 100);
    }
}

// Obsługa kliknięcia (Główna mechanika)
function handleClick(e) {
    const rect = ui.clicker.getBoundingClientRect();
    
    // Oblicz środek kliknięcia dla efektów (obsługa touch i mouse)
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    addScore(gameState.clickValue, true, clientX, clientY);
    
    // Efekt wizualny (Shake)
    ui.clicker.classList.remove('shake');
    void ui.clicker.offsetWidth; // Trigger reflow
    ui.clicker.classList.add('shake');
    
    // Efekt cząsteczkowy
    spawnParticles(clientX, clientY);
}

// === EFEKTY WIZUALNE ===

function createFloatingText(amount, x, y) {
    const el = document.createElement('div');
    el.classList.add('floating-text');
    el.innerText = `+${Math.floor(amount)}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    
    setTimeout(() => el.remove(), 1000);
}

function spawnParticles(x, y) {
    const count = 8;
    for(let i=0; i<count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 10 + 5;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        
        // Losowy ruch
        const destX = (Math.random() - 0.5) * 200;
        const destY = (Math.random() - 0.5) * 200;
        
        p.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800,
            easing: 'ease-out'
        });
        
        ui.particles.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
}

// === SKLEP I ZAKUPY ===

function getUpgradePrice(item) {
    const level = gameState.upgrades[item.id] || 0;
    return Math.floor(item.basePrice * Math.pow(1.5, level));
}

function renderShop() {
    // Render Ulepszeń
    ui.shopLists.upgrades.innerHTML = '';
    UPGRADES_DATA.forEach(item => {
        const level = gameState.upgrades[item.id] || 0;
        const price = getUpgradePrice(item);
        
        const el = document.createElement('div');
        el.className = 'shop-item';
        el.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <h4>${item.name} (Lvl ${level})</h4>
                <p>${item.desc}</p>
            </div>
            <button class="buy-btn" onclick="buyUpgrade('${item.id}')">${price} pkt</button>
        `;
        ui.shopLists.upgrades.appendChild(el);
    });

    // Render Zwierzątek
    ui.shopLists.pets.innerHTML = '';
    PETS_DATA.forEach(pet => {
        const owned = gameState.pets.includes(pet.id);
        const el = document.createElement('div');
        el.className = `shop-item ${owned ? 'disabled' : ''}`;
        el.innerHTML = `
            <div class="item-icon">${pet.icon}</div>
            <div class="item-info">
                <h4>${pet.name}</h4>
                <p>+${pet.bonus} pkt/sek</p>
            </div>
            <button class="buy-btn" onclick="buyPet('${pet.id}')">${owned ? 'Kupione' : pet.price + ' pkt'}</button>
        `;
        ui.shopLists.pets.appendChild(el);
    });

    // Render Skinów
    ui.shopLists.skins.innerHTML = '';
    SKINS_DATA.forEach(skin => {
        const owned = gameState.skins.includes(skin.id);
        const active = gameState.activeSkin === skin.id;
        
        const el = document.createElement('div');
        el.className = `skin-card ${active ? 'active-skin' : ''}`;
        el.innerHTML = `
            <h4>${skin.name}</h4>
            <p>${owned ? (active ? 'AKTYWNY' : 'Kliknij by użyć') : skin.price + ' pkt'}</p>
        `;
        el.onclick = () => handleSkinClick(skin);
        ui.shopLists.skins.appendChild(el);
    });
}

// Funkcje globalne (dostępne dla onclick w HTML)
window.buyUpgrade = (id) => {
    const item = UPGRADES_DATA.find(u => u.id === id);
    const price = getUpgradePrice(item);
    
    if (gameState.score >= price) {
        gameState.score -= price;
        gameState.upgrades[id] = (gameState.upgrades[id] || 0) + 1;
        
        // Aplikuj efekt
        if (item.type === 'click') gameState.clickValue += item.value;
        if (item.type === 'auto') gameState.autoClickPerSecond += item.value;
        if (item.type === 'multiplier') gameState.multiplier *= item.value;
        
        renderShop();
        saveGame();
    } else {
        alert("Za mało punktów!");
    }
};

window.buyPet = (id) => {
    if (gameState.pets.includes(id)) return;
    const pet = PETS_DATA.find(p => p.id === id);
    
    if (gameState.score >= pet.price) {
        gameState.score -= pet.price;
        gameState.pets.push(id);
        gameState.autoClickPerSecond += pet.bonus;
        
        renderPets();
        renderShop();
        saveGame();
    } else {
        alert("Za mało punktów!");
    }
};

window.handleSkinClick = (skin) => {
    // Jeśli już posiadamy skin - aktywuj
    if (gameState.skins.includes(skin.id)) {
        gameState.activeSkin = skin.id;
        applySkin(skin.styleClass);
    } else {
        // Kupowanie skina
        if (gameState.score >= skin.price) {
            gameState.score -= skin.price;
            gameState.skins.push(skin.id);
            gameState.activeSkin = skin.id;
            applySkin(skin.styleClass);
        } else {
            alert("Za mało punktów na ten skin!");
        }
    }
    renderShop();
    saveGame();
};

// === PETS SYSTEM (RENDEROWANIE NA SCENIE) ===
function renderPets() {
    ui.petsContainer.innerHTML = '';
    const petsCount = gameState.pets.length;
    if (petsCount === 0) return;

    // Rozmieść zwierzątka po okręgu
    const radius = 140; // Odległość od środka
    const step = (2 * Math.PI) / petsCount;

    gameState.pets.forEach((petId, index) => {
        const petData = PETS_DATA.find(p => p.id === petId);
        const el = document.createElement('div');
        el.className = 'pet';
        el.innerText = petData.icon;
        
        // Matematyka do pozycji na okręgu
        const angle = step * index;
        const x = Math.cos(angle) * radius; // względem środka
        const y = Math.sin(angle) * radius;
        
        // Ustawiamy styl. Środek kontenera to 50%, 50%
        el.style.left = `calc(50% + ${x}px - 25px)`; // -25px to połowa szerokości peta
        el.style.top = `calc(50% + ${y}px - 25px)`;
        
        ui.petsContainer.appendChild(el);
    });
}

// === ZARZĄDZANIE DANYMI ===

function saveGame() {
    localStorage.setItem('clickerEvolutionSave', JSON.stringify(gameState));
}

function loadGame() {
    const save = localStorage.getItem('clickerEvolutionSave');
    if (save) {
        const parsed = JSON.parse(save);
        // Łączenie (merge) obiektów w razie aktualizacji gry
        gameState = { ...gameState, ...parsed };
        
        // Przywróć zdjęcie
        if (gameState.image) {
            ui.clickerImg.src = gameState.image;
        }
    }
}

function resetGame() {
    if(confirm("Czy na pewno chcesz zresetować grę? Stracisz wszystko!")) {
        localStorage.removeItem('clickerEvolutionSave');
        location.reload();
    }
}

function applySkin(className) {
    document.body.className = className;
}

function updateTitle() {
    document.title = `(${Math.floor(gameState.score)}) Photo Clicker`;
}

// === EVENT LISTENERS ===

function setupEventListeners() {
    // Klikanie
    ui.clicker.addEventListener('mousedown', handleClick);
    // Obsługa dotyku (mobile)
    ui.clicker.addEventListener('touchstart', (e) => {
        e.preventDefault(); // zapobiega podwójnemu kliknięciu
        handleClick(e);
    });

    // Upload zdjęcia
    ui.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const base64 = readerEvent.target.result;
                // Sprawdź rozmiar (localStorage ma limity, ok. 5MB)
                if (base64.length > 3000000) {
                    alert("Zdjęcie jest za duże! Spróbuj mniejszego pliku.");
                    return;
                }
                gameState.image = base64;
                ui.clickerImg.src = base64;
                saveGame();
            };
            reader.readAsDataURL(file);
        }
    });

    // Zakładki (Tabs)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Update
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('reset-btn').addEventListener('click', resetGame);
}

// Start gry po załadowaniu DOM
document.addEventListener('DOMContentLoaded', init);
