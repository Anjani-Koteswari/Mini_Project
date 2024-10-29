document.addEventListener('DOMContentLoaded', function () {
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
    let salary = parseFloat(localStorage.getItem('salary')) || 0;

    const expenseForm = document.getElementById('expense-input');
    const expenseNameInput = document.getElementById('expenseName');
    const expenseAmountInput = document.getElementById('expenseAmount');
    const expenseTableBody = document.querySelector('#expenseTable tbody');
    const showSummaryBtn = document.querySelector('.show-summary');
    const setSalaryBtn = document.querySelector('.set-salary');
    const showPieChartBtn = document.querySelector('.show-pie-chart');
    const showBarChartBtn = document.querySelector('.show-bar-chart');
    const setBudgetBtn = document.querySelector('.set-budget');

    const pieChartCanvas = document.getElementById('myPieChart');
    const barChartCanvas = document.getElementById('myBarChart');
    let currentChart = null; // Track the current chart

    if (expenseForm && expenseNameInput && expenseAmountInput && expenseTableBody) {
        updateTable();

        expenseForm.addEventListener('submit', function (event) {
            event.preventDefault();
            addExpense();
        });

        showSummaryBtn?.addEventListener('click', function () {
            window.open('summary.html', '_blank');
        });

        setSalaryBtn?.addEventListener('click', function () {
            const salaryInput = parseFloat(prompt('Enter your monthly Income'));
            if (!isNaN(salaryInput) && salaryInput > 0) {
                salary = salaryInput;
                localStorage.setItem('salary', salary);
                alert(`Monthly Salary set: ${salary}`);
            } else {
                alert('Please enter a valid salary amount.');
            }
        });

        showPieChartBtn?.addEventListener('click', function () {
            showPieChart();
        });

        showBarChartBtn?.addEventListener('click', function () {
            showBarChart();
        });

        setBudgetBtn?.addEventListener('click', function () {
            const budgetInputName = prompt('Enter the expense name for the budget:');
            const budgetInputAmount = parseFloat(prompt('Enter the budget amount:'));
            if (budgetInputName && !isNaN(budgetInputAmount) && budgetInputAmount > 0) {
                budgets[budgetInputName] = budgetInputAmount;
                localStorage.setItem('budgets', JSON.stringify(budgets));
                alert(`Budget for ${budgetInputName} set: ${budgetInputAmount}`);
            } else {
                alert('Please enter valid budget details.');
            }
        });

        function addExpense() {
            const name = expenseNameInput.value;
            const amount = parseFloat(expenseAmountInput.value);

            if (name && !isNaN(amount)) {
                const expense = { name, amount };
                expenses.push(expense);
                localStorage.setItem('expenses', JSON.stringify(expenses));
                updateTable();
                checkBudgetAlert(name, amount);
                clearInputs();
                checkSalaryAlert(); // Check salary alert for next month
            } else {
                alert('Please fill in all fields.');
            }
        }

        function updateTable() {
            expenseTableBody.innerHTML = '';
            expenses.forEach((expense, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date().toLocaleDateString()}</td>
                    <td>${expense.name}</td>
                    <td>${expense.amount.toFixed(2)}</td>
                    <td>
                        <button class="btn edit-expense" data-index="${index}">Edit</button>
                        <button class="btn delete-expense" data-index="${index}">Delete</button>
                    </td>
                `;
                expenseTableBody.appendChild(row);
            });
            updateTotal();
            attachEventListeners();
        }

        function updateTotal() {
            const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            const totalExpenditureElement = document.getElementById('totalExpenditure');
            if (totalExpenditureElement) {
                totalExpenditureElement.textContent = `Total Expenditure: ${total.toFixed(2)}`;
            } else {
                console.error('Element with id "totalExpenditure" not found.');
            }
        }

        function checkSalaryAlert() {
            const totalExpenditure = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            if (salary > 0 && totalExpenditure > salary) {
                alert('Warning: Budget exceeds the salary for this month!');
            }
        }

        function clearInputs() {
            expenseNameInput.value = '';
            expenseAmountInput.value = '';
        }

        function checkBudgetAlert(name, amount) {
            if (budgets[name] && amount > budgets[name]) {
                alert(`Warning: You have exceeded the budget for ${name}!`);
            }
        }

        function showPieChart() {
            hideCurrentChart(); // Hide any currently displayed chart
            pieChartCanvas.style.display = 'block';

            const data = {};
            expenses.forEach(expense => {
                data[expense.name] = (data[expense.name] || 0) + expense.amount;
            });

            currentChart = new Chart(pieChartCanvas, {
                type: 'pie',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label: 'Expenses',
                        data: Object.values(data),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Expense Distribution'
                        }
                    }
                }
            });
        }

        function showBarChart() {
            hideCurrentChart(); // Hide any currently displayed chart
            barChartCanvas.style.display = 'block';

            const data = {};
            expenses.forEach(expense => {
                data[expense.name] = (data[expense.name] || 0) + expense.amount;
            });

            currentChart = new Chart(barChartCanvas, {
                type: 'bar',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label: 'Expenses',
                        data: Object.values(data),
                        backgroundColor: '#36A2EB',
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Expenses Bar Chart'
                        }
                    }
                }
            });
        }

        function hideCurrentChart() {
            if (currentChart) {
                currentChart.destroy(); // Destroy the current chart
            }
            // Hide both canvases
            pieChartCanvas.style.display = 'none';
            barChartCanvas.style.display = 'none';
        }

        function deleteExpense(index) {
            expenses.splice(index, 1); // Remove the expense from the array
            localStorage.setItem('expenses', JSON.stringify(expenses)); // Update local storage
            updateTable(); // Refresh the table to reflect the changes
        }

        function editExpense(index) {
            const expense = expenses[index];
            expenseNameInput.value = expense.name;
            expenseAmountInput.value = expense.amount;

            // Remove the expense from the array and local storage after editing
            expenses.splice(index, 1);
            localStorage.setItem('expenses', JSON.stringify(expenses));

            // Update the table to reflect the change
            updateTable();
        }

        function attachEventListeners() {
            document.querySelectorAll('.edit-expense').forEach(button => {
                button.addEventListener('click', function () {
                    const index = this.getAttribute('data-index');
                    editExpense(index);
                });
            });

            document.querySelectorAll('.delete-expense').forEach(button => {
                button.addEventListener('click', function () {
                    const index = this.getAttribute('data-index');
                    const confirmDelete = confirm('Are you sure you want to delete this expense?');
                    if (confirmDelete) {
                        deleteExpense(index); // Call the delete function
                    }
                });
            });
        }

        attachEventListeners();
    } else {
        console.error('Some form elements are missing.');
    }
});
