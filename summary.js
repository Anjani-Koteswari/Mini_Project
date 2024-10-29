document.addEventListener('DOMContentLoaded', function() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const categoryMappings = {
        'Food': ['sugar', 'salt', 'groceries'],
        'House rent': ['rent'],
        'Education': ['books', 'tuition'],
        'Electricity': ['electricity', 'utilities'],
        'Transport': ['bus', 'taxi', 'fuel'],
        'Miscellaneous': ['miscellaneous', 'other']
    };

    function updateLineChart() {
        const ctx = document.getElementById('chartCanvas').getContext('2d');
        const chartData = {
            labels: expenses.map(expense => expense.name), // Displaying expense names as labels
            datasets: [{
                label: 'Expenses',
                data: expenses.map(expense => expense.amount),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#4CAF50'
                        },
                        grid: {
                            color: '#ddd'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#4CAF50'
                        },
                        grid: {
                            color: '#ddd'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#4CAF50'
                        }
                    }
                }
            }
        });
    }

    function categorizeExpenses(expenses) {
        const categorizedExpenses = {};

        expenses.forEach(expense => {
            for (const [category, items] of Object.entries(categoryMappings)) {
                if (items.includes(expense.name.toLowerCase())) {
                    if (!categorizedExpenses[category]) {
                        categorizedExpenses[category] = [];
                    }
                    categorizedExpenses[category].push(expense);
                    return;
                }
            }
            if (!categorizedExpenses['Miscellaneous']) {
                categorizedExpenses['Miscellaneous'] = [];
            }
            categorizedExpenses['Miscellaneous'].push(expense);
        });

        return categorizedExpenses;
    }

    function updateExpenditureTable() {
        const tableBody = document.getElementById('expenditureTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';

        const categorizedExpenses = categorizeExpenses(expenses);

        for (const [category, items] of Object.entries(categorizedExpenses)) {
            const row = document.createElement('tr');
            
            const categoryCell = document.createElement('td');
            categoryCell.textContent = category;
            row.appendChild(categoryCell);

            const itemsCell = document.createElement('td');
            const itemsList = document.createElement('ul');
            items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item.name;
                itemsList.appendChild(listItem);
            });
            itemsCell.appendChild(itemsList);
            row.appendChild(itemsCell);

            const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
            const amountsCell = document.createElement('td');
            amountsCell.textContent = totalAmount;
            row.appendChild(amountsCell);

            tableBody.appendChild(row);
        }
    }

    updateLineChart();
    updateExpenditureTable();
});
