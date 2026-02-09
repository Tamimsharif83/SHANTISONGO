// Chart Initialization for Admin Dashboard
// Note: Chart variables are declared in admindashboard.js

function initializeCharts() {
    // Wait for Chart.js to load
    if (typeof Chart === 'undefined') {
        setTimeout(initializeCharts, 100);
        return;
    }
    
    initTransactionChart();
    initInvestmentChart();
}

function initTransactionChart() {
    const ctx = document.getElementById('transactionChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (transactionChart) {
        transactionChart.destroy();
    }
    
    // Dummy data for the last 6 months
    const labels = ['July', 'August', 'September', 'October', 'November', 'December'];
    const deposits = [2.1, 2.4, 2.2, 2.8, 2.6, 3.1];
    const withdrawals = [1.2, 1.5, 1.3, 1.6, 1.4, 1.8];
    const investments = [0.8, 1.0, 0.9, 1.2, 1.1, 1.3];
    
    transactionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Deposits',
                    data: deposits,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Withdrawals',
                    data: withdrawals,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Investments',
                    data: investments,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += '৳' + context.parsed.y.toFixed(1) + 'M';
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '৳' + value + 'M';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initInvestmentChart() {
    const ctx = document.getElementById('investmentChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (investmentChart) {
        investmentChart.destroy();
    }
    
    // Dummy data for investment distribution
    const data = [
        { label: 'Monthly Share', value: 3.2, color: '#4CAF50' },
        { label: 'Fixed Deposit', value: 2.8, color: '#2196F3' },
        { label: 'Savings Account', value: 1.5, color: '#FF9800' },
        { label: 'Business Investment', value: 0.8, color: '#9C27B0' }
    ];
    
    investmentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.label),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: data.map(d => d.color),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return label + ': ৳' + value.toFixed(1) + 'M (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Initialize charts when dashboard is shown
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeCharts, 500);
});

// Re-initialize charts on window resize for responsiveness
window.addEventListener('resize', function() {
    if (transactionChart || investmentChart) {
        setTimeout(initializeCharts, 100);
    }
});
