document.addEventListener("DOMContentLoaded", function() {
    const expenseForm = document.getElementById("expense-input");
    const expenseDateInput = document.getElementById("expenseDate"); // Updated ID to match welcome.html
    const expenseNameInput = document.getElementById("expenseName"); // Updated ID to match welcome.html
    const expenseAmountInput = document.getElementById("expenseAmount"); // Updated ID to match welcome.html
    const expenseTableBody = document.querySelector("#expenseTable tbody");
    const totalExpenditureDisplay = document.getElementById("totalExpenditure");

    // Fetch and display expenses on page load
    fetchExpenses();

    expenseForm.addEventListener("submit", function(event) {
        event.preventDefault();
        addExpense();
    });

    async function fetchExpenses() {
        try {
            const response = await fetch("/expenses");
            const expenses = await response.json();
            displayExpenses(expenses);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    }

    function displayExpenses(expenses) {
        expenseTableBody.innerHTML = ""; // Clear current expenses
        expenses.forEach(expense => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.name}</td>
                <td>${expense.amount}</td>
                <td><button class="delete-btn" data-id="${expense.id}">Delete</button></td>
            `;
            expenseTableBody.appendChild(row);
        });

        // Add delete functionality
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function() {
                const expenseId = this.getAttribute("data-id");
                deleteExpense(expenseId);
            });
        });

        updateTotalExpenditure();
    }

    async function addExpense() {
        const date = expenseDateInput.value;
        const name = expenseNameInput.value;
        const amount = parseFloat(expenseAmountInput.value);

        if (!date || !name || isNaN(amount)) {
            alert("Please enter valid expense details.");
            return;
        }

        const expense = { date, name, amount };

        try {
            const response = await fetch("/expenses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expense)
            });

            const newExpense = await response.json();
            expenseTableBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${newExpense.date}</td>
                    <td>${newExpense.name}</td>
                    <td>${newExpense.amount}</td>
                    <td><button class="delete-btn" data-id="${newExpense.id}">Delete</button></td>
                </tr>
            `);

            // Add delete functionality for the new row
            const deleteButton = expenseTableBody.querySelector(`.delete-btn[data-id="${newExpense.id}"]`);
            deleteButton.addEventListener("click", function() {
                const expenseId = this.getAttribute("data-id");
                deleteExpense(expenseId);
            });

            // Clear inputs
            expenseDateInput.value = "";
            expenseNameInput.value = "";
            expenseAmountInput.value = "";

            updateTotalExpenditure();

        } catch (error) {
            console.error("Error adding expense:", error);
        }
    }

    async function deleteExpense(expenseId) {
        try {
            await fetch(`/expenses/${expenseId}`, {
                method: "DELETE"
            });

            fetchExpenses(); // Refresh the list of expenses

        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    }

    // Helper function to update total expenditure display
    function updateTotalExpenditure() {
        let totalExpenditure = Array.from(expenseTableBody.querySelectorAll('tr')).reduce((sum, row) => {
            const amount = parseFloat(row.children[2].innerText);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        totalExpenditureDisplay.innerText = `Total Expenditure: ${totalExpenditure.toFixed(2)}`;
    }

    // Salary functionality
    document.querySelector('.set-salary').addEventListener('click', function() {
        const salary = parseFloat(prompt("Enter your monthly salary:"));
        
        if (isNaN(salary)) {
            alert("Please enter a valid salary.");
            return;
        }

        let totalExpenditure = Array.from(expenseTableBody.querySelectorAll('tr')).reduce((sum, row) => {
            const amount = parseFloat(row.children[2].innerText);
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        if (totalExpenditure > salary) {
            alert("Budget exceeds the salary.");
        } else {
            alert("You are within your budget.");
        }
    });
});
