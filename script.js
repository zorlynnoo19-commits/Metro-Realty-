// ============================================
// Metro Realty - Google Sheets API Integration
// ============================================

// Configuration
const CONFIG = {
    // Replace with your Google Sheets ID
    SHEET_ID: 'https://docs.google.com/spreadsheets/d/11dFfJpHdIM8h1MsunCuf333F-YmgdQiDmEuPzWPezFg/edit?usp=drivesdk',
    // Replace with your API Key
    API_KEY: 'YOUR_GOOGLE_API_KEY_HERE',
    // Sheet name (default: Sheet1)
    SHEET_NAME: 'Sheet1',
    // Phone numbers for WhatsApp/Viber (Myanmar format)
    PHONE_WHATSAPP: '959123456789',
    PHONE_VIBER: '959123456789'
};

// Global Variables
let allProperties = [];
let filteredProperties = [];

// ============================================
// 1. Google Sheets API - Fetch Data
// ============================================

async function fetchPropertiesFromSheets() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${CONFIG.SHEET_NAME}?key=${CONFIG.API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        const rows = data.values;
        
        if (!rows || rows.length < 2) {
            console.warn('No data found in Google Sheet');
            displayError('ပိုင်ဆိုင်မှုအချက်အလက်မရှိပါ။');
            return;
        }

        // Parse data (skip header row)
        allProperties = rows.slice(1).map((row, index) => ({
            id: index + 1,
            title: row[0] || 'Untitled',
            price: row[1] || '0',
            imageUrl: row[2] || 'https://via.placeholder.com/400x300?text=No+Image',
            location: row[3] || 'မန္တလေး',
            description: row[4] || 'No description',
            category: row[5] || 'apartment',
            bedrooms: row[6] || '-',
            bathrooms: row[7] || '-',
            area: row[8] || '-'
        }));

        console.log('Properties loaded:', allProperties.length);
        filteredProperties = [...allProperties];
        displayProperties();
        
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        displayError('ပိုင်ဆိုင်မှုများ ရယူရန် ပരvaló်သည်။ API Key နှင့် Sheet ID ကိုစစ်ဆေးပါ။');
    }
}

// ============================================
// 2. Display Properties
// ============================================

function displayProperties() {
    const grid = document.getElementById('propertyGrid');
    const gridMore = document.getElementById('propertyGridMore');
    const loading = document.getElementById('loading');

    if (filteredProperties.length === 0) {
        grid.classList.add('hidden');
        gridMore.classList.add('hidden');
        loading.classList.remove('hidden');
        loading.innerHTML = '<p style="font-family: \'Padauk\', sans-serif;">ရှာဖွေမှုနှင့်ကိုက်ညီသည့် ပိုင်ဆိုင်မှုများမရှိပါ။</p>';
        return;
    }

    loading.classList.add('hidden');
    grid.classList.remove('hidden');

    // Split properties: first 6 in grid, rest in gridMore
    const firstBatch = filteredProperties.slice(0, 6);
    const secondBatch = filteredProperties.slice(6);

    grid.innerHTML = firstBatch.map(property => createPropertyCard(property)).join('');
    
    if (secondBatch.length > 0) {
        gridMore.classList.remove('hidden');
        gridMore.innerHTML = secondBatch.map(property => createPropertyCard(property)).join('');
    } else {
        gridMore.classList.add('hidden');
    }

    // Add click handlers
    document.querySelectorAll('.property-card').forEach(card => {
        card.addEventListener('click', function() {
            const propertyId = this.dataset.id;
            const property = allProperties.find(p => p.id == propertyId);
            if (property) openModal(property);
        });
    });
}

function createPropertyCard(property) {
    return `
        <div class="property-card" data-id="${property.id}">
            <img src="${property.imageUrl}" alt="${property.title}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
            <div class="property-card-content">
                <div class="property-card-title">${escapeHtml(property.title)}</div>
                <div class="property-card-price">${formatPrice(property.price)}</div>
                <div class="property-card-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${escapeHtml(property.location)}</span>
                </div>
                <div class="property-card-description">${escapeHtml(property.description)}</div>
                <button class="property-card-button">အသေးစိတ်ကြည့်ရှုပါ</button>
            </div>
        </div>
    `;
}

// ============================================
// 3. Search & Filter
// ============================================

function filterProperties() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    filteredProperties = allProperties.filter(property => {
        const matchesSearch = 
            property.title.toLowerCase().includes(searchTerm) ||
            property.location.toLowerCase().includes(searchTerm) ||
            property.description.toLowerCase().includes(searchTerm);
        
        const matchesCategory = category === 'all' || property.category === category;

        return matchesSearch && matchesCategory;
    });

    displayProperties();
}

document.getElementById('searchBtn').addEventListener('click', filterProperties);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') filterProperties();
});
document.getElementById('categoryFilter').addEventListener('change', filterProperties);

// ============================================
// 4. Modal Functions
// ============================================

function openModal(property) {
    const modal = document.getElementById('propertyModal');
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = `
        <img src="${property.imageUrl}" alt="${property.title}" class="modal-image" onerror="this.src='https://via.placeholder.com/800x400?text=No+Image'">
        <h2 class="modal-title">${escapeHtml(property.title)}</h2>
        <div class="modal-price">${formatPrice(property.price)}</div>
        
        <div class="modal-details">
            <div class="modal-detail-item">
                <div class="modal-detail-label">တည်နေရာ</div>
                <div class="modal-detail-value">${escapeHtml(property.location)}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">အခန်းများ</div>
                <div class="modal-detail-value">${property.bedrooms}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">ရေချိုးခန်းများ</div>
                <div class="modal-detail-value">${property.bathrooms}</div>
            </div>
            <div class="modal-detail-item">
                <div class="modal-detail-label">ဧရိယာ</div>
                <div class="modal-detail-value">${property.area}</div>
            </div>
        </div>

        <div class="modal-description">
            <h3 style="font-family: 'Padauk', sans-serif; color: #001f3f; margin-bottom: 1rem;">အကြောင်းအရာ</h3>
            ${escapeHtml(property.description)}
        </div>

        <button class="modal-contact-btn" onclick="contactViaWhatsApp('${property.title}')">
            <i class="fab fa-whatsapp"></i> WhatsApp မှတစ်ဆင့် ဆက်သွယ်ပါ
        </button>
        <button class="modal-contact-btn" style="background: #7B519C; margin-top: 0.5rem;" onclick="contactViaViber('${property.title}')">
            <i class="fab fa-viber"></i> Viber မှတစ်ဆင့် ဆက်သွယ်ပါ
        </button>
    `;

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('propertyModal');
    modal.classList.remove('active');
}

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', closeModal);

// ============================================
// 5. Contact Functions
// ============================================

function contactViaWhatsApp(propertyTitle) {
    const message = encodeURIComponent(`မြန်မာ: "${propertyTitle}" ပိုင်ဆိုင်မှုအကြောင်း ပိုသိရှိလိုပါသည်။\n\nEnglish: I'm interested in the property "${propertyTitle}". Please provide more details.`);
    window.open(`https://wa.me/${CONFIG.PHONE_WHATSAPP}?text=${message}`, '_blank');
}

function contactViaViber(propertyTitle) {
    const message = encodeURIComponent(`"${propertyTitle}" အကြောင်း စုံစမ်းလိုပါသည်။`);
    window.open(`viber://chat?number=${CONFIG.PHONE_VIBER}&text=${message}`, '_blank');
}

// ============================================
// 6. Utility Functions
// ============================================

function formatPrice(price) {
    // Convert to number and format with commas
    const num = parseFloat(price.toString().replace(/,/g, ''));
    if (isNaN(num)) return price;
    
    // Format with commas and add currency
    return '₹' + num.toLocaleString('my-MM');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function displayError(message) {
    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');
    loading.innerHTML = `<p style="font-family: 'Padauk', sans-serif; color: #d32f2f;">${message}</p>`;
}

// ============================================
// 7. Mobile Menu Toggle
// ============================================

document.getElementById('menuBtn').addEventListener('click', function() {
    const nav = document.querySelector('nav');
    nav.classList.toggle('hidden');
});

// ============================================
// 8. Initialize App
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Metro Realty App Initializing...');
    
    // Check if API Key and Sheet ID are configured
    if (CONFIG.SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE' || CONFIG.API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
        displayError('⚠️ API Key သို့မဟုတ် Sheet ID မသတ်မှတ်ရသေးပါ။ script.js ဖိုင်ကို ပြင်ဆင်ပါ။');
        return;
    }

    // Fetch properties from Google Sheets
    fetchPropertiesFromSheets();

    // Optional: Refresh data every 5 minutes
    setInterval(fetchPropertiesFromSheets, 5 * 60 * 1000);
});

// ============================================
// 9. Keyboard Navigation
// ============================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ============================================
// 10. Performance Optimization
// ============================================

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

console.log('Metro Realty App Ready!');
