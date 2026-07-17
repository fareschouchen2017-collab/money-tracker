const balance = document.getElementById('balance');
const moneyPlus = document.getElementById('money-plus');
const moneyMinus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const chartCanvas = document.getElementById('chart');
const chartEmpty = document.getElementById('chart-empty');
const exportCsvBtn = document.getElementById('export-csv');
const exportJsonBtn = document.getElementById('export-json');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

// Category options per transaction type
const CATEGORIES = {
    expense: ['Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other'],
    income: ['Salary', 'Freelance', 'Gift', 'Investment', 'Other']
};

// Fixed color per category so the chart stays consistent between renders
const CATEGORY_COLORS = {
    Food: '#e67e22',
    Rent: '#8e44ad',
    Transport: '#2980b9',
    Utilities: '#16a085',
    Entertainment: '#d35400',
    Shopping: '#c0392b',
    Health: '#27ae60',
    Other: '#7f8c8d'
};

let transactions = [];
try {
    const stored = JSON.parse(localStorage.getItem('transactions'));
    if (Array.isArray(stored)) transactions = stored;
} catch (e) {
    console.error('Could not read saved transactions, starting fresh.', e);
}

let chart = null;

// Populate the category dropdown based on the selected type
function populateCategories() {
    const type = form.querySelector('input[name="type"]:checked').value;
    categorySelect.innerHTML = '';
    CATEGORIES[type].forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });
}

form.querySelectorAll('input[name="type"]').forEach(radio => {
    radio.addEventListener('change', populateCategories);
});

// Add transaction
function addTransaction(e) {
    e.preventDefault();

    const trimmedText = text.value.trim();
    const parsedAmount = parseFloat(amount.value);

    if (trimmedText === '' || isNaN(parsedAmount) || parsedAmount <= 0) {
        alert('Please enter a name and an amount greater than 0');
        return;
    }

    const type = form.querySelector('input[name="type"]:checked').value;

    const transaction = {
        id: generateID(),
        text: trimmedText,
        amount: type === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
        type,
        category: categorySelect.value,
        date: new Date().toISOString()
    };

    transactions.push(transaction);
    updatelocalStorage();
    init();

    text.value = '';
    amount.value = '';
}

// Add transactions to DOM list (safe - no innerHTML with user input)
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    const label = document.createElement('span');
    label.className = 'tx-label';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'tx-name';
    nameSpan.textContent = transaction.text;
    const metaSpan = document.createElement('span');
    metaSpan.className = 'tx-meta';
    const dateStr = transaction.date ? new Date(transaction.date).toLocaleDateString() : '';
    metaSpan.textContent = `${transaction.category || 'Other'} · ${dateStr}`;
    label.appendChild(nameSpan);
    label.appendChild(metaSpan);

    const amountSpan = document.createElement('span');
    amountSpan.className = 'tx-amount';
    amountSpan.textContent = `${sign}$${Math.abs(transaction.amount).toFixed(2)}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'x';
    deleteBtn.addEventListener('click', () => removeTransaction(transaction.id));

    item.appendChild(label);
    item.appendChild(amountSpan);
    item.appendChild(deleteBtn);
    list.appendChild(item);
}

// Update the balance, income and expense
function updateValues() {
    const income = transactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => acc + t.amount, 0);
    const total = income + expense;

    balance.innerText = `$${total.toFixed(2)}`;
    moneyPlus.innerText = `+$${income.toFixed(2)}`;
    moneyMinus.innerText = `-$${Math.abs(expense).toFixed(2)}`;
}

// Build/update the expense-by-category chart
function updateChart() {
    const expenseTotals = {};
    transactions
        .filter(t => t.amount < 0)
        .forEach(t => {
            const cat = t.category || 'Other';
            expenseTotals[cat] = (expenseTotals[cat] || 0) + Math.abs(t.amount);
        });

    const labels = Object.keys(expenseTotals);
    const data = Object.values(expenseTotals);

    if (labels.length === 0) {
        chartCanvas.style.display = 'none';
        chartEmpty.style.display = 'block';
        if (chart) {
            chart.destroy();
            chart = null;
        }
        return;
    }

    chartCanvas.style.display = 'block';
    chartEmpty.style.display = 'none';

    const colors = labels.map(l => CATEGORY_COLORS[l] || '#95a5a6');

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].backgroundColor = colors;
        chart.update();
    } else {
        chart = new Chart(chartCanvas, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

// delete transaction by ID
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updatelocalStorage();
    init();
}

// Update local storage transactions
function updatelocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Export transactions as a CSV file
function exportCSV() {
    if (transactions.length === 0) {
        alert('No transactions to export yet.');
        return;
    }
    const header = ['Date', 'Name', 'Type', 'Category', 'Amount'];
    const rows = transactions.map(t => [
        t.date ? new Date(t.date).toISOString().slice(0, 10) : '',
        `"${(t.text || '').replace(/"/g, '""')}"`,
        t.type || (t.amount < 0 ? 'expense' : 'income'),
        t.category || 'Other',
        t.amount
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, 'transactions.csv', 'text/csv');
}

// Export transactions as a JSON file
function exportJSON() {
    if (transactions.length === 0) {
        alert('No transactions to export yet.');
        return;
    }
    downloadFile(JSON.stringify(transactions, null, 2), 'transactions.json', 'application/json');
}

// Import transactions from a previously exported JSON backup
function importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        let incoming;
        try {
            incoming = JSON.parse(e.target.result);
        } catch (err) {
            alert('That file is not valid JSON.');
            return;
        }
        if (!Array.isArray(incoming)) {
            alert('Expected a JSON file containing a list of transactions.');
            return;
        }

        const valid = incoming.every(t => t && typeof t.amount === 'number' && typeof t.text === 'string');
        if (!valid) {
            alert('That file does not look like an Expensify backup.');
            return;
        }

        const replace = confirm(
            'Replace your current transactions with this backup?\n\nOK = replace all\nCancel = merge with existing'
        );

        if (replace) {
            transactions = incoming;
        } else {
            const existingIds = new Set(transactions.map(t => t.id));
            incoming.forEach(t => {
                if (!existingIds.has(t.id)) {
                    transactions.push(t);
                } else {
                    // avoid ID collisions when merging
                    transactions.push({ ...t, id: generateID() });
                }
            });
        }

        updatelocalStorage();
        init();
        alert('Import complete.');
    };
    reader.onerror = () => alert('Could not read that file.');
    reader.readAsText(file);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// initialize app
function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    updateChart();
}

// Generate a unique-enough ID (timestamp + random suffix)
function generateID() {
    return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

form.addEventListener('submit', addTransaction);
exportCsvBtn.addEventListener('click', exportCSV);
exportJsonBtn.addEventListener('click', exportJSON);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importJSON(file);
    importFile.value = ''; // allow re-importing the same file later
});

populateCategories();
init();
