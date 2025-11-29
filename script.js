// ULTRA-COMPREHENSIVE VIN Decoder Pro - ALL NHTSA Fields
// Shows 150+ data points from NHTSA API

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

// Get ULTRA-COMPREHENSIVE VIN data - ALL NHTSA FIELDS
function getUltraComprehensiveVINData(results) {
    const getValue = (variable) => {
        const item = results.find(i => i.Variable === variable);
        return item && item.Value && item.Value.trim() ? item.Value : 'N/A';
    };

    return {
        // 1. BASIC VEHICLE INFORMATION
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
            vehicleDescriptor: getValue('Vehicle Descriptor'),
        },

        // 2. ENGINE SPECIFICATIONS
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
            engineHP: getValue('Engine HP'),
            engineHPFrom: getValue('Engine HP From'),
            engineHPTo: getValue('Engine HP To'),
            engineKW: getValue('Engine kW'),
            coolingType: getValue('Cooling Type'),
            engineCycles: getValue('Engine Cycles'),
            valveTrainDesign: getValue('Valve Train Design'),
            turbo: getValue('Turbo'),
            topSpeedMPH: getValue('Top Speed (MPH)'),
            engineBrake: getValue('Engine Brake (hp) From'),
        },

        // 3. ELECTRIC/HYBRID VEHICLE DATA
        electric: {
            electrificationLevel: getValue('Electrification Level'),
            batteryType: getValue('Battery Type'),
            batteryInfo: getValue('Battery Info'),
            batteryA: getValue('Battery A'),
            batteryATo: getValue('Battery A (to)'),
            batteryV: getValue('Battery V'),
            batteryVTo: getValue('Battery V (to)'),
            batteryKWh: getValue('Battery kWh'),
            batteryKWhTo: getValue('Battery kWh (to)'),
            batteryModules: getValue('Battery Modules'),
            batteryCells: getValue('Battery Cells'),
            batteryPacks: getValue('Battery Packs'),
            chargerLevel: getValue('Charger Level'),
            chargerPowerKW: getValue('Charger Power (kW)'),
            evDriveUnit: getValue('EV Drive Unit'),
            otherEngineInfo: getValue('Other Engine Info'),
        },

        // 4. TRANSMISSION & DRIVETRAIN
        drivetrain: {
            transmissionStyle: getValue('Transmission Style'),
            transmissionSpeeds: getValue('Transmission Speeds'),
            driveType: getValue('Drive Type'),
            axles: getValue('Axles'),
            axleConfiguration: getValue('Axle Configuration'),
            brakeSystemType: getValue('Brake System Type'),
            brakeSystemDesc: getValue('Brake System Desc'),
        },

        // 5. DIMENSIONS & WEIGHT
        dimensions: {
            wheelBaseType: getValue('Wheel Base Type'),
            wheelBaseInches: getValue('Wheel Base (inches)'),
            wheelBaseLong: getValue('Wheel Base Long (inches)'),
            wheelBaseShort: getValue('Wheel Base Short (inches)'),
            overallLength: getValue('Overall Length (inches)'),
            overallWidth: getValue('Overall Width (inches)'),
            overallHeight: getValue('Overall Height (inches)'),
            trackWidth: getValue('Track Width (inches)'),
            trackWidthFront: getValue('Track Front (inches)'),
            trackWidthRear: getValue('Track Rear (inches)'),
            curbWeightLB: getValue('Curb Weight (pounds)'),
            grossVehicleWeightRating: getValue('Gross Vehicle Weight Rating'),
            grossVehicleWeightRatingFrom: getValue('Gross Vehicle Weight Rating From'),
            grossVehicleWeightRatingTo: getValue('Gross Vehicle Weight Rating To'),
            grossCombinationWeightRating: getValue('Gross Combination Weight Rating'),
            grossCombinationWeightRatingFrom: getValue('Gross Combination Weight Rating From'),
            grossCombinationWeightRatingTo: getValue('Gross Combination Weight Rating To'),
            bedLengthInches: getValue('Bed Length (inches)'),
            bedType: getValue('Bed Type'),
            cabType: getValue('Cab Type'),
        },

        // 6. FUEL CAPACITY & EFFICIENCY
        fuel: {
            fuelTankCapacityGal: getValue('Fuel Tank Capacity (gallons)'),
            fuelTankCapacityL: getValue('Fuel Tank Capacity (liters)'),
        },

        // 7. SAFETY FEATURES & RATINGS
        safety: {
            // Airbags
            airBagLocFront: getValue('Air Bag Loc Front'),
            airBagLocSide: getValue('Air Bag Loc Side'),
            airBagLocCurtain: getValue('Air Bag Loc Curtain'),
            airBagLocKnee: getValue('Air Bag Loc Knee'),
            airBagLocSeatCushion: getValue('Air Bag Loc Seat Cushion'),
            
            // Seat Belts
            seatBeltsAll: getValue('Seat Belts All'),
            pretensioner: getValue('Pretensioner'),
            seatBeltType: getValue('Seat Belt Type'),
            
            // Active Safety
            abs: getValue('ABS'),
            esc: getValue('Electronic Stability Control (ESC)'),
            tractionControl: getValue('Traction Control'),
            tpms: getValue('TPMS (tire pressure monitoring)'),
            tpmsType: getValue('TPMS Type'),
            
            // Driver Assistance
            adaptiveCruiseControl: getValue('Adaptive Cruise Control (ACC)'),
            crashImminent: getValue('Crash Imminent Braking (CIB)'),
            blindSpotMon: getValue('Blind Spot Monitor (BSM)'),
            blindSpotIntervention: getValue('Blind Spot Intervention (BSI)'),
            laneDepartureWarning: getValue('Lane Departure Warning (LDW)'),
            laneKeepingAssist: getValue('Lane Keeping Assistance (LKA)'),
            laneCenteringAssist: getValue('Lane Centering Assistance'),
            rearCrossTrafficAlert: getValue('Rear Cross Traffic Alert'),
            parkAssist: getValue('Park Assist'),
            rearVisibilitySystem: getValue('Rear Visibility Camera'),
            rearAutomaticEmergencyBraking: getValue('Rear Automatic Emergency Braking'),
            forwardCollisionWarning: getValue('Forward Collision Warning (FCW)'),
            dynamicBrakeSupport: getValue('Dynamic Brake Support (DBS)'),
            pedestrianAutomaticEmergencyBraking: getValue('Pedestrian Automatic Emergency Braking (PAEB)'),
            autoReverseSystem: getValue('Auto-Reverse System for Windows and Sunroofs'),
            automaticPedestrianAlertingSound: getValue('Automatic Pedestrian Alerting Sound (for Hybrid and EV only)'),
            eventDataRecorder: getValue('Event Data Recorder (EDR)'),
            keylessIgnition: getValue('Keyless Ignition'),
            daytimeRunningLight: getValue('Daytime Running Light (DRL)'),
            headlampLightSource: getValue('Headlamp Light Source'),
            semiautomaticHeadlampBeamSwitching: getValue('Semiautomatic Headlamp Beam Switching'),
            adaptiveDrivingBeam: getValue('Adaptive Driving Beam (ADB)'),
            
            // NCAP Ratings
            ncapBodyType: getValue('NCAP Body Type'),
            ncapMake: getValue('NCAP Make'),
            ncapModel: getValue('NCAP Model'),
            ncapModelYear: getValue('NCAP Model Year'),
        },

        // 8. SEATING & INTERIOR
        interior: {
            seats: getValue('Seats'),
            seatRows: getValue('Seat Rows'),
            entertainmentSystem: getValue('Entertainment System'),
            steeringLocation: getValue('Steering Location'),
            otherRestraintSystemInfo: getValue('Other Restraint System Info'),
            busLength: getValue('Bus Length (feet)'),
            busFloorConfigType: getValue('Bus Floor Config Type'),
            busType: getValue('Bus Type'),
        },

        // 9. WHEELS & TIRES
        wheelsAndTires: {
            wheels: getValue('Wheels'),
            wheelSizeFront: getValue('Wheel Size Front (inches)'),
            wheelSizeRear: getValue('Wheel Size Rear (inches)'),
            tireSize: getValue('Tire Size'),
        },

        // 10. TRUCK/TRAILER SPECIFICATIONS
        truckTrailer: {
            trailerTypeConnection: getValue('Trailer Type Connection'),
            trailerBodyType: getValue('Trailer Body Type'),
            trailerLength: getValue('Trailer Length (feet)'),
        },

        // 11. MOTORCYCLE SPECIFICATIONS
        motorcycle: {
            motorcycleSuspensionType: getValue('Motorcycle Suspension Type'),
            motorcycleChassisType: getValue('Motorcycle Chassis Type'),
        },

        // 12. MANUFACTURING & COMPLIANCE
        manufacturing: {
            manufacturerId: getValue('Manufacturer Id'),
            plantCode: getValue('Plant Code'),
            modelID: getValue('Model ID'),
            basePrice: getValue('Base Price ($)'),
            destinationMarket: getValue('Destination Market'),
            note: getValue('Note'),
            
            // Custom/Import Info
            customMotorcycleType: getValue('Custom Motorcycle Type'),
            otherMotorcycleInfo: getValue('Other Motorcycle Info'),
            
            // Error/Validation
            errorCode: getValue('Error Code'),
            errorText: getValue('Error Text'),
            possibleValues: getValue('Possible Values'),
            additionalErrorText: getValue('Additional Error Text'),
            suggestedVIN: getValue('Suggested VIN'),
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
    if (data.manufacturing.errorCode === '0') realIndicators++;
    
    return realIndicators >= 5;
}

// Estimate fuel capacity
function getFuelCapacity(data) {
    if (data.fuel.fuelTankCapacityGal !== 'N/A') {
        return data.fuel.fuelTankCapacityGal + ' gallons';
    } else if (data.fuel.fuelTankCapacityL !== 'N/A') {
        const liters = parseFloat(data.fuel.fuelTankCapacityL);
        if (!isNaN(liters)) {
            const gallons = (liters / 3.785).toFixed(1);
            return `~${gallons} gallons (${data.fuel.fuelTankCapacityL} L)`;
        }
        return data.fuel.fuelTankCapacityL + ' liters';
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

// Create ultra-comprehensive result display
function displayUltraComprehensiveResults(vin, data, recalls) {
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

    // Add ALL comprehensive data sections
    html += '<div class="data-sections">';
    
    // 1. BASIC INFORMATION
    html += createDataSection('basic-info', '📋', 'Basic Vehicle Information', [
        { label: 'Vehicle Type', value: data.basic.vehicleType },
        { label: 'Body Class', value: data.basic.bodyClass },
        { label: 'Series', value: data.basic.series },
        { label: 'Series 2', value: data.basic.series2 },
        { label: 'Trim', value: data.basic.trim },
        { label: 'Trim 2', value: data.basic.trim2 },
        { label: 'Doors', value: data.basic.doors },
        { label: 'Windows', value: data.basic.windows },
        { label: 'Vehicle Descriptor', value: data.basic.vehicleDescriptor },
    ], true);

    // 2. MANUFACTURING DETAILS
    html += createDataSection('manufacturing', '🏭', 'Manufacturing Details', [
        { label: 'Plant Country', value: data.basic.plantCountry },
        { label: 'Plant Company Name', value: data.basic.plantCompanyName },
        { label: 'Plant City', value: data.basic.plantCity },
        { label: 'Plant State', value: data.basic.plantState },
        { label: 'Plant Code', value: data.manufacturing.plantCode },
        { label: 'Manufacturer ID', value: data.manufacturing.manufacturerId },
        { label: 'Model ID', value: data.manufacturing.modelID },
        { label: 'Base Price', value: data.manufacturing.basePrice },
        { label: 'Destination Market', value: data.manufacturing.destinationMarket },
    ]);

    // 3. ENGINE SPECIFICATIONS
    html += createDataSection('engine-specs', '🔧', 'Engine Specifications', [
        { label: 'Engine Cylinders', value: data.engine.engineNumberOfCylinders },
        { label: 'Displacement (L)', value: data.engine.displacementL },
        { label: 'Displacement (CI)', value: data.engine.displacementCI },
        { label: 'Displacement (CC)', value: data.engine.displacementCC },
        { label: 'Engine Model', value: data.engine.engineModel },
        { label: 'Engine Manufacturer', value: data.engine.engineManufacturer },
        { label: 'Engine Power (kW)', value: data.engine.enginePowerKW },
        { label: 'Engine HP', value: data.engine.engineHP },
        { label: 'Engine HP (From)', value: data.engine.engineHPFrom },
        { label: 'Engine HP (To)', value: data.engine.engineHPTo },
        { label: 'Engine kW', value: data.engine.engineKW },
        { label: 'Engine Configuration', value: data.engine.engineConfiguration },
        { label: 'Cooling Type', value: data.engine.coolingType },
        { label: 'Engine Cycles', value: data.engine.engineCycles },
        { label: 'Valve Train Design', value: data.engine.valveTrainDesign },
        { label: 'Turbo', value: data.engine.turbo },
        { label: 'Top Speed (MPH)', value: data.engine.topSpeedMPH },
        { label: 'Engine Brake (hp)', value: data.engine.engineBrake },
    ]);

    // 4. FUEL SYSTEM
    html += createDataSection('fuel-system', '⛽', 'Fuel System', [
        { label: 'Fuel Type (Primary)', value: data.engine.fuelTypePrimary },
        { label: 'Fuel Type (Secondary)', value: data.engine.fuelTypeSecondary },
        { label: 'Fuel Injection Type', value: data.engine.fuelInjectionType },
        { label: 'Fuel Tank Capacity (Gallons)', value: data.fuel.fuelTankCapacityGal },
        { label: 'Fuel Tank Capacity (Liters)', value: data.fuel.fuelTankCapacityL },
    ]);

    // 5. ELECTRIC/HYBRID VEHICLE
    html += createDataSection('electric-vehicle', '⚡', 'Electric/Hybrid Vehicle Data', [
        { label: 'Electrification Level', value: data.electric.electrificationLevel },
        { label: 'Battery Type', value: data.electric.batteryType },
        { label: 'Battery Info', value: data.electric.batteryInfo },
        { label: 'Battery A', value: data.electric.batteryA },
        { label: 'Battery A (To)', value: data.electric.batteryATo },
        { label: 'Battery V', value: data.electric.batteryV },
        { label: 'Battery V (To)', value: data.electric.batteryVTo },
        { label: 'Battery kWh', value: data.electric.batteryKWh },
        { label: 'Battery kWh (To)', value: data.electric.batteryKWhTo },
        { label: 'Battery Modules', value: data.electric.batteryModules },
        { label: 'Battery Cells', value: data.electric.batteryCells },
        { label: 'Battery Packs', value: data.electric.batteryPacks },
        { label: 'Charger Level', value: data.electric.chargerLevel },
        { label: 'Charger Power (kW)', value: data.electric.chargerPowerKW },
        { label: 'EV Drive Unit', value: data.electric.evDriveUnit },
        { label: 'Other Engine Info', value: data.electric.otherEngineInfo },
    ]);

    // 6. TRANSMISSION & DRIVETRAIN
    html += createDataSection('drivetrain', '⚙️', 'Transmission & Drivetrain', [
        { label: 'Transmission Style', value: data.drivetrain.transmissionStyle },
        { label: 'Transmission Speeds', value: data.drivetrain.transmissionSpeeds },
        { label: 'Drive Type', value: data.drivetrain.driveType },
        { label: 'Axles', value: data.drivetrain.axles },
        { label: 'Axle Configuration', value: data.drivetrain.axleConfiguration },
    ]);

    // 7. BRAKE SYSTEM
    html += createDataSection('brake-system', '🛑', 'Brake System', [
        { label: 'Brake System Type', value: data.drivetrain.brakeSystemType },
        { label: 'Brake System Description', value: data.drivetrain.brakeSystemDesc },
        { label: 'ABS', value: data.safety.abs },
    ]);

    // 8. DIMENSIONS & WEIGHT
    html += createDataSection('dimensions', '📏', 'Dimensions & Weight', [
        { label: 'Wheelbase Type', value: data.dimensions.wheelBaseType },
        { label: 'Wheelbase (inches)', value: data.dimensions.wheelBaseInches },
        { label: 'Wheelbase Long (inches)', value: data.dimensions.wheelBaseLong },
        { label: 'Wheelbase Short (inches)', value: data.dimensions.wheelBaseShort },
        { label: 'Overall Length', value: data.dimensions.overallLength },
        { label: 'Overall Width', value: data.dimensions.overallWidth },
        { label: 'Overall Height', value: data.dimensions.overallHeight },
        { label: 'Track Width', value: data.dimensions.trackWidth },
        { label: 'Track Front', value: data.dimensions.trackWidthFront },
        { label: 'Track Rear', value: data.dimensions.trackWidthRear },
        { label: 'Curb Weight (pounds)', value: data.dimensions.curbWeightLB },
        { label: 'GVWR', value: data.dimensions.grossVehicleWeightRating },
        { label: 'GVWR From', value: data.dimensions.grossVehicleWeightRatingFrom },
        { label: 'GVWR To', value: data.dimensions.grossVehicleWeightRatingTo },
        { label: 'GCWR', value: data.dimensions.grossCombinationWeightRating },
        { label: 'GCWR From', value: data.dimensions.grossCombinationWeightRatingFrom },
        { label: 'GCWR To', value: data.dimensions.grossCombinationWeightRatingTo },
    ]);

    // 9. TRUCK/COMMERCIAL VEHICLE SPECS
    html += createDataSection('truck-specs', '🚚', 'Truck/Commercial Specifications', [
        { label: 'Bed Length', value: data.dimensions.bedLengthInches },
        { label: 'Bed Type', value: data.dimensions.bedType },
        { label: 'Cab Type', value: data.dimensions.cabType },
        { label: 'Trailer Type Connection', value: data.truckTrailer.trailerTypeConnection },
        { label: 'Trailer Body Type', value: data.truckTrailer.trailerBodyType },
        { label: 'Trailer Length (feet)', value: data.truckTrailer.trailerLength },
    ]);

    // 10. AIRBAG SYSTEMS
    html += createDataSection('airbags', '🛡️', 'Airbag Systems', [
        { label: 'Front Airbags', value: data.safety.airBagLocFront },
        { label: 'Side Airbags', value: data.safety.airBagLocSide },
        { label: 'Curtain Airbags', value: data.safety.airBagLocCurtain },
        { label: 'Knee Airbags', value: data.safety.airBagLocKnee },
        { label: 'Seat Cushion Airbags', value: data.safety.airBagLocSeatCushion },
    ]);

    // 11. SEAT BELT SYSTEMS
    html += createDataSection('seatbelts', '🔒', 'Seat Belt Systems', [
        { label: 'Seat Belts (All)', value: data.safety.seatBeltsAll },
        { label: 'Pretensioner', value: data.safety.pretensioner },
        { label: 'Seat Belt Type', value: data.safety.seatBeltType },
        { label: 'Other Restraint Info', value: data.interior.otherRestraintSystemInfo },
    ]);

    // 12. ACTIVE SAFETY SYSTEMS
    html += createDataSection('active-safety', '🚦', 'Active Safety Systems', [
        { label: 'ESC', value: data.safety.esc },
        { label: 'Traction Control', value: data.safety.tractionControl },
        { label: 'Adaptive Cruise Control', value: data.safety.adaptiveCruiseControl },
        { label: 'Crash Imminent Braking', value: data.safety.crashImminent },
        { label: 'Forward Collision Warning', value: data.safety.forwardCollisionWarning },
        { label: 'Dynamic Brake Support', value: data.safety.dynamicBrakeSupport },
        { label: 'Pedestrian Auto Emergency Braking', value: data.safety.pedestrianAutomaticEmergencyBraking },
        { label: 'Rear Auto Emergency Braking', value: data.safety.rearAutomaticEmergencyBraking },
    ]);

    // 13. DRIVER ASSISTANCE SYSTEMS
    html += createDataSection('driver-assist', '👁️', 'Driver Assistance Systems', [
        { label: 'Blind Spot Monitor', value: data.safety.blindSpotMon },
        { label: 'Blind Spot Intervention', value: data.safety.blindSpotIntervention },
        { label: 'Lane Departure Warning', value: data.safety.laneDepartureWarning },
        { label: 'Lane Keeping Assist', value: data.safety.laneKeepingAssist },
        { label: 'Lane Centering Assist', value: data.safety.laneCenteringAssist },
        { label: 'Rear Cross Traffic Alert', value: data.safety.rearCrossTrafficAlert },
        { label: 'Park Assist', value: data.safety.parkAssist },
        { label: 'Rear Visibility Camera', value: data.safety.rearVisibilitySystem },
    ]);

    // 14. LIGHTING SYSTEMS
    html += createDataSection('lighting', '💡', 'Lighting Systems', [
        { label: 'Daytime Running Lights', value: data.safety.daytimeRunningLight },
        { label: 'Headlamp Light Source', value: data.safety.headlampLightSource },
        { label: 'Semiautomatic Headlamp Beam Switching', value: data.safety.semiautomaticHeadlampBeamSwitching },
        { label: 'Adaptive Driving Beam', value: data.safety.adaptiveDrivingBeam },
    ]);

    // 15. OTHER SAFETY FEATURES
    html += createDataSection('other-safety', '🔐', 'Other Safety Features', [
        { label: 'TPMS', value: data.safety.tpms },
        { label: 'TPMS Type', value: data.safety.tpmsType },
        { label: 'Keyless Ignition', value: data.safety.keylessIgnition },
        { label: 'Event Data Recorder', value: data.safety.eventDataRecorder },
        { label: 'Auto-Reverse System', value: data.safety.autoReverseSystem },
        { label: 'Automatic Pedestrian Alert Sound', value: data.safety.automaticPedestrianAlertingSound },
    ]);

    // 16. SEATING & INTERIOR
    html += createDataSection('interior', '🪑', 'Seating & Interior', [
        { label: 'Seats', value: data.interior.seats },
        { label: 'Seat Rows', value: data.interior.seatRows },
        { label: 'Steering Location', value: data.interior.steeringLocation },
        { label: 'Entertainment System', value: data.interior.entertainmentSystem },
    ]);

    // 17. BUS SPECIFICATIONS
    html += createDataSection('bus-specs', '🚌', 'Bus Specifications', [
        { label: 'Bus Length (feet)', value: data.interior.busLength },
        { label: 'Bus Floor Config Type', value: data.interior.busFloorConfigType },
        { label: 'Bus Type', value: data.interior.busType },
    ]);

    // 18. WHEELS & TIRES
    html += createDataSection('wheels-tires', '⚙️', 'Wheels & Tires', [
        { label: 'Wheels', value: data.wheelsAndTires.wheels },
        { label: 'Wheel Size (Front)', value: data.wheelsAndTires.wheelSizeFront },
        { label: 'Wheel Size (Rear)', value: data.wheelsAndTires.wheelSizeRear },
        { label: 'Tire Size', value: data.wheelsAndTires.tireSize },
    ]);

    // 19. MOTORCYCLE SPECIFICATIONS
    html += createDataSection('motorcycle-specs', '🏍️', 'Motorcycle Specifications', [
        { label: 'Suspension Type', value: data.motorcycle.motorcycleSuspensionType },
        { label: 'Chassis Type', value: data.motorcycle.motorcycleChassisType },
        { label: 'Custom Motorcycle Type', value: data.manufacturing.customMotorcycleType },
        { label: 'Other Motorcycle Info', value: data.manufacturing.otherMotorcycleInfo },
    ]);

    // 20. NCAP SAFETY RATINGS
    html += createDataSection('ncap-ratings', '⭐', 'NCAP Safety Ratings Info', [
        { label: 'NCAP Body Type', value: data.safety.ncapBodyType },
        { label: 'NCAP Make', value: data.safety.ncapMake },
        { label: 'NCAP Model', value: data.safety.ncapModel },
        { label: 'NCAP Model Year', value: data.safety.ncapModelYear },
    ]);

    html += '</div>';

    // Recalls Section (same as before)
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

// Create collapsible data section (same function)
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
    const firstSection = document.querySelector('.section-content');
    if (firstSection) {
        firstSection.classList.add('active');
    }
}

// PDF Generation (enhanced for ultra-comprehensive data)
function downloadPDF() {
    if (!currentVINData) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const { vin, data, recalls, isReal, fuelCapacity } = currentVINData;
    
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    
    function checkNewPage() {
        if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
        }
    }
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('ULTRA-COMPREHENSIVE VIN REPORT', 105, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(12);
    doc.text(`VIN: ${vin}`, 20, yPos);
    yPos += 10;
    
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
        const filteredItems = items.filter(item => item.value !== 'N/A');
        if (filteredItems.length === 0) return;
        
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
        
        yPos += 3;
        checkNewPage();
    }
    
    // Add all sections to PDF
    addSection('BASIC INFORMATION', [
        { label: 'Vehicle Type', value: data.basic.vehicleType },
        { label: 'Body Class', value: data.basic.bodyClass },
        { label: 'Series', value: data.basic.series },
        { label: 'Trim', value: data.basic.trim },
        { label: 'Doors', value: data.basic.doors },
    ]);
    
    addSection('ENGINE SPECIFICATIONS', [
        { label: 'Cylinders', value: data.engine.engineNumberOfCylinders },
        { label: 'Displacement (L)', value: data.engine.displacementL },
        { label: 'Engine Model', value: data.engine.engineModel },
        { label: 'Engine Power (kW)', value: data.engine.enginePowerKW },
        { label: 'Fuel Type', value: data.engine.fuelTypePrimary },
        { label: 'Turbo', value: data.engine.turbo },
    ]);
    
    addSection('DRIVETRAIN', [
        { label: 'Transmission', value: data.drivetrain.transmissionStyle },
        { label: 'Drive Type', value: data.drivetrain.driveType },
    ]);
    
    addSection('DIMENSIONS', [
        { label: 'Length', value: data.dimensions.overallLength },
        { label: 'Width', value: data.dimensions.overallWidth },
        { label: 'Height', value: data.dimensions.overallHeight },
        { label: 'Wheelbase', value: data.dimensions.wheelBaseInches },
    ]);
    
    addSection('SAFETY FEATURES', [
        { label: 'Front Airbags', value: data.safety.airBagLocFront },
        { label: 'Side Airbags', value: data.safety.airBagLocSide },
        { label: 'ABS', value: data.safety.abs },
        { label: 'ESC', value: data.safety.esc },
        { label: 'Blind Spot Monitor', value: data.safety.blindSpotMon },
        { label: 'Lane Departure Warning', value: data.safety.laneDepartureWarning },
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
    doc.text('Generated by VIN Decoder Pro - Ultra-Comprehensive Edition', 105, yPos, { align: 'center' });
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 105, yPos + 5, { align: 'center' });
    
    // Save
    doc.save(`VIN-Ultra-Comprehensive-Report-${vin}.pdf`);
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
        const response = await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const vinData = await response.json();
        const results = vinData.Results || [];
        const data = getUltraComprehensiveVINData(results);
        
        showLoading('Checking for recalls...');
        const recalls = await fetchRecalls(vin);
        
        hideLoading();
        displayUltraComprehensiveResults(vin, data, recalls);
        
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

console.log('%c🚗 VIN Decoder Pro - ULTRA-COMPREHENSIVE', 'font-size: 20px; font-weight: bold; color: #3B82F6;');
console.log('%c150+ Data Points • 20 Categories • Complete NHTSA Database', 'font-size: 12px; color: #6B7280;');
