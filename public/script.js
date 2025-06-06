let currentData = null;
let filteredData = null;
let currentPage = 1;
const itemsPerPage = 50;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const fileToLoad = urlParams.get('file');

    if (fileToLoad) {
        loadSample(fileToLoad);
        // 載入特定檔案後，隱藏範例列表
        const samplesSection = document.getElementById('samplesSection');
        if (samplesSection) {
            samplesSection.style.display = 'none';
        }
    } else {
        loadSamples();
    }
});

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');

    // 搜尋事件
    searchInput.addEventListener('input', handleSearch);
}

function loadSamples() {
    fetch('/api/samples')
    .then(response => response.json())
    .then(data => {
        if (data.samples && data.samples.length > 0) {
            displaySamples(data.samples);
        } else {
            document.getElementById('samplesSection').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('載入範例檔案失敗:', error);
        document.getElementById('samplesSection').style.display = 'none';
    });
}

function displaySamples(samples) {
    const samplesGrid = document.getElementById('samplesGrid');
    samplesGrid.innerHTML = '';

    samples.forEach(sample => {
        const card = document.createElement('div');
        card.className = 'sample-card';
        card.innerHTML = `
            <div class="sample-name">${sample.name} - ${sample.filename.replace(/\D/g, '')}</div>
        `;
        card.addEventListener('click', () => {
            window.location.href = `/?file=${sample.filename}`;
        });
        samplesGrid.appendChild(card);
    });
}

function loadSample(filename) {
    showLoading(true);
    hideError();

    fetch(`/api/sample/${filename}`)
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        if (data.success) {
            displayData(data.data, data.filename);
        } else {
            showError(data.error || '載入範例檔案失敗');
        }
    })
    .catch(error => {
        showLoading(false);
        showError('載入失敗: ' + error.message);
    });
}

function displayData(data, filename) {
    currentData = data;
    
    // 顯示檔案資訊
    displayFileInfo(data, filename);
    
    // 顯示表格資料
    if (data.tableData && Array.isArray(data.tableData)) {
        filteredData = data.tableData;
        currentPage = 1;
        displayTable();
        document.getElementById('tableContainer').classList.remove('hidden');
    } else {
        showError('JSON檔案中沒有找到tableData陣列');
    }
}

function displayFileInfo(data, filename) {
    const fileInfo = document.getElementById('fileInfo');
    const infoGrid = document.getElementById('infoGrid');
    
    infoGrid.innerHTML = '';

    const fileNumber = filename.replace(/\D/g, '');
    addInfoItem(infoGrid, '檔案編號', fileNumber);
    
    // 個人資訊
    if (data.personalInfo) {
        addInfoItem(infoGrid, '姓名', data.personalInfo.name || '未提供');
        addInfoItem(infoGrid, '出生日期', data.personalInfo.birthDate || '未提供');
    }
    
    // 元資料
    if (data.metadata) {
        addInfoItem(infoGrid, '資料筆數', data.metadata.dataCount || '未知');
    }
    
    fileInfo.classList.remove('hidden');
}

function addInfoItem(container, label, value) {
    const item = document.createElement('div');
    item.className = 'info-item';
    item.innerHTML = `
        <div class="info-label">${label}</div>
        <div class="info-value">${value}</div>
    `;
    container.appendChild(item);
}

function displayTable() {
    if (!filteredData || filteredData.length === 0) {
        showError('沒有資料可顯示');
        return;
    }

    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');
    
    // 清空表格
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    
    // 取得欄位名稱
    const columns = Object.keys(filteredData[0]).filter(key => !key.startsWith('_'));
    
    // 建立表頭
    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);
    
    // 計算分頁
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);
    
    // 建立表格內容
    pageData.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column] || '';
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
    
    // 更新分頁
    updatePagination();
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (!filteredData || filteredData.length <= itemsPerPage) {
        return;
    }
    
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    // 上一頁按鈕
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '上一頁';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayTable();
        }
    });
    pagination.appendChild(prevBtn);
    
    // 頁碼按鈕
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'current' : '';
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayTable();
        });
        pagination.appendChild(pageBtn);
    }
    
    // 下一頁按鈕
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一頁';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayTable();
        }
    });
    pagination.appendChild(nextBtn);
    
    // 顯示資訊
    const info = document.createElement('span');
    info.textContent = `第 ${currentPage} 頁，共 ${totalPages} 頁 (${filteredData.length} 筆資料)`;
    info.style.marginLeft = '20px';
    info.style.color = '#6c757d';
    pagination.appendChild(info);
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!currentData || !currentData.tableData) {
        return;
    }
    
    if (searchTerm === '') {
        filteredData = currentData.tableData;
    } else {
        filteredData = currentData.tableData.filter(row => {
            return Object.values(row).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            );
        });
    }
    
    currentPage = 1;
    displayTable();
}

function exportToCSV() {
    if (!filteredData || filteredData.length === 0) {
        alert('沒有資料可匯出');
        return;
    }
    
    const columns = Object.keys(filteredData[0]).filter(key => !key.startsWith('_'));
    
    // 建立CSV內容
    let csvContent = columns.join(',') + '\n';
    
    filteredData.forEach(row => {
        const values = columns.map(column => {
            const value = row[column] || '';
            // 處理包含逗號或引號的值
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        csvContent += values.join(',') + '\n';
    });
    
    // 下載檔案
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.classList.remove('hidden');
}
function goBack() {
    window.location.href = '/';
}

function hideError() {
    const error = document.getElementById('error');
    error.classList.add('hidden');
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-TW');
    } catch (e) {
        return dateString;
    }
}

