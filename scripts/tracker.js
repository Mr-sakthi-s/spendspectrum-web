let currentMain = 'all';
let currentType = 'income';

const data = {
  all: { income: [], expense: [] }
};

function toggleMenu() {
  const menu = document.querySelector('.nav-links');
  menu.classList.toggle('active');
}

function switchTypeTab(tab, e) {
  currentType = tab;
  document.querySelectorAll('.type-tabs .tab-button').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  renderForm();
  renderList();
}

function renderForm() {
  const formContainer = document.getElementById('formContainer');
  const historyContainer = document.getElementById('historyContainer');
  historyContainer.innerHTML = '';

  if (currentType === 'history') {
    formContainer.innerHTML = '';
    historyContainer.innerHTML = `
      <label for="historyFilter">Filter By:</label>
      <select id="historyFilter" onchange="renderList()">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <table id="entryTable">
        <thead>
          <tr>
            <th>Period</th>
            <th>Category</th>
            <th>Payment</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody id="entryList"></tbody>
      </table>
      <div class="summary-total" id="totalDisplay"></div>
      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
  <div class="download-button">
    <button onclick="downloadCSV()">Download Expense Data as CSV</button>
  </div>
  <div class="download-button">
    <button onclick="clearData()">Clear All Data</button>
  </div>
</div>

    `;
    return;
  }

  formContainer.innerHTML = `
    <label for="title">Category</label>
    <input type="text" id="title" placeholder="e.g. Food, Transport, Salary" />
    <label for="amount">Amount (₹)</label>
    <input type="number" id="amount" placeholder="Enter amount" />
    <label for="payment">Payment Type</label>
    <select id="payment">
      <option value="Cash">Cash</option>
      <option value="Card">Card</option>
      <option value="UPI">UPI</option>
    </select>
    <button onclick="addEntry()">Add Entry</button>
  `;
}

function addEntry() {
  const title = document.getElementById('title').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const payment = document.getElementById('payment').value;
  const date = new Date().toLocaleDateString('en-GB');

  if (!title || isNaN(amount)) return alert("Please fill all fields correctly.");
  const entry = { title, amount, payment, date };
  data.all[currentType].push(entry);
  saveToLocalStorage(entry, currentType);
  document.getElementById('title').value = '';
  document.getElementById('amount').value = '';
  renderList();
}

function saveToLocalStorage(entry, type) {
  const existing = JSON.parse(localStorage.getItem("expenseData")) || {
    daily: { income: [], expense: [] }
  };

  existing.daily[type].push({ ...entry });

  localStorage.setItem("expenseData", JSON.stringify(existing));
}

function renderList() {
  if (currentType !== 'history') return;

  const stored = JSON.parse(localStorage.getItem("expenseData")) || {
    daily: { income: [], expense: [] }
  };

  const filter = document.getElementById('historyFilter')?.value || 'daily';
  const combined = [...stored.daily.income, ...stored.daily.expense];

  const entryList = document.getElementById('entryList');
  const totalDisplay = document.getElementById('totalDisplay');
  entryList.innerHTML = '';
  let total = 0;

  combined.slice().reverse().forEach(e => {
    const isIncome = stored.daily.income.includes(e);
    const displayDate = getDisplayDate(e.date, filter);
    const sign = isIncome ? '+' : '-';
    const row = document.createElement('tr');
    row.innerHTML = `<td>${displayDate}</td><td>${e.title}</td><td>${e.payment}</td><td>${sign} ₹${e.amount}</td>`;
    entryList.appendChild(row);
    total += isIncome ? e.amount : -e.amount;
  });

  totalDisplay.textContent = `Total: ₹${total.toFixed(2)}`;
}

function getDisplayDate(dateStr, filter) {
  const [day, month, year] = dateStr.split('/');
  const dateObj = new Date(`${year}-${month}-${day}`);

  if (filter === 'monthly') {
    return `${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;
  }
  if (filter === 'weekly') {
    const start = getWeekStart(dateObj);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('en-GB')} - ${end.toLocaleDateString('en-GB')}`;
  }
  return dateStr;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function downloadCSV() {
  const stored = JSON.parse(localStorage.getItem("expenseData")) || {
    daily: { income: [], expense: [] }
  };

  let csv = "Type,Date,Category,Amount,Payment\n";
  ["income", "expense"].forEach(type => {
    stored.daily[type].forEach(entry => {
      const row = [
        type,
        entry.date,
        entry.title,
        entry.amount,
        entry.payment
      ];
      csv += row.join(",") + "\n";
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `SmartExpenseData_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

renderForm();
renderList();
function clearData() {
  const confirmClear = confirm("Are you sure you want to delete all your saved data?");
  if (confirmClear) {
    localStorage.removeItem("expenseData");
    alert("Data cleared successfully.");
    renderList(); // Refresh the history view
  }
}
