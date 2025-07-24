const memberForm = document.getElementById("member-form");
    const memberInput = document.getElementById("member-name");
    const memberList = document.getElementById("member-list");
    const payerSelect = document.getElementById("payer");

    const expenseForm = document.getElementById("expense-form");
    const amountInput = document.getElementById("amount");
    const descInput = document.getElementById("desc");
    const expenseDisplay = document.getElementById("expense-list");
    const balanceList = document.getElementById("balance-list");

    let members = JSON.parse(localStorage.getItem("members")) || [];
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    let editingMemberIndex = null;
    let editingExpenseIndex = null;

    memberForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = memberInput.value.trim();
      if (!name) return alert("Name cannot be empty.");
      if (editingMemberIndex !== null) {
        if (members.some((m, i) => m === name && i !== editingMemberIndex)) return alert("Name already exists.");
        members[editingMemberIndex] = name;
        editingMemberIndex = null;
        memberForm.querySelector("button").textContent = "Add Member";
      } else {
        if (members.includes(name)) return alert("Name already exists.");
        members.push(name);
      }
      localStorage.setItem("members", JSON.stringify(members));
      memberInput.value = "";
      updatePayerOptions();
      renderMembers();
      renderBalances();
    });

    expenseForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const payer = payerSelect.value;
      const amount = parseFloat(amountInput.value);
      const desc = descInput.value.trim();
      if (!payer || !amount || !desc) return alert("Please fill all fields.");
      const newExpense = { payer, amount, description: desc };
      if (editingExpenseIndex !== null) {
        expenses[editingExpenseIndex] = newExpense;
        editingExpenseIndex = null;
        expenseForm.querySelector("button").textContent = "Add Expense";
      } else {
        expenses.push(newExpense);
      }
      localStorage.setItem("expenses", JSON.stringify(expenses));
      amountInput.value = "";
      descInput.value = "";
      renderExpenses();
      renderBalances();
    });

    function renderMembers() {
      memberList.innerHTML = "";
      members.forEach((name, index) => {
        const li = document.createElement("li");
        li.textContent = name + " ";
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.marginLeft = "10px";
        editBtn.onclick = () => {
          memberInput.value = name;
          editingMemberIndex = index;
          memberForm.querySelector("button").textContent = "Update Member";
        };
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.marginLeft = "5px";
        deleteBtn.onclick = () => {
          if (confirm(`Delete member "${name}"? This will also remove their expenses.`)) {
            members.splice(index, 1);
            localStorage.setItem("members", JSON.stringify(members));
            renderMembers();
            updatePayerOptions();
            expenses = expenses.filter(exp => exp.payer !== name);
            localStorage.setItem("expenses", JSON.stringify(expenses));
            renderExpenses();
            renderBalances();
          }
        };
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        memberList.appendChild(li);
      });
      expenseForm.style.display = members.length === 0 ? "none" : "block";
    }

    function updatePayerOptions() {
      payerSelect.innerHTML = "";
      members.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        payerSelect.appendChild(option);
      });
    }

    function renderExpenses() {
      expenseDisplay.innerHTML = "";
      expenses.forEach((exp, index) => {
        const li = document.createElement("li");
        li.textContent = `${exp.payer} paid ₹${exp.amount} for ${exp.description} `;
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.marginLeft = "10px";
        editBtn.onclick = () => {
          payerSelect.value = exp.payer;
          amountInput.value = exp.amount;
          descInput.value = exp.description;
          editingExpenseIndex = index;
          expenseForm.querySelector("button").textContent = "Update Expense";
        };
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.marginLeft = "5px";
        deleteBtn.onclick = () => {
          if (confirm("Delete this expense?")) {
            expenses.splice(index, 1);
            localStorage.setItem("expenses", JSON.stringify(expenses));
            renderExpenses();
            renderBalances();
          }
        };
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        expenseDisplay.appendChild(li);
      });
    }

    function calculateBalances() {
      const paid = {}, balance = {};
      members.forEach(name => {
        paid[name] = 0;
        balance[name] = 0;
      });
      expenses.forEach(exp => {
        paid[exp.payer] += exp.amount;
      });
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      const share = total / members.length;
      members.forEach(name => {
        balance[name] = paid[name] - share;
      });
      return simplify(balance);
    }

    function simplify(balances) {
      const debtors = [], creditors = [];
      for (const name in balances) {
        const amt = balances[name];
        if (amt < -0.01) debtors.push({ name, amount: amt });
        else if (amt > 0.01) creditors.push({ name, amount: amt });
      }
      const txs = [];
      while (debtors.length && creditors.length) {
        const debtor = debtors[0];
        const creditor = creditors[0];
        const amt = Math.min(-debtor.amount, creditor.amount).toFixed(2);
        txs.push({ from: debtor.name, to: creditor.name, amount: amt });
        debtor.amount += parseFloat(amt);
        creditor.amount -= parseFloat(amt);
        if (Math.abs(debtor.amount) < 0.01) debtors.shift();
        if (Math.abs(creditor.amount) < 0.01) creditors.shift();
      }
      return txs;
    }

    function renderBalances() {
      balanceList.innerHTML = "";
      const txs = calculateBalances();
      if (txs.length === 0) {
        balanceList.innerHTML = "<li>All settled!</li>";
      } else {
        txs.forEach(tx => {
          const li = document.createElement("li");
          li.textContent = `${tx.from} owes ${tx.to} ₹${tx.amount}`;
          balanceList.appendChild(li);
        });
      }
    }

    renderMembers();
    updatePayerOptions();
    renderExpenses();
    renderBalances();
  function toggleMenu() {
    const menu = document.querySelector('.nav-links');
    menu.classList.toggle('active');
  }
