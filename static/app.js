// Base API URL
const API = 'http://127.0.0.1:8000';

// Format currency in Indian Rupees
function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// Load dashboard stats
async function loadDashboard() {
    try {
        const response = await fetch(`${API}/transactions`);
        const transactions = await response.json();

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(tx => {
            if (tx.type === 'income') {
                totalIncome += tx.amount;
            } else {
                totalExpense += tx.amount;
            }
        });

        const balance = totalIncome - totalExpense;

        document.getElementById('total-balance').textContent = formatCurrency(balance);
        document.getElementById('total-income').textContent = formatCurrency(totalIncome);
        document.getElementById('total-expense').textContent = formatCurrency(totalExpense);

        // Load recent transactions
        const recentDiv = document.getElementById('recent-transactions');

        if (transactions.length === 0) {
            recentDiv.innerHTML = '<p class="empty-state">No transactions yet. Add your first one!</p>';
            return;
        }

        const recent = transactions.slice(-5).reverse();
        recentDiv.innerHTML = recent.map(tx => `
            <div class="transaction-row">
                <div>
                    <p class="tx-title">${tx.title}</p>
                    <p class="tx-category">${tx.category} · ${tx.date}</p>
                </div>
                <span class="tx-amount ${tx.type}">
                    ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
                </span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load lending total
async function loadLendingTotal() {
    try {
        const response = await fetch(`${API}/lending`);
        const lendings = await response.json();

        const totalLent = lendings
            .filter(l => !l.is_settled)
            .reduce((sum, l) => sum + l.amount, 0);

        document.getElementById('total-lent').textContent = formatCurrency(totalLent);
    } catch (error) {
        document.getElementById('total-lent').textContent = '₹0';
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('total-balance')) {
        loadDashboard();
        loadLendingTotal();
    }
});