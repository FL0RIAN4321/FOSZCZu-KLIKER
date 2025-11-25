// --- ZMIENNE ---
let score = 0;
let pointsPerClick = 1;
let upgradeCost = 10;

// --- POBIERANIE ELEMENTÓW Z HTML ---
const scoreElement = document.getElementById('score');
const imgElement = document.getElementById('click-img');
const costElement = document.getElementById('cost');
const upgradeBtn = document.getElementById('upgrade-btn');

// --- FUNKCJA: KLIKANIE W ZDJĘCIE ---
imgElement.addEventListener('click', () => {
    // Dodaj punkty
    score += pointsPerClick;
    
    // Zaktualizuj wygląd
    updateUI();
});

// --- FUNKCJA: KUPOWANIE ULEPSZENIA ---
upgradeBtn.addEventListener('click', () => {
    if (score >= upgradeCost) {
        // Odejmij koszt
        score -= upgradeCost;
        
        // Zwiększ siłę kliknięcia
        pointsPerClick++;
        
        // Zwiększ cenę następnego ulepszenia
        upgradeCost = Math.round(upgradeCost * 1.5);
        
        // Zaktualizuj wygląd
        updateUI();
    } else {
        alert("Za mało punktów!");
    }
});

// --- FUNKCJA POMOCNICZA: AKTUALIZACJA TEKSTU ---
function updateUI() {
    scoreElement.innerText = score;
    costElement.innerText = upgradeCost;
}

