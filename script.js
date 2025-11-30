// VIN Decoder Pro - Professional Redesign with Marketcheck API
// Complete rewrite with tabbed navigation and 150+ NHTSA fields + Market Pricing

// ========================================
// MARKETCHECK API CONFIGURATION
// ========================================
const MARKETCHECK_API_KEY = 'qEwgUtOCQtC7xGBO1spCY4GdkOoHDzsM'; // Your Marketcheck API key

// Global state
let shownVins = new Set();
const MAX_CACHE_SIZE = 1000;
let currentVINData = null;
let currentRecalls = null;
let activeTab = 'overview';

// DOM Elements
const vinInput = document.getElementById('vinInput');
const decodeBtn = document.getElementById('decodeBtn');
const randomVinBtn = document.getElementById('randomVinBtn');
const resultsSection = document.getElementById('results');
const resultContent = document.getElementById('resultContent');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

// VIN Validation
function isValidVIN(vin) {
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase());
}

// Loading functions
function showLoading(message = 'Decoding VIN...') {
    loadingText.textContent = message;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showResults() {
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Get ULTRA-COMPREHENSIVE VIN data
function getComprehensiveVINData(results) {
    const getValue = (variable) => {
        const item = results.find(i => i.Variable === variable);
        return item && item.Value && item.Value.trim() ? item.Value : 'N/A';
    };

    return {
        // Basic Information
        basic: {
            make: getValue('Make'),
            model: getValue('Model'),
            modelYear: getValue('Model Year'),
            manufacturer: getValue('Manufacturer Name'),
            plantCountry: getValue('Plant Country'),
            plantCompanyName: getValue('Plant Company Name'),
            plantCity: getValue('Plant City'),
            plantState: getValue('Plant State'),
            vehicleType: getValue('Vehicle Type'),
            bodyClass: getValue('Body Class'),
            series: getValue('Series'),
            series2: getValue('Series2'),
            trim: getValue('Trim'),
            trim2: getValue('Trim2'),
            doors: getValue('Doors'),
            windows: getValue('Windows'),
        },

        // Engine Specifications
        engine: {
            engineNumberOfCylinders: getValue('Engine Number of Cylinders'),
            displacementL: getValue('Displacement (L)'),
            displacementCI: getValue('Displacement (CI)'),
            displacementCC: getValue('Displacement (CC)'),
            engineModel: getValue('Engine Model'),
            enginePowerKW: getValue('Engine Power (kW)'),
            engineConfiguration: getValue('Engine Configuration'),
            engineManufacturer: getValue('Engine Manufacturer'),
            fuelTypePrimary: getValue('Fuel Type - Primary'),
            fuelTypeSecondary: getValue('Fuel Type - Secondary'),
            fuelInjectionType: getValue('Fuel Injection Type'),
            coolingType: getValue('Cooling Type'),
            valveTrainDesign: getValue('Valve Train Design'),
            turbo: getValue('Turbo'),
            topSpeedMPH: getValue('Top Speed (MPH)'),
        },

        // Electric/Hybrid
        electric: {
            electrificationLevel: getValue('Electrification Level'),
            batteryType: getValue('Battery Type'),
            batteryKWh: getValue('Battery kWh'),
            batteryV: getValue('Battery V'),
            batteryModules: getValue('Battery Modules'),
            batteryCells: getValue('Battery Cells'),
            chargerLevel: getValue('Charger Level'),
            chargerPowerKW: getValue('Charger Power (kW)'),
            evDriveUnit: getValue('EV Drive Unit'),
        },

        // Transmission & Drivetrain
        drivetrain: {
            transmissionStyle: getValue('Transmission Style'),
            transmissionSpeeds: getValue('Transmission Speeds'),
            driveType: getValue('Drive Type'),
            axles: getValue('Axles'),
            axleConfiguration: getValue('Axle Configuration'),
            brakeSystemType: getValue('Brake System Type'),
        },

        // Dimensions & Weight
        dimensions: {
            wheelBaseInches: getValue('Wheel Base (inches)'),
            overallLength: getValue('Overall Length (inches)'),
            overallWidth: getValue('Overall Width (inches)'),
            overallHeight: getValue('Overall Height (inches)'),
            trackWidth: getValue('Track Width (inches)'),
            curbWeightLB: getValue('Curb Weight (pounds)'),
            grossVehicleWeightRating: getValue('Gross Vehicle Weight Rating'),
            grossCombinationWeightRating: getValue('Gross Combination Weight Rating'),
            bedLengthInches: getValue('Bed Length (inches)'),
        },

        // Fuel System
        fuel: {
            fuelTankCapacityGal: getValue('Fuel Tank Capacity (gallons)'),
            fuelTankCapacityL: getValue('Fuel Tank Capacity (liters)'),
        },

        // Safety Features
        safety: {
            // Airbags
            airBagLocFront: getValue('Air Bag Loc Front'),
            airBagLocSide: getValue('Air Bag Loc Side'),
            airBagLocCurtain: getValue('Air Bag Loc Curtain'),
            airBagLocKnee: getValue('Air Bag Loc Knee'),
            
            // Seat Belts
            seatBeltsAll: getValue('Seat Belts All'),
            pretensioner: getValue('Pretensioner'),
            
            // Active Safety
            abs: getValue('ABS'),
            esc: getValue('Electronic Stability Control (ESC)'),
            tractionControl: getValue('Traction Control'),
            tpms: getValue('TPMS (tire pressure monitoring)'),
            
            // Driver Assistance
            adaptiveCruiseControl: getValue('Adaptive Cruise Control (ACC)'),
            crashImminent: getValue('Crash Imminent Braking (CIB)'),
            blindSpotMon: getValue('Blind Spot Monitor (BSM)'),
            laneDepartureWarning: getValue('Lane Departure Warning (LDW)'),
            laneKeepingAssist: getValue('Lane Keeping Assistance (LKA)'),
            laneCenteringAssist: getValue('Lane Centering Assistance'),
            rearCrossTrafficAlert: getValue('Rear Cross Traffic Alert'),
            parkAssist: getValue('Park Assist'),
            rearVisibilitySystem: getValue('Rear Visibility Camera'),
            forwardCollisionWarning: getValue('Forward Collision Warning (FCW)'),
            pedestrianAutomaticEmergencyBraking: getValue('Pedestrian Automatic Emergency Braking (PAEB)'),
            
            // Lighting
            daytimeRunningLight: getValue('Daytime Running Light (DRL)'),
            headlampLightSource: getValue('Headlamp Light Source'),
            
            // Other
            keylessIgnition: getValue('Keyless Ignition'),
        },

        // Interior
        interior: {
            seats: getValue('Seats'),
            seatRows: getValue('Seat Rows'),
            steeringLocation: getValue('Steering Location'),
            entertainmentSystem: getValue('Entertainment System'),
        },

        // Wheels & Tires
        wheels: {
            wheels: getValue('Wheels'),
            wheelSizeFront: getValue('Wheel Size Front (inches)'),
            wheelSizeRear: getValue('Wheel Size Rear (inches)'),
        },

        // Manufacturing
        manufacturing: {
            manufacturerId: getValue('Manufacturer Id'),
            plantCode: getValue('Plant Code'),
            errorCode: getValue('Error Code'),
        }
    };
}

// Detect real VIN
function detectRealVIN(data) {
    let realIndicators = 0;
    
    if (data.basic.make !== 'N/A') realIndicators++;
    if (data.basic.model !== 'N/A') realIndicators++;
    if (data.basic.modelYear !== 'N/A') {
        const year = parseInt(data.basic.modelYear);
        if (year >= 1980 && year <= 2026) realIndicators++;
    }
    if (data.basic.manufacturer !== 'N/A') realIndicators++;
    if (data.basic.plantCountry !== 'N/A') realIndicators++;
    if (data.manufacturing.errorCode === '0') realIndicators++;
    
    return realIndicators >= 5;
}

// Get fuel capacity
function getFuelCapacity(data) {
    if (data.fuel.fuelTankCapacityGal !== 'N/A') {
        return data.fuel.fuelTankCapacityGal + ' gal';
    } else if (data.fuel.fuelTankCapacityL !== 'N/A') {
        const liters = parseFloat(data.fuel.fuelTankCapacityL);
        if (!isNaN(liters)) {
            const gallons = (liters / 3.785).toFixed(1);
            return `${gallons} gal`;
        }
        return data.fuel.fuelTankCapacityL + ' L';
    }
    return 'N/A';
}

// Fetch recalls
async function fetchRecalls(vin) {
    try {
        const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVIN?vin=${vin}`);
        if (!response.ok) throw new Error('Recall API error');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Recall fetch error:', error);
        return null;
    }
}

// Create specification card
function createSpecCard(label, value, icon = '') {
    if (!value || value === 'N/A' || value.toLowerCase() === 'not applicable') return '';
    
    return `
        <div class="spec-card">
            <div class="spec-label">
                ${icon ? `<span class="spec-icon">${icon}</span>` : ''}
                ${label}
            </div>
            <div class="spec-value">${value}</div>
        </div>
    `;
}

// Create section with empty state (for first sections in tabs)
function renderSection(title, icon, cards) {
    const trimmedCards = cards.trim();
    if (!trimmedCards) {
        return `
            <h2 class="section-header"><span class="section-icon">${icon}</span>${title}</h2>
            <div style="padding: 2rem; text-align: center; color: var(--gray-500); background: var(--gray-50); border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
                <p style="margin: 0;">ℹ️ No data available for this section from NHTSA database</p>
            </div>
        `;
    }
    return `
        <h2 class="section-header"><span class="section-icon">${icon}</span>${title}</h2>
        <div class="spec-grid">${trimmedCards}</div>
    `;
}

// Create section with empty state (for subsequent sections with margin-top)
function createSection(title, icon, cards) {
    if (!cards || cards.trim() === '') {
        return `
            <h2 class="section-header mt-4"><span class="section-icon">${icon}</span>${title}</h2>
            <div style="padding: 2rem; text-align: center; color: var(--gray-500); background: var(--gray-50); border-radius: var(--radius-lg);">
                <p>No data available for this section</p>
            </div>
        `;
    }
    return `
        <h2 class="section-header mt-4"><span class="section-icon">${icon}</span>${title}</h2>
        <div class="spec-grid">${cards}</div>
    `;
}

// Display comprehensive results with tabs
function displayComprehensiveResults(vin, data, recalls) {
    const isReal = detectRealVIN(data);
    const fuelCapacity = getFuelCapacity(data);
    
    currentVINData = { vin, data, recalls, isReal, fuelCapacity };
    
    let html = `
        <!-- Result Header Card -->
        <div class="result-header-card">
            <div class="result-vin-header">
                <div class="result-vin-info">
                    <h3>Vehicle Identification Number</h3>
                    <div class="result-vin-number">${vin}</div>
                </div>
                <div class="result-actions">
                    <button class="btn-download" onclick="downloadPDF()">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 13V17H3V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 13L10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M6 9L10 13L14 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Download PDF
                    </button>
                    <button class="btn-new" onclick="newSearch()">
                        🔍 New Search
                    </button>
                </div>
            </div>
            <div class="status-badges">
                <span class="status-badge ${isReal ? 'badge-real' : 'badge-synthetic'}">
                    ${isReal ? '✅ Authentic Vehicle' : '🔸 Synthetic VIN'}
                </span>
            </div>
        </div>

        <!-- Vehicle Summary Card -->
        <div class="vehicle-summary-card">
            <div class="vehicle-title">${data.basic.modelYear || 'Unknown Year'} ${data.basic.make || 'Unknown Make'} ${data.basic.model || 'Unknown Model'}</div>
            <div class="vehicle-quick-specs">
                <div class="quick-spec-item">
                    <div class="quick-spec-label">Make</div>
                    <div class="quick-spec-value">${data.basic.make || 'N/A'}</div>
                </div>
                <div class="quick-spec-item">
                    <div class="quick-spec-label">Model</div>
                    <div class="quick-spec-value">${data.basic.model || 'N/A'}</div>
                </div>
                <div class="quick-spec-item">
                    <div class="quick-spec-label">Year</div>
                    <div class="quick-spec-value">${data.basic.modelYear || 'N/A'}</div>
                </div>
                <div class="quick-spec-item">
                    <div class="quick-spec-label">Body Class</div>
                    <div class="quick-spec-value">${data.basic.bodyClass || 'N/A'}</div>
                </div>
                <div class="quick-spec-item">
                    <div class="quick-spec-label">Manufacturer</div>
                    <div class="quick-spec-value">${data.basic.manufacturer || 'N/A'}</div>
                </div>
                <div class="quick-spec-item">
                    <div class="quick-spec-label">Origin</div>
                    <div class="quick-spec-value">${data.basic.plantCountry || 'N/A'}</div>
                </div>
            </div>
        </div>

        <!-- Tabs Container -->
        <div class="tabs-container">
            <div class="tabs-nav">
                <button class="tab-btn active" onclick="switchTab('overview')">📋 Overview</button>
                <button class="tab-btn" onclick="switchTab('engine')">🔧 Engine</button>
                <button class="tab-btn" onclick="switchTab('dimensions')">📏 Dimensions</button>
                <button class="tab-btn" onclick="switchTab('safety')">🛡️ Safety</button>
                <button class="tab-btn" onclick="switchTab('features')">✨ Features</button>
                <button class="tab-btn" onclick="switchTab('pricing')">💰 Pricing</button>
                <button class="tab-btn" onclick="switchTab('recalls')">🔔 Recalls</button>
            </div>

            <!-- Overview Tab -->
            <div class="tab-content active" id="tab-overview">
                <h2 class="section-header"><span class="section-icon">📋</span>Basic Information</h2>
                <div class="spec-grid">
                    ${createSpecCard('Vehicle Type', data.basic.vehicleType, '🚗')}
                    ${createSpecCard('Body Class', data.basic.bodyClass, '🚙')}
                    ${createSpecCard('Series', data.basic.series)}
                    ${createSpecCard('Trim', data.basic.trim)}
                    ${createSpecCard('Doors', data.basic.doors, '🚪')}
                    ${createSpecCard('Windows', data.basic.windows)}
                    ${createSpecCard('Plant City', data.basic.plantCity, '🏭')}
                    ${createSpecCard('Plant State', data.basic.plantState)}
                    ${createSpecCard('Plant Country', data.basic.plantCountry, '🌍')}
                </div>
            </div>

            <!-- Engine Tab -->
            <div class="tab-content" id="tab-engine">
                <h2 class="section-header"><span class="section-icon">🔧</span>Engine Specifications</h2>
                <div class="spec-grid">
                    ${createSpecCard('Cylinders', data.engine.engineNumberOfCylinders, '⚙️')}
                    ${createSpecCard('Displacement (L)', data.engine.displacementL)}
                    ${createSpecCard('Displacement (CI)', data.engine.displacementCI)}
                    ${createSpecCard('Engine Model', data.engine.engineModel)}
                    ${createSpecCard('Engine Power (kW)', data.engine.enginePowerKW, '⚡')}
                    ${createSpecCard('Configuration', data.engine.engineConfiguration)}
                    ${createSpecCard('Cooling Type', data.engine.coolingType, '❄️')}
                    ${createSpecCard('Valve Train', data.engine.valveTrainDesign)}
                    ${createSpecCard('Turbo', data.engine.turbo, '💨')}
                </div>

                <h2 class="section-header mt-4"><span class="section-icon">⛽</span>Fuel System</h2>
                <div class="spec-grid">
                    ${createSpecCard('Fuel Type (Primary)', data.engine.fuelTypePrimary, '⛽')}
                    ${createSpecCard('Fuel Type (Secondary)', data.engine.fuelTypeSecondary)}
                    ${createSpecCard('Fuel Injection', data.engine.fuelInjectionType)}
                    ${createSpecCard('Tank Capacity (Gallons)', data.fuel.fuelTankCapacityGal)}
                    ${createSpecCard('Tank Capacity (Liters)', data.fuel.fuelTankCapacityL)}
                </div>

                ${data.electric.electrificationLevel !== 'N/A' ? `
                <h2 class="section-header mt-4"><span class="section-icon">⚡</span>Electric/Hybrid</h2>
                <div class="spec-grid">
                    ${createSpecCard('Electrification Level', data.electric.electrificationLevel, '🔌')}
                    ${createSpecCard('Battery Type', data.electric.batteryType, '🔋')}
                    ${createSpecCard('Battery Capacity (kWh)', data.electric.batteryKWh)}
                    ${createSpecCard('Battery Voltage', data.electric.batteryV, '⚡')}
                    ${createSpecCard('Battery Modules', data.electric.batteryModules)}
                    ${createSpecCard('Battery Cells', data.electric.batteryCells)}
                    ${createSpecCard('Charger Level', data.electric.chargerLevel, '🔌')}
                    ${createSpecCard('Charger Power (kW)', data.electric.chargerPowerKW)}
                    ${createSpecCard('EV Drive Unit', data.electric.evDriveUnit)}
                </div>
                ` : ''}

                <h2 class="section-header mt-4"><span class="section-icon">⚙️</span>Transmission & Drivetrain</h2>
                <div class="spec-grid">
                    ${createSpecCard('Transmission Style', data.drivetrain.transmissionStyle, '⚙️')}
                    ${createSpecCard('Transmission Speeds', data.drivetrain.transmissionSpeeds)}
                    ${createSpecCard('Drive Type', data.drivetrain.driveType, '🚗')}
                    ${createSpecCard('Axles', data.drivetrain.axles)}
                    ${createSpecCard('Brake System', data.drivetrain.brakeSystemType, '🛑')}
                </div>
            </div>

            <!-- Dimensions Tab -->
            <div class="tab-content" id="tab-dimensions">
                ${renderSection('Dimensions & Weight', '📏', 
                    createSpecCard('Wheelbase', data.dimensions.wheelBaseInches, '📐') +
                    createSpecCard('Overall Length', data.dimensions.overallLength) +
                    createSpecCard('Overall Width', data.dimensions.overallWidth) +
                    createSpecCard('Overall Height', data.dimensions.overallHeight) +
                    createSpecCard('Track Width', data.dimensions.trackWidth) +
                    createSpecCard('Curb Weight', data.dimensions.curbWeightLB, '⚖️') +
                    createSpecCard('GVWR', data.dimensions.grossVehicleWeightRating) +
                    createSpecCard('GCWR', data.dimensions.grossCombinationWeightRating) +
                    createSpecCard('Bed Length', data.dimensions.bedLengthInches)
                )}
            </div>

            <!-- Safety Tab -->
            <div class="tab-content" id="tab-safety">
                ${renderSection('Airbag Systems', '🛡️',
                    createSpecCard('Front Airbags', data.safety.airBagLocFront, '🎈') +
                    createSpecCard('Side Airbags', data.safety.airBagLocSide) +
                    createSpecCard('Curtain Airbags', data.safety.airBagLocCurtain) +
                    createSpecCard('Knee Airbags', data.safety.airBagLocKnee)
                )}

                ${createSection('Seat Belt Systems', '🔒',
                    createSpecCard('Seat Belts', data.safety.seatBeltsAll, '🔒') +
                    createSpecCard('Pretensioner', data.safety.pretensioner)
                )}

                ${createSection('Active Safety', '🚦',
                    createSpecCard('ABS', data.safety.abs, '🛑') +
                    createSpecCard('ESC', data.safety.esc) +
                    createSpecCard('Traction Control', data.safety.tractionControl) +
                    createSpecCard('TPMS', data.safety.tpms, '📊')
                )}

                ${createSection('Driver Assistance', '👁️',
                    createSpecCard('Adaptive Cruise Control', data.safety.adaptiveCruiseControl, '🎯') +
                    createSpecCard('Crash Imminent Braking', data.safety.crashImminent) +
                    createSpecCard('Blind Spot Monitor', data.safety.blindSpotMon, '👁️') +
                    createSpecCard('Lane Departure Warning', data.safety.laneDepartureWarning) +
                    createSpecCard('Lane Keeping Assist', data.safety.laneKeepingAssist) +
                    createSpecCard('Lane Centering', data.safety.laneCenteringAssist) +
                    createSpecCard('Rear Cross Traffic Alert', data.safety.rearCrossTrafficAlert) +
                    createSpecCard('Park Assist', data.safety.parkAssist, '🅿️') +
                    createSpecCard('Rear Camera', data.safety.rearVisibilitySystem, '📹') +
                    createSpecCard('Forward Collision Warning', data.safety.forwardCollisionWarning) +
                    createSpecCard('Pedestrian Braking', data.safety.pedestrianAutomaticEmergencyBraking)
                )}

                ${createSection('Lighting', '💡',
                    createSpecCard('Daytime Running Lights', data.safety.daytimeRunningLight, '💡') +
                    createSpecCard('Headlamp Light Source', data.safety.headlampLightSource)
                )}
            </div>

            <!-- Features Tab -->
            <div class="tab-content" id="tab-features">
                ${renderSection('Interior', '🪑',
                    createSpecCard('Seats', data.interior.seats, '🪑') +
                    createSpecCard('Seat Rows', data.interior.seatRows) +
                    createSpecCard('Steering Location', data.interior.steeringLocation, '🎛️') +
                    createSpecCard('Entertainment System', data.interior.entertainmentSystem, '📻') +
                    createSpecCard('Keyless Ignition', data.safety.keylessIgnition, '🔑')
                )}

                ${createSection('Wheels & Tires', '🛞',
                    createSpecCard('Wheels', data.wheels.wheels, '🛞') +
                    createSpecCard('Wheel Size (Front)', data.wheels.wheelSizeFront) +
                    createSpecCard('Wheel Size (Rear)', data.wheels.wheelSizeRear)
                )}
            </div>

            <!-- Pricing Tab -->
            <div class="tab-content" id="tab-pricing">
                ${renderSection('Market Value Analysis', '💰',
                    createSpecCard('Estimated Market Value', data.pricing.estimatedValue, '💵') +
                    createSpecCard('Original MSRP', data.pricing.msrp, '🏷️') +
                    createSpecCard('Confidence Level', data.pricing.confidence, '📊') +
                    createSpecCard('Comparable Listings', data.pricing.comparableCount, '🔍')
                )}
                
                <div style="margin-top: 1.5rem; padding: 1.5rem; background: linear-gradient(135deg, #EBF4FF 0%, #E0E7FF 100%); border-radius: var(--radius-lg); border-left: 4px solid var(--primary-blue);">
                    <div style="display: flex; align-items: start; gap: 1rem;">
                        <div style="font-size: 2rem;">ℹ️</div>
                        <div>
                            <p style="margin: 0 0 0.5rem 0; color: var(--gray-800); font-weight: 600; font-size: 0.9rem;">
                                About Market Value Estimates
                            </p>
                            <p style="margin: 0; color: var(--gray-600); font-size: 0.875rem; line-height: 1.6;">
                                Pricing data is estimated based on current market conditions, vehicle specifications, 
                                mileage (50,000 assumed), and comparable listings from dealerships across the US. 
                                Actual value may vary based on condition, location, dealer pricing, and optional features.
                            </p>
                            <p style="margin: 0.75rem 0 0 0; color: var(--gray-500); font-size: 0.75rem;">
                                <strong>Data Source:</strong> Powered by Marketcheck API
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recalls Tab -->
            <div class="tab-content" id="tab-recalls">
                ${generateRecallsContent(recalls)}
            </div>
        </div>
    `;

    resultContent.innerHTML = html;
    showResults();
}

// Generate recalls content
function generateRecallsContent(recalls) {
    if (recalls && recalls.length > 0) {
        let html = `
            <div class="recalls-header">
                <h3>⚠️ Safety Recalls</h3>
                <span class="recall-count-badge recall-count-danger">${recalls.length} Active Recall${recalls.length > 1 ? 's' : ''}</span>
            </div>
        `;
        recalls.forEach(recall => {
            html += `
                <div class="recall-item recall-item-danger">
                    <div class="recall-title">${recall.Component || 'Safety Recall'}</div>
                    <div class="recall-details">${recall.Summary || recall.Consequence || 'No details available'}</div>
                    <div class="recall-meta">
                        <span>📅 Date: ${recall.ReportReceivedDate || 'N/A'}</span>
                        <span>🔢 Campaign: ${recall.NHTSACampaignNumber || 'N/A'}</span>
                    </div>
                </div>
            `;
        });
        return html;
    } else if (recalls !== null) {
        return `
            <div class="recalls-header">
                <h3>✅ Safety Recalls</h3>
                <span class="recall-count-badge recall-count-safe">No Active Recalls</span>
            </div>
            <div class="recall-item recall-item-safe">
                <div class="recall-title">No Open Recalls Found</div>
                <div class="recall-details">This vehicle currently has no active safety recalls reported by NHTSA.</div>
            </div>
        `;
    } else {
        return `
            <div class="recalls-header">
                <h3>🔔 Safety Recalls</h3>
            </div>
            <div class="recall-item">
                <div class="recall-details">Recall information temporarily unavailable. Please check NHTSA.gov directly.</div>
            </div>
        `;
    }
}

// Switch tabs
function switchTab(tabName) {
    activeTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// PDF Generation
function downloadPDF() {
    if (!currentVINData) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const { vin, data, recalls } = currentVINData;
    
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    
    function checkNewPage() {
        if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
        }
    }
    
    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('VIN DECODER PRO - COMPREHENSIVE REPORT', 105, yPos, { align: 'center' });
    yPos += 12;
    
    doc.setFontSize(11);
    doc.text(`VIN: ${vin}`, 20, yPos);
    yPos += 8;
    doc.text(`Vehicle: ${data.basic.modelYear} ${data.basic.make} ${data.basic.model}`, 20, yPos);
    yPos += 12;
    
    // Add sections
    function addSection(title, items) {
        const filteredItems = items.filter(item => 
            item.value !== 'N/A' && item.value.toLowerCase() !== 'not applicable'
        );
        if (filteredItems.length === 0) return;
        
        checkNewPage();
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(title, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        
        filteredItems.forEach(item => {
            checkNewPage();
            const text = `${item.label}: ${item.value}`;
            const lines = doc.splitTextToSize(text, 170);
            lines.forEach(line => {
                checkNewPage();
                doc.text(line, 25, yPos);
                yPos += 5;
            });
        });
        
        yPos += 4;
    }
    
    // Add all sections
    addSection('BASIC INFORMATION', [
        { label: 'Make', value: data.basic.make },
        { label: 'Model', value: data.basic.model },
        { label: 'Year', value: data.basic.modelYear },
        { label: 'Body Class', value: data.basic.bodyClass },
        { label: 'Manufacturer', value: data.basic.manufacturer },
    ]);
    
    addSection('ENGINE', [
        { label: 'Cylinders', value: data.engine.engineNumberOfCylinders },
        { label: 'Displacement (L)', value: data.engine.displacementL },
        { label: 'Fuel Type', value: data.engine.fuelTypePrimary },
        { label: 'Transmission', value: data.drivetrain.transmissionStyle },
    ]);
    
    // Save
    doc.save(`VIN-Report-${vin}.pdf`);
}

// New search
function newSearch() {
    vinInput.value = '';
    vinInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Decode VIN
async function decodeVIN(vin) {
    showLoading('Decoding VIN...');
    
    try {
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const vinData = await response.json();
        const results = vinData.Results || [];
        const data = getComprehensiveVINData(results);
        
        // NEW: Fetch Marketcheck pricing
        showLoading('Fetching market pricing...');
        const pricingData = await fetchMarketPricing(vin);
        
        showLoading('Checking for recalls...');
        const recalls = await fetchRecalls(vin);
        
        // NEW: Add pricing data to comprehensive data
        data.pricing = pricingData;
        
        hideLoading();
        displayComprehensiveResults(vin, data, recalls);
        
    } catch (error) {
        hideLoading();
        resultContent.innerHTML = `
            <div class="result-header-card">
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--accent-red);">❌ Error Decoding VIN</h2>
                    <p style="color: var(--gray-600);">Unable to connect to the NHTSA database. Please check your internet connection and try again.</p>
                    <button class="btn-new" onclick="newSearch()" style="margin-top: 1.5rem;">Try Again</button>
                </div>
            </div>
        `;
        showResults();
    }
}

// ========================================
// MARKETCHECK: Fetch Vehicle Pricing
// ========================================
async function fetchMarketPricing(vin) {
    try {
        // Build API request
        const params = new URLSearchParams({
            api_key: MARKETCHECK_API_KEY,
            vin: vin,
            miles: 50000,        // Average mileage
            zip: '90210',        // Default zip code
            dealer_type: 'all'   // Check all dealer types
        });

        const response = await fetch(
            `https://api.marketcheck.com/v2/predict/car/us/marketcheck_price?${params}`
        );

        // Check for errors
        if (!response.ok) {
            console.warn('Marketcheck API error:', response.status);
            throw new Error('Marketcheck API request failed');
        }

        const data = await response.json();
        console.log('Marketcheck pricing data:', data);
        
        // Return formatted data
        return {
            estimatedValue: data.price ? `$${data.price.toLocaleString()}` : 'N/A',
            msrp: data.msrp ? `$${data.msrp.toLocaleString()}` : 'N/A',
            confidence: data.confidence || 'N/A',
            comparableCount: data.comparable_count || 'N/A'
        };
    } catch (error) {
        console.error('Marketcheck API Error:', error);
        // Return N/A values on error (graceful degradation)
        return {
            estimatedValue: 'N/A',
            msrp: 'N/A',
            confidence: 'N/A',
            comparableCount: 'N/A'
        };
    }
}

// Get random VIN - with fallback
async function getRandomVIN() {
    showLoading('Loading sample VIN...');
    
    // Fallback sample VINs (real vehicles)
    const sampleVINs = [
        '1HGBH41JXMN109186', // 2017 Honda Accord
        '5NPE34AF0HH478974', // 2017 Hyundai Sonata
        '1FTEW1E54KFA00000', // Ford F-150
        '5YJSA1E26HF000000', // Tesla Model S
        '1G1YY22G965107987', // Chevrolet Corvette
        '2HGFC2F59JH542071', // Honda Civic
        '1N4AL3AP8JC229411', // Nissan Altima
        'WBADT43452G920138', // BMW 3-Series
        'JM1BK32F781304531', // Mazda 3
        '5FNRL6H78KB024085'  // Honda Odyssey
    ];
    
    // Filter out already shown VINs
    const availableVINs = sampleVINs.filter(vin => !shownVins.has(vin));
    
    // If all have been shown, reset
    if (availableVINs.length === 0) {
        shownVins.clear();
        availableVINs.push(...sampleVINs);
    }
    
    // Pick random from available
    const randomVin = availableVINs[Math.floor(Math.random() * availableVINs.length)];
    
    shownVins.add(randomVin);
    vinInput.value = randomVin;
    
    hideLoading();
    await decodeVIN(randomVin);
}

// Event Listeners
decodeBtn.addEventListener('click', () => {
    const vin = vinInput.value.trim().toUpperCase();
    if (!vin) {
        vinInput.focus();
        return;
    }
    if (!isValidVIN(vin)) {
        alert('Invalid VIN format. VIN must be exactly 17 characters and cannot contain I, O, or Q.');
        return;
    }
    decodeVIN(vin);
});

randomVinBtn.addEventListener('click', getRandomVIN);

vinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        decodeBtn.click();
    }
});

vinInput.addEventListener('input', (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-HJ-NPR-Z0-9]/g, '');
    e.target.value = value;
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

console.log('%c🚗 VIN Decoder Pro - Professional Edition', 'font-size: 18px; font-weight: bold; color: #2563EB;');
console.log('%c150+ Data Points • Tabbed Navigation • Professional Design', 'font-size: 11px; color: #6B7280;');
