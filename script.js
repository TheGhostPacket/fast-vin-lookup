// VIN Decoder JavaScript

// Cache for shown VINs to prevent duplicates
let shownVins = new Set();
const MAX_CACHE_SIZE = 1000;

// DOM Elements
const vinInput = document.getElementById('vinInput');
const decodeBtn = document.getElementById('decodeBtn');
const randomVinBtn = document.getElementById('randomVinBtn');
const resultsSection = document.getElementById('results');
const resultContent = document.getElementById('resultContent');
const loadingOverlay = document.getElementById('loadingOverlay');

// VIN Validation
function isValidVIN(vin) {
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase());
}

// Show/Hide Loading
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Show Results Section
function showResults() {
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Format VIN data from API
function getDetailedVINInfo(results) {
    const info = {};
    
    const getValue = (variable) => {
        const item = results.find(i => i.Variable === variable);
        return item && item.Value ? item.Value : 'N/A';
    };
    
    // Basic info
    info.make = getValue('Make');
    info.model = getValue('Model');
    info.year = getValue('Model Year');
    info.bodyClass = getValue('Body Class');
    info.vehicleType = getValue('Vehicle Type');
    info.fuelType = getValue('Fuel Type - Primary');
    info.engineCylinders = getValue('Engine Number of Cylinders');
    info.transmission = getValue('Transmission Style');
    info.driveType = getValue('Drive Type');
    info.manufacturer = getValue('Manufacturer Name');
    info.plantCountry = getValue('Plant Country');
    info.displacement = getValue('Displacement (L)');
    info.displacementCI = getValue('Displacement (CI)');
    
    // Fuel capacity
    const fuelFields = [
        'Fuel Tank Capacity (gallons)',
        'Fuel Tank Capacity',
        'Tank Capacity'
    ];
    
    info.fuelCapacity = 'N/A';
    for (const field of fuelFields) {
        const value = getValue(field);
        if (value !== 'N/A' && value.trim()) {
            info.fuelCapacity = value;
            break;
        }
    }
    
    // Fuel capacity in liters
    const fuelFieldsLiters = [
        'Fuel Tank Capacity (liters)',
        'Fuel Tank Capacity (L)'
    ];
    
    info.fuelCapacityLiters = 'N/A';
    for (const field of fuelFieldsLiters) {
        const value = getValue(field);
        if (value !== 'N/A' && value.trim()) {
            info.fuelCapacityLiters = value;
            break;
        }
    }
    
    // Validation
    info.errorCode = getValue('Error Code');
    info.errorText = getValue('Error Text');
    
    return info;
}

// Detect if VIN is real or fake
function detectRealVIN(info) {
    let realIndicators = 0;
    let totalChecks = 0;
    
    // Check 1: Has meaningful make
    if (info.make !== 'N/A' && info.make.trim()) realIndicators++;
    totalChecks++;
    
    // Check 2: Has model
    if (info.model !== 'N/A' && info.model.trim()) realIndicators++;
    totalChecks++;
    
    // Check 3: Valid year
    if (info.year !== 'N/A' && info.year.trim()) {
        const year = parseInt(info.year);
        if (year >= 1980 && year <= 2025) realIndicators++;
    }
    totalChecks++;
    
    // Check 4: Has manufacturer
    if (info.manufacturer !== 'N/A' && info.manufacturer.trim()) realIndicators++;
    totalChecks++;
    
    // Check 5: Has plant country
    if (info.plantCountry !== 'N/A' && info.plantCountry.trim()) realIndicators++;
    totalChecks++;
    
    // Check 6: Has body class or vehicle type
    if ((info.bodyClass !== 'N/A' && info.bodyClass.trim()) || 
        (info.vehicleType !== 'N/A' && info.vehicleType.trim())) {
        realIndicators++;
    }
    totalChecks++;
    
    // Check 7: Valid error code
    if (info.errorCode === '0' || info.errorCode.includes('clean')) realIndicators++;
    totalChecks++;
    
    return realIndicators >= 5;
}

// Estimate fuel capacity based on vehicle type
function estimateFuelCapacity(info) {
    if (info.bodyClass === 'N/A') return '12-20 gallons (estimated)';
    
    const bodyType = info.bodyClass.toLowerCase();
    
    if (bodyType.includes('truck') || bodyType.includes('suv')) {
        return '15-25 gallons (estimated)';
    } else if (bodyType.includes('compact') || bodyType.includes('subcompact')) {
        return '10-14 gallons (estimated)';
    } else if (bodyType.includes('sedan')) {
        return '12-18 gallons (estimated)';
    }
    
    return '12-20 gallons (estimated)';
}

// Get fuel capacity display
function getFuelCapacityDisplay(info) {
    if (info.fuelCapacity !== 'N/A' && info.fuelCapacity.trim()) {
        return `${info.fuelCapacity} gallons`;
    } else if (info.fuelCapacityLiters !== 'N/A' && info.fuelCapacityLiters.trim()) {
        const liters = parseFloat(info.fuelCapacityLiters);
        if (!isNaN(liters)) {
            const gallons = (liters / 3.785).toFixed(1);
            return `~${gallons} gallons (${info.fuelCapacityLiters} L)`;
        }
        return `${info.fuelCapacityLiters} liters`;
    }
    
    return estimateFuelCapacity(info);
}

// Create result display
function displayResults(vin, info, isRandom = false) {
    const isReal = detectRealVIN(info);
    
    let statusBadge, statusClass;
    if (info.errorCode === '0' || info.errorCode.includes('clean')) {
        if (isReal) {
            statusBadge = '<span class="status-badge status-real">✅ REAL VIN - Authentic Vehicle</span>';
            statusClass = 'real';
        } else {
            statusBadge = '<span class="status-badge status-fake">🔸 FAKE VIN - Synthetic/Test VIN</span>';
            statusClass = 'fake';
        }
    } else {
        statusBadge = '<span class="status-badge status-invalid">❌ INVALID VIN</span>';
        statusClass = 'invalid';
    }
    
    const fuelCapacity = getFuelCapacityDisplay(info);
    
    const html = `
        <div class="result-card">
            <div class="result-header">
                <div>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">
                        ${isRandom ? '🎲 Random VIN' : '🔍 VIN Analysis'}
                    </p>
                    <div class="result-vin">${vin}</div>
                </div>
                ${statusBadge}
            </div>
            
            ${info.make !== 'N/A' ? `
                <div class="result-grid">
                    <div class="result-item">
                        <div class="result-icon">🚗</div>
                        <div class="result-details">
                            <h4>Make</h4>
                            <p>${info.make}</p>
                        </div>
                    </div>
                    
                    <div class="result-item">
                        <div class="result-icon">🚙</div>
                        <div class="result-details">
                            <h4>Model</h4>
                            <p>${info.model}</p>
                        </div>
                    </div>
                    
                    <div class="result-item">
                        <div class="result-icon">📅</div>
                        <div class="result-details">
                            <h4>Year</h4>
                            <p>${info.year}</p>
                        </div>
                    </div>
                    
                    ${info.manufacturer !== 'N/A' ? `
                        <div class="result-item">
                            <div class="result-icon">🏭</div>
                            <div class="result-details">
                                <h4>Manufacturer</h4>
                                <p>${info.manufacturer}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="result-item">
                        <div class="result-icon">⛽</div>
                        <div class="result-details">
                            <h4>Fuel Capacity</h4>
                            <p>${fuelCapacity}</p>
                        </div>
                    </div>
                    
                    ${info.plantCountry !== 'N/A' ? `
                        <div class="result-item">
                            <div class="result-icon">🌍</div>
                            <div class="result-details">
                                <h4>Origin</h4>
                                <p>${info.plantCountry}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${info.bodyClass !== 'N/A' ? `
                        <div class="result-item">
                            <div class="result-icon">🚘</div>
                            <div class="result-details">
                                <h4>Body Class</h4>
                                <p>${info.bodyClass}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${info.fuelType !== 'N/A' ? `
                        <div class="result-item">
                            <div class="result-icon">⛽</div>
                            <div class="result-details">
                                <h4>Fuel Type</h4>
                                <p>${info.fuelType}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${info.engineCylinders !== 'N/A' ? `
                        <div class="result-item">
                            <div class="result-icon">🔧</div>
                            <div class="result-details">
                                <h4>Engine Cylinders</h4>
                                <p>${info.engineCylinders}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${info.transmission !== 'N/A' ? `
                        <div class="result-item">
                            <div class="result-icon">⚙️</div>
                            <div class="result-details">
                                <h4>Transmission</h4>
                                <p>${info.transmission}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${info.driveType !== 'N/A' ? `
                        <div class="result-item">
                            <div class="result-icon">🛣️</div>
                            <div class="result-details">
                                <h4>Drive Type</h4>
                                <p>${info.driveType}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="report-section" style="text-align: center;">
                    <button class="btn btn-secondary" onclick="decodeAnotherVIN()">
                        🔍 Decode Another VIN
                    </button>
                </div>
            ` : `
                <div class="error-message">
                    <h3>⚠️ No Data Available</h3>
                    <p>${info.errorText || 'Unable to decode this VIN. Please verify the VIN and try again.'}</p>
                </div>
            `}
        </div>
    `;
    
    resultContent.innerHTML = html;
    showResults();
}

// Decode VIN function
async function decodeVIN(vin) {
    showLoading();
    
    try {
        const response = await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const results = data.Results || [];
        const info = getDetailedVINInfo(results);
        
        hideLoading();
        displayResults(vin, info, false);
        
    } catch (error) {
        hideLoading();
        resultContent.innerHTML = `
            <div class="result-card">
                <div class="error-message">
                    <h3>❌ Error Decoding VIN</h3>
                    <p>Unable to connect to the NHTSA database. Please check your internet connection and try again.</p>
                    <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.8;">Error: ${error.message}</p>
                </div>
            </div>
        `;
        showResults();
        console.error('VIN Decode Error:', error);
    }
}

// Get random VIN
async function getRandomVIN() {
    const maxAttempts = 10;
    let attempts = 0;
    
    showLoading();
    
    while (attempts < maxAttempts) {
        try {
            // Fetch random VIN
            const vinResponse = await fetch('https://randomvin.com/getvin.php?type=random');
            
            if (!vinResponse.ok) {
                throw new Error('Failed to fetch random VIN');
            }
            
            const randomVin = (await vinResponse.text()).trim().toUpperCase();
            
            // Validate VIN
            if (!isValidVIN(randomVin)) {
                attempts++;
                continue;
            }
            
            // Check if already shown
            if (shownVins.has(randomVin)) {
                attempts++;
                console.log(`Skipping duplicate VIN: ${randomVin}`);
                continue;
            }
            
            // Add to cache
            shownVins.add(randomVin);
            if (shownVins.size > MAX_CACHE_SIZE) {
                const vinsArray = Array.from(shownVins);
                shownVins = new Set(vinsArray.slice(100));
            }
            
            // Decode the VIN
            const response = await fetch(
                `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${randomVin}?format=json`
            );
            
            if (!response.ok) {
                attempts++;
                continue;
            }
            
            const data = await response.json();
            const results = data.Results || [];
            const info = getDetailedVINInfo(results);
            
            hideLoading();
            displayResults(randomVin, info, true);
            return;
            
        } catch (error) {
            console.error('Random VIN Error:', error);
            attempts++;
        }
    }
    
    // Failed after all attempts
    hideLoading();
    resultContent.innerHTML = `
        <div class="result-card">
            <div class="error-message">
                <h3>❌ Unable to Generate Random VIN</h3>
                <p>Could not generate a unique VIN after multiple attempts. Please try again.</p>
            </div>
        </div>
    `;
    showResults();
}

// Decode another VIN (scroll to input)
function decodeAnotherVIN() {
    vinInput.value = '';
    vinInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Event Listeners
decodeBtn.addEventListener('click', () => {
    const vin = vinInput.value.trim().toUpperCase();
    
    if (!vin) {
        vinInput.classList.add('error');
        vinInput.placeholder = 'Please enter a VIN';
        setTimeout(() => {
            vinInput.classList.remove('error');
            vinInput.placeholder = 'Enter 17-character VIN (e.g., 1HGBH41JXMN109186)';
        }, 2000);
        return;
    }
    
    if (!isValidVIN(vin)) {
        vinInput.classList.add('error');
        resultContent.innerHTML = `
            <div class="result-card">
                <div class="error-message">
                    <h3>❌ Invalid VIN Format</h3>
                    <p>VIN must be exactly 17 characters and cannot contain I, O, or Q.</p>
                    <p style="margin-top: 0.5rem;">Please check your VIN and try again.</p>
                </div>
            </div>
        `;
        showResults();
        setTimeout(() => vinInput.classList.remove('error'), 2000);
        return;
    }
    
    vinInput.classList.remove('error');
    vinInput.classList.add('success');
    setTimeout(() => vinInput.classList.remove('success'), 1000);
    
    decodeVIN(vin);
});

randomVinBtn.addEventListener('click', getRandomVIN);

// Allow Enter key to submit
vinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        decodeBtn.click();
    }
});

// Auto-format VIN input (uppercase, no invalid characters)
vinInput.addEventListener('input', (e) => {
    let value = e.target.value.toUpperCase();
    // Remove invalid characters (I, O, Q and non-alphanumeric)
    value = value.replace(/[^A-HJ-NPR-Z0-9]/g, '');
    e.target.value = value;
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Console welcome message
console.log('%c🚗 VIN Decoder', 'font-size: 20px; font-weight: bold; color: #3B82F6;');
console.log('%cBuilt by Packet Whisperer | theghostpacket.com', 'font-size: 12px; color: #6B7280;');
console.log('%cPowered by NHTSA Official Database', 'font-size: 12px; color: #6B7280;');
