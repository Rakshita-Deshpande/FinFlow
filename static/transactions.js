const API = 'http://127.0.0.1:8000';

function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// Set today's date as default
window.onload = function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    loadTransactions();
}

async function loadTransactions() {
    try {
        const response = await fetch(`${API}/transactions`);
        const transactions = await response.json();

        const listDiv = document.getElementById('transactions-list');

        if (transactions.length === 0) {
            listDiv.innerHTML = '<p class="empty-state">No transactions yet. Add your first one above!</p>';
            return;
        }

        const sorted = transactions.reverse();
        listDiv.innerHTML = sorted.map(tx => `
            <div class="transaction-row">
                <div>
                    <p class="tx-title">${tx.title}</p>
                    <p class="tx-category">${tx.category} · ${tx.date} ${tx.notes ? '· ' + tx.notes : ''}</p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <span class="badge badge-${tx.type}">${tx.type}</span>
                    <span class="tx-amount ${tx.type}">
                        ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
                    </span>
                    <button onclick="deleteTransaction(${tx.id})" style="background:none; border:none; cursor:pointer; color:#e74c3c; font-size:18px;">🗑</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

async function addTransaction() {
    const title = document.getElementById('title').value.trim();
    const amount = document.getElementById('amount').value;
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const notes = document.getElementById('notes').value.trim();

    if (!title || !amount || !date) {
        alert('Please fill in title, amount and date!');
        return;
    }

    try {
        const response = await fetch(`${API}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title, 
                amount: parseFloat(amount), 
                type, 
                category, 
                date, 
                notes 
            })
        });

        if (response.ok) {
            document.getElementById('title').value = '';
            document.getElementById('amount').value = '';
            document.getElementById('notes').value = '';
            alert('Transaction added successfully!');
            loadTransactions();
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        alert('Error adding transaction. Please try again.');
    }
}

async function deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;

    try {
        await fetch(`${API}/transactions/${id}`, { method: 'DELETE' });
        loadTransactions();
    } catch (error) {
        console.error('Error deleting transaction:', error);
    }
}