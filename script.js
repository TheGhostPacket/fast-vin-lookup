// Enhanced VIN Decoder Pro - JavaScript with PDF Generation & Recalls

// Global variables
let shownVins = new Set();
const MAX_CACHE_SIZE = 1000;
let currentVINData = null;
let currentRecalls = null;

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

// Get comprehensive VIN data
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
            plantCity: getValue('Plant City'),
            plantState: getValue('Plant State'),
            vehicleType: getValue('Vehicle Type'),
            bodyClass: getValue('Body Class'),
            series: getValue('Series'),
            trim: getValue('Trim'),
            doors: getValue('Doors'),
        },

        // Engine & Performance
        engine: {
            engineCylinders: getValue('Engine Number of Cylinders'),
            displacement: getValue('Displacement (L)'),
            displacementCI: getValue('Displacement (CI)'),
            engineModel: getValue('Engine Model'),
            enginePower: getValue('Engine Power (kW)'),
            fuelTypePrimary: getValue('Fuel Type - Primary'),
            fuelTypeSecondary: getValue('Fuel Type - Secondary'),
            fuelInjectionType: getValue('Fuel Injection Type'),
            engineConfiguration: getValue('Engine Configuration'),
            turbo: getValue('Turbo'),
        },

        // Transmission & Drivetrain
        drivetrain: {
            transmissionStyle: getValue('Transmission Style'),
            transmissionSpeeds: getValue('Transmission Speeds'),
            driveType: getValue('Drive Type'),
        },

        // Dimensions & Capacity
        dimensions: {
            wheelbase: getValue('Wheelbase (inches)'),
            overallLength: getValue('Overall Length (inches)'),
            overallWidth: getValue('Overall Width (inches)'),
            overallHeight: getValue('Overall Height (inches)'),
            trackWidth: getValue('Track Width (inches)'),
            curbWeight: getValue('Curb Weight (pounds)'),
            gvwr: getValue('Gross Vehicle Weight Rating'),
            bedLength: getValue('Bed Length (inches)'),
        },

        // Fuel Capacity
        fuel: {
            fuelCapacityGallons: getValue('Fuel Tank Capacity (gallons)'),
            fuelCapacityLiters: getValue('Fuel Tank Capacity (liters)'),
        },

        // Safety Features
        safety: {
            airBagLocFront: getValue('Air Bag Loc Front'),
            airBagLocSide: getValue('Air Bag Loc Side'),
            airBagLocCurtain: getValue('Air Bag Loc Curtain'),
            airBagLocKnee: getValue('Air Bag Loc Knee'),
            seatBeltsAll: getValue('Seat Belts All'),
            pretensioner: getValue('Pretensioner'),
            seatBeltType: getValue('Seat Belt Type'),
            abs: getValue('ABS'),
            esc: getValue('Electronic Stability Control (ESC)'),
            tractionControl: getValue('Traction Control'),
            tpms: getValue('TPMS'),
            daytimeRunningLight: getValue('Daytime Running Light'),
            keylessIgnition: getValue('Keyless Ignition'),
            ncapBodyType: getValue('NCAP Body Type'),
            ncapMake: getValue('NCAP Make'),
            ncapModel: getValue('NCAP Model'),
        },

        // Equipment & Features
        equipment: {
            entertainmentSystem: getValue('Entertainment System'),
            steeringLocation: getValue('Steering Location'),
            seats: getValue('Seats'),
            windows: getValue('Windows'),
            wheels: getValue('Wheels'),
            wheelSizeFront: getValue('Wheel Size Front (inches)'),
            wheelSizeRear: getValue('Wheel Size Rear (inches)'),
            tireSize: getValue('Tire Size'),
        },

        // Validation
        validation: {
            errorCode: getValue('Error Code'),
            errorText: getValue('Error Text'),
            possibleValues: getValue('Possible Values'),
        }
    };
}

// Detect if VIN is real
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
    if (data.basic.bodyClass !== 'N/A') realIndicators++;
    if (data.validation.errorCode === '0') realIndicators++;
    
    return realIndicators >= 5;
}

// Estimate fuel capacity
function getFuelCapacity(data) {
    if (data.fuel.fuelCapacityGallons !== 'N/A') {
        return data.fuel.fuelCapacityGallons + ' gallons';
    } else if (data.fuel.fuelCapacityLiters !== 'N/A') {
        const liters = parseFloat(data.fuel.fuelCapacityLiters);
        if (!isNaN(liters)) {
            const gallons = (liters / 3.785).toFixed(1);
            return `~${gallons} gallons (${data.fuel.fuelCapacityLiters} L)`;
        }
        return data.fuel.fuelCapacityLiters + ' liters';
    }
    
    // Estimate based on body class
    const bodyClass = data.basic.bodyClass.toLowerCase();
    if (bodyClass.includes('truck') || bodyClass.includes('suv')) return '15-25 gallons (est.)';
    if (bodyClass.includes('compact')) return '10-14 gallons (est.)';
    if (bodyClass.includes('sedan')) return '12-18 gallons (est.)';
    return '12-20 gallons (est.)';
}

// Fetch recalls from NHTSA
async function fetchRecalls(vin) {
    try {
        const response = await fetch(
            `https://api.nhtsa.gov/recalls/recallsByVIN?vin=${vin}`
        );
        
        if (!response.ok) {
            throw new Error('Recall API error');
        }
        
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Recall fetch error:', error);
        return null;
    }
}

// Create comprehensive result display
function displayComprehensiveResults(vin, data, recalls) {
    const isReal = detectRealVIN(data);
    const fuelCapacity = getFuelCapacity(data);
    
    // Store for PDF generation
    currentVINData = { vin, data, recalls, isReal, fuelCapacity };
    
    const statusBadge = isReal 
        ? '<span class="status-badge status-real">✅ REAL VIN - Authentic Vehicle</span>'
        : '<span class="status-badge status-fake">🔸 SYNTHETIC VIN - Test Data</span>';
    
    // Build HTML
    let html = `
        <!-- Result Header -->
        <div class="result-header">
            <div class="result-vin-display">
                <div class="result-vin-info">
                    <h2>VEHICLE IDENTIFICATION NUMBER</h2>
                    <div class="result-vin">${vin}</div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-download-pdf" onclick="downloadPDF()">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 13V17H3V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 13L10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 9L10 13L14 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Download PDF
                    </button>
                    <button class="btn btn-new-search" onclick="newSearch()">
                        🔍 New Search
                    </button>
                </div>
            </div>
            <div class="status-badges">
                ${statusBadge}
            </div>
        </div>

        <!-- Vehicle Summary -->
        <div class="vehicle-summary">
            <h2 class="summary-title">${data.basic.modelYear} ${data.basic.make} ${data.basic.model}</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-icon">🚗</div>
                    <div class="summary-details">
                        <h4>Make</h4>
                        <p>${data.basic.make}</p>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-icon">🚙</div>
                    <div class="summary-details">
                        <h4>Model</h4>
                        <p>${data.basic.model}</p>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-icon">📅</div>
                    <div class="summary-details">
                        <h4>Year</h4>
                        <p>${data.basic.modelYear}</p>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-icon">🏭</div>
                    <div class="summary-details">
                        <h4>Manufacturer</h4>
                        <p>${data.basic.manufacturer}</p>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-icon">⛽</div>
                    <div class="summary-details">
                        <h4>Fuel Capacity</h4>
                        <p>${fuelCapacity}</p>
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-icon">🌍</div>
                    <div class="summary-details">
                        <h4>Origin</h4>
                        <p>${data.basic.plantCountry}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add comprehensive data sections
    html += '<div class="data-sections">';
    
    // Basic Information Section
    html += createDataSection('basic-info', '📋', 'Basic Information', [
        { label: 'Vehicle Type', value: data.basic.vehicleType },
        { label: 'Body Class', value: data.basic.bodyClass },
        { label: 'Series', value: data.basic.series },
        { label: 'Trim', value: data.basic.trim },
        { label: 'Doors', value: data.basic.doors },
        { label: 'Plant City', value: data.basic.plantCity },
        { label: 'Plant State', value: data.basic.plantState },
    ], true);

    // Engine & Performance Section
    html += createDataSection('engine-performance', '🔧', 'Engine & Performance', [
        { label: 'Engine Cylinders', value: data.engine.engineCylinders },
        { label: 'Displacement (L)', value: data.engine.displacement },
        { label: 'Displacement (CI)', value: data.engine.displacementCI },
        { label: 'Engine Model', value: data.engine.engineModel },
        { label: 'Engine Power (kW)', value: data.engine.enginePower },
        { label: 'Fuel Type (Primary)', value: data.engine.fuelTypePrimary },
        { label: 'Fuel Type (Secondary)', value: data.engine.fuelTypeSecondary },
        { label: 'Fuel Injection', value: data.engine.fuelInjectionType },
        { label: 'Engine Configuration', value: data.engine.engineConfiguration },
        { label: 'Turbo', value: data.engine.turbo },
    ]);

    // Transmission & Drivetrain Section
    html += createDataSection('drivetrain', '⚙️', 'Transmission & Drivetrain', [
        { label: 'Transmission Style', value: data.drivetrain.transmissionStyle },
        { label: 'Transmission Speeds', value: data.drivetrain.transmissionSpeeds },
        { label: 'Drive Type', value: data.drivetrain.driveType },
    ]);

    // Dimensions & Weight Section
    html += createDataSection('dimensions', '📏', 'Dimensions & Weight', [
        { label: 'Wheelbase', value: data.dimensions.wheelbase },
        { label: 'Overall Length', value: data.dimensions.overallLength },
        { label: 'Overall Width', value: data.dimensions.overallWidth },
        { label: 'Overall Height', value: data.dimensions.overallHeight },
        { label: 'Track Width', value: data.dimensions.trackWidth },
        { label: 'Curb Weight', value: data.dimensions.curbWeight },
        { label: 'GVWR', value: data.dimensions.gvwr },
        { label: 'Bed Length', value: data.dimensions.bedLength },
    ]);

    // Safety Features Section
    html += createDataSection('safety', '🛡️', 'Safety Features', [
        { label: 'Front Airbags', value: data.safety.airBagLocFront },
        { label: 'Side Airbags', value: data.safety.airBagLocSide },
        { label: 'Curtain Airbags', value: data.safety.airBagLocCurtain },
        { label: 'Knee Airbags', value: data.safety.airBagLocKnee },
        { label: 'Seat Belts', value: data.safety.seatBeltsAll },
        { label: 'Pretensioner', value: data.safety.pretensioner },
        { label: 'ABS', value: data.safety.abs },
        { label: 'ESC', value: data.safety.esc },
        { label: 'Traction Control', value: data.safety.tractionControl },
        { label: 'TPMS', value: data.safety.tpms },
        { label: 'Daytime Running Lights', value: data.safety.daytimeRunningLight },
        { label: 'Keyless Ignition', value: data.safety.keylessIgnition },
    ]);

    // Equipment & Features Section
    html += createDataSection('equipment', '✨', 'Equipment & Features', [
        { label: 'Seats', value: data.equipment.seats },
        { label: 'Windows', value: data.equipment.windows },
        { label: 'Steering Location', value: data.equipment.steeringLocation },
        { label: 'Entertainment System', value: data.equipment.entertainmentSystem },
        { label: 'Wheels', value: data.equipment.wheels },
        { label: 'Wheel Size (Front)', value: data.equipment.wheelSizeFront },
        { label: 'Wheel Size (Rear)', value: data.equipment.wheelSizeRear },
        { label: 'Tire Size', value: data.equipment.tireSize },
    ]);

    html += '</div>';

    // Recalls Section
    html += '<div class="recalls-section">';
    if (recalls && recalls.length > 0) {
        html += `
            <div class="recalls-header">
                <h3>⚠️ Safety Recalls</h3>
                <span class="recall-count">${recalls.length} Active Recall${recalls.length > 1 ? 's' : ''}</span>
            </div>
        `;
        recalls.forEach(recall => {
            html += `
                <div class="recall-item">
                    <div class="recall-title">${recall.Component || 'Safety Recall'}</div>
                    <div class="recall-details">${recall.Summary || recall.Consequence || 'No details available'}</div>
                    <div class="recall-meta">
                        <span>📅 Date: ${recall.ReportReceivedDate || 'N/A'}</span>
                        <span>🔢 Campaign: ${recall.NHTSACampaignNumber || 'N/A'}</span>
                    </div>
                </div>
            `;
        });
    } else if (recalls !== null) {
        html += `
            <div class="recalls-header">
                <h3>✅ Safety Recalls</h3>
                <span class="recall-count safe">No Active Recalls</span>
            </div>
            <div class="recall-item safe">
                <div class="recall-title">No Open Recalls Found</div>
                <div class="recall-details">This vehicle currently has no active safety recalls reported by NHTSA.</div>
            </div>
        `;
    } else {
        html += `
            <div class="recalls-header">
                <h3>🔔 Safety Recalls</h3>
            </div>
            <div class="recall-item">
                <div class="recall-details">Recall information temporarily unavailable. Please check NHTSA.gov directly.</div>
            </div>
        `;
    }
    html += '</div>';

    resultContent.innerHTML = html;
    showResults();
    
    // Add event listeners for expandable sections
    initializeSections();
}

// Create collapsible data section
function createDataSection(id, icon, title, dataItems, openByDefault = false) {
    const filteredItems = dataItems.filter(item => item.value !== 'N/A');
    
    if (filteredItems.length === 0) return '';
    
    let html = `
        <div class="data-section">
            <div class="section-header" onclick="toggleSection('${id}')">
                <h3><span class="section-icon">${icon}</span> ${title}</h3>
                <span class="section-toggle ${openByDefault ? 'rotated' : ''}">▼</span>
            </div>
            <div class="section-content ${openByDefault ? 'active' : ''}" id="${id}">
                <div class="data-grid">
    `;
    
    filteredItems.forEach(item => {
        html += `
            <div class="data-item">
                <div class="data-label">${item.label}</div>
                <div class="data-value">${item.value}</div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// Toggle section visibility
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = section.previousElementSibling;
    const toggle = header.querySelector('.section-toggle');
    
    section.classList.toggle('active');
    toggle.classList.toggle('rotated');
}

// Initialize sections
function initializeSections() {
    // First section open by default
    const firstSection = document.querySelector('.section-content');
    if (firstSection) {
        firstSection.classList.add('active');
    }
}

// PDF Generation using jsPDF
function downloadPDF() {
    if (!currentVINData) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const { vin, data, recalls, isReal, fuelCapacity } = currentVINData;
    
    let yPos = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    
    // Helper to add new page if needed
    function checkNewPage() {
        if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
        }
    }
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('VIN DECODER PRO REPORT', 105, yPos, { align: 'center' });
    yPos += 15;
    
    // VIN
    doc.setFontSize(12);
    doc.text(`VIN: ${vin}`, 20, yPos);
    yPos += 10;
    
    // Status
    doc.setFontSize(10);
    doc.text(`Status: ${isReal ? 'REAL VEHICLE' : 'SYNTHETIC/TEST VIN'}`, 20, yPos);
    yPos += 10;
    
    // Vehicle Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('VEHICLE SUMMARY', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`${data.basic.modelYear} ${data.basic.make} ${data.basic.model}`, 20, yPos);
    yPos += 7;
    doc.text(`Manufacturer: ${data.basic.manufacturer}`, 20, yPos);
    yPos += 7;
    doc.text(`Fuel Capacity: ${fuelCapacity}`, 20, yPos);
    yPos += 7;
    doc.text(`Origin: ${data.basic.plantCountry}`, 20, yPos);
    yPos += 12;
    
    checkNewPage();
    
    // Helper function to add section
    function addSection(title, items) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(title, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        
        items.forEach(item => {
            if (item.value !== 'N/A') {
                checkNewPage();
                doc.text(`${item.label}: ${item.value}`, 25, yPos);
                yPos += 6;
            }
        });
        
        yPos += 5;
        checkNewPage();
    }
    
    // Add all sections
    addSection('BASIC INFORMATION', [
        { label: 'Vehicle Type', value: data.basic.vehicleType },
        { label: 'Body Class', value: data.basic.bodyClass },
        { label: 'Series', value: data.basic.series },
        { label: 'Trim', value: data.basic.trim },
        { label: 'Doors', value: data.basic.doors },
    ]);
    
    addSection('ENGINE & PERFORMANCE', [
        { label: 'Cylinders', value: data.engine.engineCylinders },
        { label: 'Displacement (L)', value: data.engine.displacement },
        { label: 'Fuel Type', value: data.engine.fuelTypePrimary },
        { label: 'Engine Model', value: data.engine.engineModel },
    ]);
    
    addSection('TRANSMISSION & DRIVETRAIN', [
        { label: 'Transmission', value: data.drivetrain.transmissionStyle },
        { label: 'Drive Type', value: data.drivetrain.driveType },
    ]);
    
    addSection('DIMENSIONS & WEIGHT', [
        { label: 'Length', value: data.dimensions.overallLength },
        { label: 'Width', value: data.dimensions.overallWidth },
        { label: 'Height', value: data.dimensions.overallHeight },
        { label: 'Wheelbase', value: data.dimensions.wheelbase },
        { label: 'Weight', value: data.dimensions.curbWeight },
    ]);
    
    // Recalls
    if (recalls && recalls.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`SAFETY RECALLS (${recalls.length})`, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        
        recalls.forEach((recall, index) => {
            checkNewPage();
            doc.text(`${index + 1}. ${recall.Component || 'Safety Recall'}`, 25, yPos);
            yPos += 6;
            if (recall.NHTSACampaignNumber) {
                doc.text(`   Campaign: ${recall.NHTSACampaignNumber}`, 25, yPos);
                yPos += 6;
            }
            yPos += 3;
        });
    }
    
    // Footer
    yPos = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Generated by VIN Decoder Pro - theghostpacket.com', 105, yPos, { align: 'center' });
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 105, yPos + 5, { align: 'center' });
    
    // Save
    doc.save(`VIN-Report-${vin}.pdf`);
}

// New search function
function newSearch() {
    vinInput.value = '';
    vinInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Decode VIN
async function decodeVIN(vin) {
    showLoading('Decoding VIN...');
    
    try {
        // Fetch VIN data
        const response = await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const vinData = await response.json();
        const results = vinData.Results || [];
        const data = getComprehensiveVINData(results);
        
        // Fetch recalls
        showLoading('Checking for recalls...');
        const recalls = await fetchRecalls(vin);
        
        hideLoading();
        displayComprehensiveResults(vin, data, recalls);
        
    } catch (error) {
        hideLoading();
        resultContent.innerHTML = `
            <div class="result-header" style="border-radius: 20px;">
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">❌ Error Decoding VIN</h2>
                    <p>Unable to connect to the NHTSA database. Please check your internet connection and try again.</p>
                    <p style="margin-top: 1rem; font-size: 0.875rem; opacity: 0.8;">Error: ${error.message}</p>
                    <button class="btn btn-new-search" onclick="newSearch()" style="margin-top: 1.5rem;">Try Again</button>
                </div>
            </div>
        `;
        showResults();
    }
}

// Get random VIN
async function getRandomVIN() {
    const maxAttempts = 10;
    let attempts = 0;
    
    showLoading('Generating random VIN...');
    
    while (attempts < maxAttempts) {
        try {
            const vinResponse = await fetch('https://randomvin.com/getvin.php?type=random');
            
            if (!vinResponse.ok) {
                throw new Error('Failed to fetch random VIN');
            }
            
            const randomVin = (await vinResponse.text()).trim().toUpperCase();
            
            if (!isValidVIN(randomVin)) {
                attempts++;
                continue;
            }
            
            if (shownVins.has(randomVin)) {
                attempts++;
                continue;
            }
            
            shownVins.add(randomVin);
            if (shownVins.size > MAX_CACHE_SIZE) {
                const vinsArray = Array.from(shownVins);
                shownVins = new Set(vinsArray.slice(100));
            }
            
            vinInput.value = randomVin;
            await decodeVIN(randomVin);
            return;
            
        } catch (error) {
            console.error('Random VIN Error:', error);
            attempts++;
        }
    }
    
    hideLoading();
    alert('Unable to generate a unique VIN. Please try again.');
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

console.log('%c🚗 VIN Decoder Pro', 'font-size: 20px; font-weight: bold; color: #3B82F6;');
console.log('%cComprehensive Reports • PDF Generation • Recall Integration', 'font-size: 12px; color: #6B7280;');
