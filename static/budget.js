const API = 'http://127.0.0.1:8000';

function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

window.onload = function() {
    const monthInput = document.getElementById('budget-month');
    if (monthInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        monthInput.value = `${yyyy}-${mm}`;
    }
    loadBudgets();
}

async function loadBudgets() {
    try {
        const response = await fetch(`${API}/budgets`);
        const budgets = await response.json();

        const listDiv = document.getElementById('budget-list');

        if (budgets.length === 0) {
            listDiv.innerHTML = '<p class="empty-state">No budgets set yet. Add your first one above!</p>';
            return;
        }

        listDiv.innerHTML = budgets.map(b => {
            let statusClass = 'badge-settled';
            let statusText = 'On track';
            if (b.percentage >= 100) {
                statusClass = 'badge-expense';
                statusText = 'Over budget!';
            } else if (b.percentage >= 80) {
                statusClass = 'badge-pending';
                statusText = 'Almost there';
            }

            return `
                <div class="section" style="margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                            <strong>${b.category}</strong>
                            <span style="color:#888; font-size:13px; margin-left:8px;">${b.month}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span class="badge ${statusClass}">${statusText}</span>
                            <span style="font-size:13px; color:#888;">${formatCurrency(b.spent)} / ${formatCurrency(b.amount)}</span>
                            <button onclick="deleteBudget(${b.id})" style="background:none; border:none; cursor:pointer; color:#e74c3c; font-size:18px;">🗑</button>
                        </div>
                    </div>
                    <div style="background:#f0f0f0; border-radius:4px; height:10px;">
                        <div style="width:${Math.min(b.percentage, 100)}%; height:10px; border-radius:4px; background:${b.percentage >= 100 ? '#e74c3c' : b.percentage >= 80 ? '#f39c12' : '#2ecc71'}; transition: width 0.3s;"></div>
                    </div>
                    <p style="font-size:12px; color:#888; margin-top:6px;">${b.percentage}% used · ${formatCurrency(b.remaining)} remaining</p>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading budgets:', error);
    }
}

async function addBudget() {
    const category = document.getElementById('budget-category').value;
    const amount = document.getElementById('budget-amount').value;
    const month = document.getElementById('budget-month').value;

    if (!amount || !month) {
        alert('Please fill in amount and month!');
        return;
    }

    try {
        const response = await fetch(`${API}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category,
                amount: parseFloat(amount),
                month
            })
        });

        if (response.ok) {
            document.getElementById('budget-amount').value = '';
            alert('Budget set successfully!');
            loadBudgets();
        }
    } catch (error) {
        console.error('Error adding budget:', error);
    }
}

async function deleteBudget(id) {
    if (!confirm('Delete this budget?')) return;

    try {
        await fetch(`${API}/budgets/${id}`, { method: 'DELETE' });
        loadBudgets();
    } catch (error) {
        console.error('Error deleting budget:', error);
    }
}