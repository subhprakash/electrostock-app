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
        // CORRECTED: The base URL now includes /api/
        const url = new URL('/api/items', window.location.origin);
        const searchTerm = searchInput.value;
        const category = categoryFilter.value;
        if (searchTerm) url.searchParams.append('search', searchTerm);
        if (category) url.searchParams.append('category', category);

        try {
            const response = await fetch(url);
            if (response.status === 401) { // If not logged in, server returns 401
                window.location.href = '/login.html'; // Redirect to login
                return;
            }
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            allItems = await response.json();
            populateCategoryFilter();
            sortAndRender(); // Sort and then render
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    }

    function renderTable(items) {
        itemsList.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.id = item._id;
            if (item.quantity <= LOW_STOCK_THRESHOLD) {
                row.classList.add('low-stock');
            }
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td class="actions-cell">
                    <button class="update-btn">Update</button>
                    <button class="delete-btn">Delete</button>
                </td>
            `;
            itemsList.appendChild(row);
        });
    }

    function populateCategoryFilter() {
        const categories = [...new Set(allItems.map(item => item.category))];
        const currentSelection = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = currentSelection;
    }

    // --- EVENT LISTENERS ---
    itemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            quantity: document.getElementById('quantity').value,
        };
        try {
            // CORRECTED: Added /api/ to the URL
            const response = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                itemForm.reset();
                fetchItems();
            } else { console.error('Failed to add item'); }
        } catch (error) { console.error('Error submitting form:', error); }
    });

    itemsList.addEventListener('click', async (e) => {
        const row = e.target.closest('tr');
        if (!row) return;
        const itemId = row.dataset.id;

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this item?')) {
                try {
                    // CORRECTED: Added /api/ to the URL
                    const response = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
                    if (response.ok) fetchItems();
                    else console.error('Failed to delete item');
                } catch (error) { console.error('Error deleting item:', error); }
            }
        }

        if (e.target.classList.contains('update-btn')) {
            const cells = row.querySelectorAll('td');
            originalRowHTML = row.innerHTML;
            cells[0].innerHTML = `<input type="text" value="${cells[0].textContent}">`;
            cells[1].innerHTML = `<input type="text" value="${cells[1].textContent}">`;
            cells[2].innerHTML = `<input type="number" value="${cells[2].textContent.replace('$', '')}">`;
            cells[3].innerHTML = `<input type="number" value="${cells[3].textContent}">`;
            cells[4].innerHTML = `<button class="save-btn">Save</button><button class="cancel-btn">Cancel</button>`;
        }

        if (e.target.classList.contains('cancel-btn')) {
            row.innerHTML = originalRowHTML;
        }

        if (e.target.classList.contains('save-btn')) {
            const inputs = row.querySelectorAll('input');
            const updatedData = {
                name: inputs[0].value, category: inputs[1].value,
                price: inputs[2].value, quantity: inputs[3].value,
            };
            try {
                // CORRECTED: Added /api/ to the URL
                const response = await fetch(`/api/items/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                if (response.ok) fetchItems();
                else console.error('Failed to update item');
            } catch (error) { console.error('Error updating item:', error); }
        }
    });

    searchInput.addEventListener('input', fetchItems);
    categoryFilter.addEventListener('change', fetchItems);

    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.dataset.sort;
            if (currentSort.key === sortKey) {
                currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = sortKey;
                currentSort.order = 'asc';
            }
            sortAndRender();
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                // CORRECTED: Added /api/ to the URL
                await fetch('/api/logout');
                window.location.href = '/login.html';
            } catch (error) { console.error('Logout failed:', error); }
        });
    }

    function sortAndRender() {
        allItems.sort((a, b) => {
            const valA = a[currentSort.key];
            const valB = b[currentSort.key];
            let comparison = 0;
            if (typeof valA === 'string') {
                comparison = valA.localeCompare(valB);
            } else {
                comparison = valA - valB;
            }
            return currentSort.order === 'asc' ? comparison : -comparison;
        });
        renderTable(allItems);
    }

    // Initial load
    fetchItems();
});

