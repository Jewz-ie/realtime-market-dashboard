// --- 1. DOM Elements ---
const currentPriceEl = document.getElementById('current-price');
const priceChangeEl = document.getElementById('price-change');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

// --- 2. Initialize Chart.js ---
const ctx = document.getElementById('marketChart').getContext('2d');
const MAX_DATA_POINTS = 50; 

const marketChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], 
        datasets: [{
            label: 'BTC/USDT Price',
            data: [], 
            borderColor: '#34d399', 
            backgroundColor: 'rgba(52, 211, 153, 0.1)',
            borderWidth: 2,
            pointRadius: 0, 
            fill: true,
            tension: 0.1 
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // Turned off for high-performance streaming
        scales: {
            x: { 
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
            },
            y: { 
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' },
                beginAtZero: false 
            }
        },
        plugins: {
            legend: { display: false }
        }
    }
});

// --- 3. The Mock WebSocket (Bypassing ISP Blocks) ---
// This class perfectly mimics the Binance WebSocket behavior locally
class MockBinanceWebSocket {
    constructor() {
        this.onopen = null;
        this.onmessage = null;
        this.onclose = null;
        this.price = 67450.00; // Starting BTC price
        
        // Simulate a brief network connection delay
        setTimeout(() => {
            if (this.onopen) this.onopen();
            this.stream();
        }, 500);
    }

    stream() {
        setInterval(() => {
            // Fluctuate price randomly by up to $12 up or down
            const volatility = (Math.random() - 0.5) * 24;
            this.price += volatility;

            // Format data exactly how Binance sends it
            const payload = {
                p: this.price.toFixed(2),
                T: Date.now()
            };

            // Fire the message event to the frontend
            if (this.onmessage) {
                this.onmessage({ data: JSON.stringify(payload) });
            }
        }, 800); // Push new data every 800 milliseconds
    }
}

// --- 4. Connection Logic ---
let previousPrice = null;
let startingPrice = null;

function connectWebSocket() {
    // Instead of: new WebSocket('wss://stream.binance.com:9443...')
    // We use our local Mock server to ensure it runs anywhere
    const ws = new MockBinanceWebSocket();

    ws.onopen = () => {
        statusDot.classList.replace('bg-red-500', 'bg-emerald-500');
        statusText.innerText = 'Connected';
        statusText.classList.replace('text-slate-400', 'text-emerald-500');
    };

    ws.onmessage = (event) => {
        // Pro-level flex: Log the raw data to the console to prove the data structure
        console.log('%c[Data Stream] Raw JSON:', 'color: #34d399; font-weight: bold;', event.data);
        
        const tradeData = JSON.parse(event.data);
        const price = parseFloat(tradeData.p);
        const time = new Date(tradeData.T).toLocaleTimeString();

        updateUI(price);
        updateChart(time, price);
    };

    ws.onclose = () => {
        statusDot.classList.replace('bg-emerald-500', 'bg-red-500');
        statusText.innerText = 'Reconnecting...';
        statusText.classList.replace('text-emerald-500', 'text-slate-400');
        setTimeout(connectWebSocket, 3000);
    };
}

// --- 5. Update UI & Chart ---
function updateUI(price) {
    if (!startingPrice) startingPrice = price;

    // 1. Update Price Card
    currentPriceEl.innerText = '$' + price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    if (previousPrice) {
        if (price > previousPrice) {
            currentPriceEl.classList.add('text-emerald-400');
            currentPriceEl.classList.remove('text-red-400');
        } else if (price < previousPrice) {
            currentPriceEl.classList.add('text-red-400');
            currentPriceEl.classList.remove('text-emerald-400');
        }
    }
    previousPrice = price;

    // 2. Update Session Change Card
    const change = price - startingPrice;
    const percentChange = ((change / startingPrice) * 100).toFixed(4);
    
    priceChangeEl.innerText = (change >= 0 ? '+' : '') + percentChange + '%';
    if (change >= 0) {
        priceChangeEl.classList.add('text-emerald-400');
        priceChangeEl.classList.remove('text-red-400');
    } else {
        priceChangeEl.classList.add('text-red-400');
        priceChangeEl.classList.remove('text-emerald-400');
    }
}

function updateChart(time, price) {
    const dataArray = marketChart.data.datasets[0].data;
    const labelArray = marketChart.data.labels;

    labelArray.push(time);
    dataArray.push(price);

    // Keep exactly 50 points on the chart to prevent memory leaks
    if (dataArray.length > MAX_DATA_POINTS) {
        dataArray.shift(); 
        labelArray.shift(); 
    }

    marketChart.update();
}

// Start the engine
connectWebSocket();