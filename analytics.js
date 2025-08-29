document.addEventListener('DOMContentLoaded', () => {
    const viewSelect = document.getElementById('view-select');
    const reportSelect = document.getElementById('report-select');
    const chartCanvas = document.getElementById('chartCanvas');
    const tableContainer = document.getElementById('tableContainer');
    let myChart = null;

    const chartOptions = {
        'Продажі по днях': 'salesByDay',
        'Ліди по днях': 'leadsByDay',
        'Повторні покупки': 'repeatPurchases',
        'Оборот (Revenue) по місяцях': 'revenueByMonth',
        'Продажі по менеджерах': 'salesByManager'
    };

    const tableOptions = {
        'Дохід по менеджерах': 'managerRevenueTable',
        'Товари з низьким обігом': 'lowTurnoverProductsTable'
    };

    const updateReportSelect = () => {
        reportSelect.innerHTML = '';
        let options = viewSelect.value === 'charts' ? chartOptions : tableOptions;

        for (const [text, value] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            reportSelect.appendChild(option);
        }
    };

    const processData = (data) => {
        const salesByDay = data.reduce((acc, sale) => {
            acc[sale.date] = (acc[sale.date] || 0) + sale.amount;
            return acc;
        }, {});

        const leadsByDay = data.reduce((acc, sale) => {
            if (sale.isLead) {
                acc[sale.date] = (acc[sale.date] || 0) + 1;
            }
            return acc;
        }, {});

        const repeatPurchases = data.reduce((acc, sale) => {
            acc[sale.customerId] = (acc[sale.customerId] || 0) + 1;
            return acc;
        }, {});
        const singlePurchaseCount = Object.values(repeatPurchases).filter(c => c === 1).length;
        const repeatPurchaseCount = Object.values(repeatPurchases).filter(c => c > 1).length;

        const revenueByMonth = data.reduce((acc, sale) => {
            const month = sale.date.substring(0, 7);
            acc[month] = (acc[month] || 0) + sale.amount;
            return acc;
        }, {});

        const salesByManager = data.reduce((acc, sale) => {
            acc[sale.manager] = (acc[sale.manager] || 0) + sale.amount;
            return acc;
        }, {});

        const managerRevenueData = data.reduce((acc, sale) => {
            if (!acc[sale.manager]) {
                acc[sale.manager] = { orders: 0, revenue: 0 };
            }
            acc[sale.manager].orders += 1;
            acc[sale.manager].revenue += sale.amount;
            return acc;
        }, {});
        const managerRevenueTableData = Object.keys(managerRevenueData).map(manager => {
            const { orders, revenue } = managerRevenueData[manager];
            const avgCheck = (revenue / orders).toFixed(2);
            return { manager, orders, revenue, avgCheck };
        });

        const lowTurnoverData = data.reduce((acc, sale) => {
            if (!acc[sale.product]) {
                acc[sale.product] = { units: 0, revenue: 0 };
            }
            acc[sale.product].units += 1;
            acc[sale.product].revenue += sale.amount;
            return acc;
        }, {});
        const lowTurnoverTableData = Object.keys(lowTurnoverData).map(product => {
            const { units, revenue } = lowTurnoverData[product];
            return { product, units, revenue };
        }).sort((a, b) => a.revenue - b.revenue);

        return {
            salesByDay,
            leadsByDay,
            repeatPurchases: { singlePurchaseCount, repeatPurchaseCount },
            revenueByMonth,
            salesByManager,
            managerRevenueTableData,
            lowTurnoverTableData
        };
    };

    const showChart = (chartType, processedData) => {
        if (myChart) myChart.destroy();

        const compactOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 11 }
                    }
                }
            },
            layout: { padding: 10 }
        };

        const chartConfig = {
            'salesByDay': {
                type: 'line',
                data: {
                    labels: Object.keys(processedData.salesByDay),
                    datasets: [{
                        label: 'Продажі по днях',
                        data: Object.values(processedData.salesByDay),
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                }
            },
            'leadsByDay': {
                type: 'bar',
                data: {
                    labels: Object.keys(processedData.leadsByDay),
                    datasets: [{
                        label: 'Ліди по днях',
                        data: Object.values(processedData.leadsByDay),
                        backgroundColor: '#e74c3c'
                    }]
                }
            },
            'repeatPurchases': {
                type: 'pie',
                data: {
                    labels: ['Одноразові покупки', 'Повторні покупки'],
                    datasets: [{
                        data: [
                            processedData.repeatPurchases.singlePurchaseCount,
                            processedData.repeatPurchases.repeatPurchaseCount
                        ],
                        backgroundColor: ['#2ecc71', '#f1c40f']
                    }]
                },
                options: compactOptions
            },
            'revenueByMonth': {
                type: 'line',
                data: {
                    labels: Object.keys(processedData.revenueByMonth),
                    datasets: [{
                        label: 'Оборот (Revenue) по місяцях',
                        data: Object.values(processedData.revenueByMonth),
                        borderColor: '#9b59b6',
                        backgroundColor: 'rgba(155, 89, 182, 0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                }
            },
            'salesByManager': {
                type: 'radar',
                data: {
                    labels: Object.keys(processedData.salesByManager),
                    datasets: [{
                        label: 'Продажі по менеджерах',
                        data: Object.values(processedData.salesByManager),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgb(54, 162, 235)',
                        pointBackgroundColor: 'rgb(54, 162, 235)'
                    }]
                },
                options: compactOptions
            }
        };

        if (chartConfig[chartType]) {
            chartCanvas.style.display = 'block';
            tableContainer.style.display = 'none';
            chartCanvas.parentElement.style.width = "600px";
            chartCanvas.parentElement.style.height = "300px";
            myChart = new Chart(chartCanvas, chartConfig[chartType]);
        }
    };

    const showTable = (tableType, processedData) => {
        chartCanvas.style.display = 'none';
        tableContainer.style.display = 'block';
        tableContainer.innerHTML = '';

        let data = [];
        let headers = [];

        if (tableType === 'managerRevenueTable') {
            data = processedData.managerRevenueTableData;
            headers = [
                { label: 'Manager', key: 'manager' },
                { label: 'Orders', key: 'orders' },
                { label: 'Revenue', key: 'revenue' },
                { label: 'Avg Check', key: 'avgCheck' }
            ];
        } else if (tableType === 'lowTurnoverProductsTable') {
            data = processedData.lowTurnoverTableData;
            headers = [
                { label: 'Product', key: 'product' },
                { label: 'Units', key: 'units' },
                { label: 'Revenue', key: 'revenue' }
            ];
        }

        if (data.length > 0) {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            const headerRow = document.createElement('tr');
            headers.forEach(h => {
                const th = document.createElement('th');
                th.textContent = h.label;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            data.forEach(item => {
                const row = document.createElement('tr');
                headers.forEach(h => {
                    const td = document.createElement('td');
                    td.textContent = item[h.key];
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            tableContainer.appendChild(table);
        } else {
            tableContainer.textContent = 'Немає даних для відображення.';
        }
    };

    const initApp = async () => {
        try {
            const response = await fetch('sales_february_2025.json');
            if (!response.ok) throw new Error(`HTTP помилка! Статус: ${response.status}`);
            const rawData = await response.json();

            if (!rawData.sales || !Array.isArray(rawData.sales)) {
                console.error("Недійсний формат даних. Очікується масив 'sales'.");
                return;
            }

            const processedData = processData(rawData.sales);

            viewSelect.addEventListener('change', () => {
                updateReportSelect();
                reportSelect.dispatchEvent(new Event('change'));
            });
            reportSelect.addEventListener('change', () => {
                if (viewSelect.value === 'charts') {
                    showChart(reportSelect.value, processedData);
                } else {
                    showTable(reportSelect.value, processedData);
                }
            });

            updateReportSelect();
            reportSelect.dispatchEvent(new Event('change'));

        } catch (error) {
            console.error("Не вдалося завантажити або обробити дані:", error);
            document.getElementById('visualization-container').innerHTML =
                '<p>Не вдалося завантажити дані. Перевірте файл json.</p>';
        }
    };

    initApp();
});
