const API = 'http://127.0.0.1:8000';

function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

window.onload = function() {
    const dateInput = document.getElementById('lend-date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    loadLending();
}

async function loadLending() {
    try {
        const response = await fetch(`${API}/lending`);
        const lendings = await response.json();

        const listDiv = document.getElementById('lending-list');
        const totalDiv = document.getElementById('total-pending');

        if (lendings.length === 0) {
            listDiv.innerHTML = '<p class="empty-state">No lending records yet. Log your first one above!</p>';
            totalDiv.textContent = '';
            return;
        }

        const pending = lendings.filter(l => !l.is_settled);
        const totalPending = pending.reduce((sum, l) => sum + l.amount, 0);

        if (totalPending > 0) {
            totalDiv.textContent = `Total owed: ${formatCurrency(totalPending)}`;
        }

        listDiv.innerHTML = lendings.map(l => `
            <div class="transaction-row">
                <div>
                    <p class="tx-title">${l.person_name}</p>
                    <p class="tx-category">${l.reason} · ${l.date}</p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <span class="badge ${l.is_settled ? 'badge-settled' : 'badge-pending'}">
                        ${l.is_settled ? 'Settled ✓' : 'Pending'}
                    </span>
                    <span class="tx-amount" style="color:${l.is_settled ? '#888' : '#f39c12'};">
                        ${formatCurrency(l.amount)}
                    </span>
                    ${!l.is_settled ? `
                        <button onclick="settleLending(${l.id})" class="btn" style="padding:6px 12px; font-size:12px;">
                            Mark Settled
                        </button>
                    ` : ''}
                    <button onclick="deleteLending(${l.id})" style="background:none; border:none; cursor:pointer; color:#e74c3c; font-size:18px;">🗑</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading lending:', error);
    }
}

async function addLending() {
    const person_name = document.getElementById('person-name').value.trim();
    const amount = document.getElementById('lend-amount').value;
    const reason = document.getElementById('lend-reason').value.trim();
    const date = document.getElementById('lend-date').value;

    if (!person_name || !amount || !reason || !date) {
        alert('Please fill in all fields!');
        return;
    }

    try {
        const response = await fetch(`${API}/lending`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                person_name,
                amount: parseFloat(amount),
                reason,
                date
            })
        });

        if (response.ok) {
            document.getElementById('person-name').value = '';
            document.getElementById('lend-amount').value = '';
            document.getElementById('lend-reason').value = '';
            alert('Lending logged successfully!');
            loadLending();
        }
    } catch (error) {
        console.error('Error adding lending:', error);
    }
}

async function settleLending(id) {
    if (!confirm('Mark this as settled?')) return;

    try {
        await fetch(`${API}/lending/${id}/settle`, { method: 'PUT' });
        loadLending();
    } catch (error) {
        console.error('Error settling lending:', error);
    }
}

async function deleteLending(id) {
    if (!confirm('Delete this record?')) return;

    try {
        await fetch(`${API}/lending/${id}`, { method: 'DELETE' });
        loadLending();
    } catch (error) {
        console.error('Error deleting lending:', error);
    }
}