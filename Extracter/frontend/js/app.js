import { CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileNameDisplay = document.getElementById('file-name');
    const removeFileBtn = document.getElementById('remove-file');
    const extractBtn = document.getElementById('extract-btn');
    
    const methodSelect = document.getElementById('method-select');
    const countSelect = document.getElementById('count-select');
    
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    
    const resultsEmpty = document.getElementById('results-empty');
    const resultsContent = document.getElementById('results-content');
    const keywordChips = document.getElementById('keyword-chips');
    const keywordChartCtx = document.getElementById('keyword-chart').getContext('2d');
    
    const copyBtn = document.getElementById('copy-btn');
    const csvBtn = document.getElementById('csv-btn');
    const tabs = document.querySelectorAll('.tab');
    
    let currentFile = null;
    let extractedData = null;
    let chartInstance = null;

    // File Drag and Drop handling
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    removeFileBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        dropZone.classList.remove('hidden');
        extractBtn.disabled = true;
    });

    function handleFile(file) {
        if (file.type !== 'application/pdf') {
            showError("Please upload a valid PDF file.");
            return;
        }
        currentFile = file;
        fileNameDisplay.textContent = file.name;
        dropZone.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        extractBtn.disabled = false;
        hideError();
    }

    // Extraction Logic
    extractBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        hideError();
        extractBtn.disabled = true;
        loading.classList.remove('hidden');
        resultsEmpty.classList.add('hidden');
        resultsContent.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('method', methodSelect.value);
        formData.append('count', countSelect.value);

        try {
            const response = await fetch(`${CONFIG.API_URL}/extract`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Server error occurred');
            }

            extractedData = data.keywords;
            displayResults(extractedData);
            
        } catch (error) {
            showError(error.message);
            resultsEmpty.classList.remove('hidden');
        } finally {
            extractBtn.disabled = false;
            loading.classList.add('hidden');
        }
    });

    // Display Results
    function displayResults(keywords) {
        if (!keywords || keywords.length === 0) {
            showError("No keywords found. The PDF might be empty or scanned as images.");
            return;
        }

        resultsContent.classList.remove('hidden');
        
        // Render Chips
        keywordChips.innerHTML = '';
        keywords.forEach((kw, index) => {
            const word = typeof kw === 'string' ? kw : (kw.word || kw.keyword);
            const chip = document.createElement('div');
            chip.className = 'keyword-chip';
            chip.innerHTML = `<span class="rank">${index + 1}</span> ${word}`;
            keywordChips.appendChild(chip);
        });

        // Render Chart
        renderChart(keywords);
    }

    function renderChart(keywords) {
        if (chartInstance) {
            chartInstance.destroy();
        }

        const labels = keywords.map(kw => typeof kw === 'string' ? kw : (kw.word || kw.keyword));
        const data = keywords.map(kw => typeof kw === 'string' ? 1 : (kw.score || 1));

        chartInstance = new Chart(keywordChartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Relative Score',
                    data: data,
                    backgroundColor: 'rgba(6, 182, 212, 0.6)',
                    borderColor: 'rgba(6, 182, 212, 1)',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        beginAtZero: true,
                        display: false
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // Export Logic
    copyBtn.addEventListener('click', () => {
        if (!extractedData) return;
        const words = extractedData.map(kw => kw.word).join(', ');
        navigator.clipboard.writeText(words).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = originalText, 2000);
        });
    });

    csvBtn.addEventListener('click', () => {
        if (!extractedData) return;
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Rank,Keyword,Score\n"
            + extractedData.map((kw, i) => `${i+1},"${kw.word}",${kw.score}`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "keywords.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Errors
    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
});
