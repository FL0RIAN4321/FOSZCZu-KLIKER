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
    { id: 'pet_cat', name: 'Cyber Kot', bonus: 5, price: 1000, icon: '🐱', dlc: false },
    { id: 'pet_dog', name: 'Space Dog', bonus: 15, price: 3000, icon: '🐶', dlc: false },
    { id: 'pet_dragon', name: 'Neon Dragon', bonus: 50, price: 10000, icon: '🐲', dlc: false },
    
    // ZWIERZĄTKA DLC
    { id: 'pet_robot', name: 'Kwadratowy Robot', bonus: 100, price: 50000, icon: '🤖', dlc: true },
    { id: 'pet_ghost', name: 'Eteryczny Duch', bonus: 200, price: 150000, icon: '👻', dlc: true },
    { id: 'pet_wizard', name: 'Klikający Mag', bonus: 400, price: 300000, icon: '🧙‍♂️', dlc: true },
    { id: 'pet_phoenix', name: 'Feniks Światła', bonus: 800, price: 500000, icon: '🔥', dlc: true }
];

const SKINS_DATA = [
    { id: 'skin-cyberpunk', name: 'Cyberpunk', price: 0, styleClass: 'skin-cyberpunk' },
    { id: 'skin-forest', name: 'Magiczny Las', price: 2000, styleClass: 'skin-forest' },
    { id: 'skin-candy', name: 'Cukierkowy Świat', price: 5000, styleClass: 'skin-candy' }
];

// DANE DLC
const DLC_DATA = {
    id: 'dlc_foszcz',
    name: 'FOSZCZ DLC',
    price: 100000,
    desc: 'Odblokowuje 4 nowe zwierzątka i specjalne dynamiczne tła!'
};

// === STAN GRY (GAME STATE) ===
let gameState = {
    score: 0,
    clickValue: 1,
    autoClickPerSecond: 0,
    multiplier: 1,
    image: null, 
    upgrades: {}, 
    pets: [],     
    skins: ['skin-cyberpunk'],
    activeSkin: 'skin-cyberpunk',
    hasDLC: false, 
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
    panel: document.querySelector('.game-panel'), 
    panelHandle: document.getElementById('panel-handle'),
    shopLists: {
        upgrades: document.getElementById('upgrades-list'),
        pets: document.getElementById('pets-list'),
        skins: document.getElementById('skins-list'),
        dlc: document.getElementById('dlc-content')
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
    
    ui.panel.classList.remove('collapsed'); 
    
    // Pętla gry (Auto-Click) - co 1 sekunda
    setInterval(() => {
        if (gameState.autoClickPerSecond > 0) {
            addScore(gameState.autoClickPerSecond, false); 
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

function addScore(amount, visual = true, x = 0, y = 0) {
    const finalAmount = amount * gameState.multiplier;
    gameState.score += finalAmount;
    
    if (visual) {
        createFloatingText(finalAmount, x, y);
        ui.score.style.transform = "scale(1.2)";
        setTimeout(() => ui.score.style.transform = "scale(1)", 100);
    }
}

function handleClick(e) {
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    addScore(gameState.clickValue, true, clientX, clientY);
    
    ui.clicker.classList.remove('shake');
    void ui.clicker.offsetWidth; 
    ui.clicker.classList.add('shake');
    
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
    // 1. Render Ulepszeń
    ui.shopLists.upgrades.innerHTML = '';
    UPGRADES_DATA.forEach(item => {
        const level = gameState.upgrades[item.id] || 0;
        const price = getUpgradePrice(item);
        
        const el = document.createElement('div');
        el.className = 'shop-item';
        el.setAttribute('onclick', `buyUpgrade('${item.id}')`);
        
        el.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <h4>${item.name} (Lvl ${level})</h4>
                <p>${item.desc}</p>
            </div>
            <button class="buy-btn">${price} pkt</button>
        `;
        ui.shopLists.upgrades.appendChild(el);
    });

    // 2. Render Zwierzątek
    ui.shopLists.pets.innerHTML = '';
    PETS_DATA.forEach(pet => {
        const owned = gameState.pets.includes(pet.id);
        const price = pet.price;
        
        // Blokada DLC
        if (pet.dlc && !gameState.hasDLC) {
            const el = document.createElement('div');
            el.className = 'shop-item disabled';
            el.innerHTML = `<div class="item-icon">🔒</div>
                            <div class="item-info"><h4>${pet.name} (Wymaga DLC)</h4><p>Potężny bonus po zakupie FOSZCZ DLC</p></div>
                            <button class="buy-btn disabled">Zablokowane</button>`;
            ui.shopLists.pets.appendChild(el);
            return;
        }

        const el = document.createElement('div');
        el.className = `shop-item ${owned ? 'disabled' : ''}`;
        
        if (!owned) {
            el.setAttribute('onclick', `buyPet('${pet.id}')`);
        }
        
        el.innerHTML = `
            <div class="item-icon">${pet.icon}</div>
            <div class="item-info">
                <h4>${pet.name}</h4>
                <p>+${pet.bonus} pkt/sek</p>
            </div>
            <button class="buy-btn">${owned ? 'Kupione' : price + ' pkt'}</button>
        `;
        ui.shopLists.pets.appendChild(el);
    });

    // 3. Render Skinów
    ui.shopLists.skins.innerHTML = '';
    SKINS_DATA.forEach(skin => {
        const owned = gameState.skins.includes(skin.id);
        const active = gameState.activeSkin === skin.id;
        
        const el = document.createElement('div');
        el.className = `skin-card ${active ? 'active-skin' : ''}`;
        el.onclick = () => handleSkinClick(skin);
        
        el.innerHTML = `
            <h4>${skin.name}</h4>
            <p>${owned ? (active ? 'AKTYWNY' : 'Kliknij by użyć') : skin.price + ' pkt'}</p>
        `;
        ui.shopLists.skins.appendChild(el);
    });
    
    // 4. Render DLC Tab
    ui.shopLists.dlc.innerHTML = renderDLCTab();
}

// Funkcje globalne
window.buyUpgrade = (id) => {
    const item = UPGRADES_DATA.find(u => u.id === id);
    const price = getUpgradePrice(item);
    
    if (gameState.score >= price) {
        gameState.score -= price;
        gameState.upgrades[id] = (gameState.upgrades[id] || 0) + 1;
        
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
    
    if (pet.dlc && !gameState.hasDLC) {
        alert("To zwierzątko wymaga zakupu FOSZCZ DLC!");
        return;
    }

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
    if (gameState.skins.includes(skin.id)) {
        gameState.activeSkin = skin.id;
        applySkin(skin.styleClass);
    } else {
        if (gameState.score >= skin.price) {
            gameState.score -= skin.price;
            gameState.skins.push(skin.id);
            gameState.activeSkin = skin.id;
            applySkin(skin.styleClass);
        } else {
            alert("Za mało punktów na ten skin!");
            return;
        }
    }
    renderShop();
    saveGame();
};

window.buyDLC = (id) => {
    const dlc = DLC_DATA;
    if (gameState.hasDLC) return;

    if (gameState.score >= dlc.price) {
        gameState.score -= dlc.price;
        gameState.hasDLC = true;
        
        alert(`Gratulacje! Zakupiono ${dlc.name}. Odkryto nową zawartość!`);
        
        applySkin(gameState.activeSkin); 
        renderShop();
        saveGame();
    } else {
        alert("Za mało punktów na to DLC!");
    }
};

function renderDLCTab() {
    const dlc = DLC_DATA;
    if (gameState.hasDLC) {
        return `
            <div class="dlc-purchased">
                <i class="fa-solid fa-trophy"></i>
                <h2>${dlc.name} - AKTYWOWANE</h2>
                <p>Odkryłeś nową zawartość w sekcjach Zwierzątka i Wygląd! Dziękujemy za wsparcie!</p>
            </div>
        `;
    }
    
    return `
        <div class="shop-item dlc-card" onclick="buyDLC('${dlc.id}')">
            <div class="item-icon"><i class="fa-solid fa-crown"></i></div>
            <div class="item-info">
                <h4>${dlc.name}</h4>
                <p>${dlc.desc}</p>
            </div>
            <button class="buy-btn">${dlc.price} pkt</button>
        </div>
    `;
}

// === ZINTEGROWANY SYSTEM SKINÓW (UI + BG + DLC) ===
function applySkin(className) {
    document.body.classList.remove('skin-cyberpunk', 'skin-forest', 'skin-candy', 'dlc-active-effect');
    document.body.classList.add(className);
    
    gameState.activeSkin = className;
    
    const particlesContainer = ui.particles;
    if (gameState.hasDLC) {
        document.body.classList.add('dlc-active-effect'); 
        
        // Generowanie cząsteczek tła (tylko raz, jeśli jest DLC)
        if (particlesContainer.children.length === 0) {
            for (let i = 0; i < 50; i++) {
                const p = document.createElement('div');
                p.className = 'bg-particle-dot';
                p.style.left = `${Math.random() * 100}%`;
                p.style.top = `${Math.random() * 100}%`;
                p.style.animationDelay = `${Math.random() * 10}s`;
                particlesContainer.appendChild(p);
            }
        }
    } else if (particlesContainer) {
        // Usuwanie cząsteczek tła, jeśli DLC zostało zresetowane
        particlesContainer.innerHTML = '';
    }
}

// === PANEL COLLAPSE LOGIC ===
function handlePanelToggle() {
    ui.panel.classList.toggle('collapsed');
}

// === PETS SYSTEM (RENDEROWANIE NA SCENIE) ===
function renderPets() {
    ui.petsContainer.innerHTML = '';
    const petsCount = gameState.pets.length;
    if (petsCount === 0) return;

    const radius = 140; 
    const step = (2 * Math.PI) / petsCount;

    gameState.pets.forEach((petId, index) => {
        const petData = PETS_DATA.find(p => p.id === petId);
        const el = document.createElement('div');
        el.className = 'pet';
        el.innerText = petData.icon;
        
        const angle = step * index;
        const x = Math.cos(angle) * radius; 
        const y = Math.sin(angle) * radius;
        
        // Pozycjonowanie względem centrum pets-ring
        el.style.left = `calc(50% + ${x}px - 25px)`; 
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
        gameState = { ...gameState, ...parsed };
        
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

function updateTitle() {
    document.title = `(${Math.floor(gameState.score)}) Photo Clicker`;
}

// === EVENT LISTENERS ===

function setupEventListeners() {
    // Klikanie
    ui.clicker.addEventListener('mousedown', handleClick);
    ui.clicker.addEventListener('touchstart', (e) => {
        e.preventDefault(); 
        handleClick(e);
    });

    // Panel Collapse/Expand
    ui.panelHandle.addEventListener('click', handlePanelToggle);

    // Upload zdjęcia
    ui.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                const base64 = readerEvent.target.result;
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
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('reset-btn').addEventListener('click', resetGame);
}

document.addEventListener('DOMContentLoaded', init);
