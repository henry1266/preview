let currentData = null;
let filteredData = null;
let currentPage = 1;
const itemsPerPage = 50;

// 字體大小控制
let currentFontSize = 100; // 預設字體大小百分比

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
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');

    // 搜尋事件
    searchInput.addEventListener('input', handleSearch);
    
    // 字體大小調整事件
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', increaseFontSize);
    }
    
    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', decreaseFontSize);
    }
}

// 增加字體大小
function increaseFontSize() {
    if (currentFontSize < 200) { // 最大200%
        currentFontSize += 10;
        updateFontSize();
    }
}

// 減少字體大小
function decreaseFontSize() {
    if (currentFontSize > 70) { // 最小70%
        currentFontSize -= 10;
        updateFontSize();
    }
}

// 更新字體大小
function updateFontSize() {
    // 更新顯示
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    if (fontSizeDisplay) {
        fontSizeDisplay.textContent = currentFontSize + '%';
    }
    
    // 應用字體大小到表格和資訊區域
    const tableWrapper = document.querySelector('.table-wrapper');
    const infoGrid = document.getElementById('infoGrid');
    const fontSize = currentFontSize / 100;
    
    if (tableWrapper) {
        tableWrapper.style.fontSize = fontSize + 'rem';
    }
    
    if (infoGrid) {
        infoGrid.style.fontSize = fontSize + 'rem';
    }
    
    // 保存到本地存儲，下次訪問時保持相同字體大小
    localStorage.setItem('preferredFontSize', currentFontSize);
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

    // 按照檔案名稱中的數字由大到小排序
    samples.sort((a, b) => {
        const numA = parseInt(a.filename.replace(/\D/g, '') || 0);
        const numB = parseInt(b.filename.replace(/\D/g, '') || 0);
        return numB - numA; // 降序排列（由大到小）
    });

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

// 頁面載入時檢查是否有保存的字體大小設定
document.addEventListener('DOMContentLoaded', function() {
    const savedFontSize = localStorage.getItem('preferredFontSize');
    if (savedFontSize) {
        currentFontSize = parseInt(savedFontSize);
        updateFontSize();
    }
});

