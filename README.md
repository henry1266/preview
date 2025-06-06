# JSON 瀏覽工具

一個簡易的JSON瀏覽工具，使用Node.js開發，可以將JSON檔案資料以表格格式呈現。

## 功能特色

- 📁 支援JSON檔案上傳
- 📊 表格格式顯示資料
- 🔍 即時搜尋功能
- 📄 CSV匯出功能
- 📱 響應式設計
- 🎨 現代化UI介面

## 技術架構

- **後端**: Node.js + Express
- **前端**: HTML5 + CSS3 + JavaScript
- **檔案處理**: Multer
- **跨域支援**: CORS

## 安裝與使用

### 環境需求

- Node.js 14.0 或更高版本
- npm 6.0 或更高版本

### 安裝步驟

1. 複製專案
```bash
git clone https://github.com/henry1266/preview.git
cd preview
```

2. 安裝依賴套件
```bash
npm install
```

3. 啟動伺服器
```bash
npm start
```

4. 開啟瀏覽器訪問 `http://localhost:7000`

## 使用說明

### 上傳JSON檔案

1. 點擊「選擇檔案」按鈕或直接拖拽JSON檔案到上傳區域
2. 系統會自動解析並顯示檔案內容

### 瀏覽範例檔案

- 頁面提供了預設的範例檔案
- 點擊任一範例檔案卡片即可載入並查看

### 表格功能

- **搜尋**: 在搜尋框中輸入關鍵字即時篩選資料
- **分頁**: 自動分頁顯示，每頁50筆資料
- **匯出**: 點擊「匯出CSV」按鈕下載篩選後的資料

## 專案結構

```
json-viewer/
├── server.js          # 主伺服器檔案
├── package.json       # 專案設定檔
├── public/            # 前端靜態檔案
│   ├── index.html     # 主頁面
│   └── script.js      # 前端JavaScript
└── samples/           # 範例JSON檔案
    ├── 2025-06-06_09-57-06_陳淑蓮.json
    ├── 2025-06-06_10-06-59_吳美麗.json
    ├── 2025-06-06_10-37-51_張益隆.json
    └── 2025-06-06_10-37-56_張益隆.json
```

## API 端點

- `GET /` - 主頁面
- `POST /api/upload` - 上傳JSON檔案
- `GET /api/samples` - 取得範例檔案列表
- `GET /api/sample/:filename` - 載入指定範例檔案

## 支援的JSON格式

本工具特別針對健保醫療資訊JSON格式進行優化，支援包含以下結構的檔案：

```json
{
  "metadata": {
    "extractedAt": "時間戳記",
    "dataCount": "資料筆數",
    "version": "版本號",
    "filename": "檔案名稱",
    "personName": "人員姓名"
  },
  "personalInfo": {
    "name": "姓名",
    "idNumber": "身分證號",
    "birthDate": "出生日期"
  },
  "tableData": [
    {
      "項次": "序號",
      "就醫日期": "日期",
      "來源": "醫療機構",
      "主診斷": "診斷內容",
      // ... 其他欄位
    }
  ]
}
```

## 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 授權

MIT License

## 作者

開發者：Manus AI Agent
專案維護：henry1266

