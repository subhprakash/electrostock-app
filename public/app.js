document.addEventListener('DOMContentLoaded', () => {
    // Element selections
    const itemForm = document.getElementById('item-form');
    const itemsList = document.getElementById('items-list');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const tableHeaders = document.querySelectorAll('th[data-sort]');
    const logoutBtn = document.getElementById('logout-btn');

    // App state
    let allItems = [];
    let currentSort = { key: 'name', order: 'asc' };
    let originalRowHTML = null;
    const LOW_STOCK_THRESHOLD = 5;

    // --- DATA FETCHING & RENDERING ---
    async function fetchItems() {
        const searchTerm = searchInput.value;
        const category = categoryFilter.value;
        const url = new URL('/api/items', window.location.origin);
        if (searchTerm) url.searchParams.append('search', searchTerm);
        if (category) url.searchParams.append('category', category);

        try {
            const response = await fetch(url);
            if (!response.ok) { // If not logged in, server returns 401
                window.location.href = '/login.html'; // Redirect to login
                return;
            }
            allItems = await response.json();
            populateCategoryFilter();
            sortAndRender(); // Sort and then render
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    }
    
    function renderTable(items) {
        // ... (renderTable logic from previous step)
    }

    function populateCategoryFilter() {
        // ... (populateCategoryFilter logic from previous step)
    }

    // --- EVENT LISTENERS ---
    itemForm.addEventListener('submit', async (e) => { /* ... ADD logic ... */ });
    itemsList.addEventListener('click', async (e) => { /* ... UPDATE/DELETE/SAVE/CANCEL logic ... */ });
    searchInput.addEventListener('input', fetchItems);
    categoryFilter.addEventListener('change', fetchItems);
    tableHeaders.forEach(header => { header.addEventListener('click', () => { /* ... SORT logic ... */ }); });

    // FINAL: Logout Button Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('/api/logout');
                window.location.href = '/login.html';
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
    }
    
    function sortAndRender() {
        // ... (sortAndRender logic from previous step)
    }
    
    // Initial load
    fetchItems();
});

// NOTE: The logic for rendering, sorting, updating, etc., is extensive. 
// This example shows the structure. You should use the complete app.js file from the previous step that added all features.