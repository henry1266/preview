const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 7000;

// 中間件設定
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 首頁路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 載入預設範例檔案的API
app.get('/api/sample/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const samplePath = path.join('Z:\\雲端處方', filename);
    
    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ error: '找不到範例檔案' });
    }
    
    const jsonData = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
    res.json({
      success: true,
      data: jsonData,
      filename: filename
    });
  } catch (error) {
    console.error('載入範例檔案時發生錯誤:', error);
    res.status(500).json({ error: '載入範例檔案失敗: ' + error.message });
  }
});

// 取得範例檔案列表的API
app.get('/api/samples', (req, res) => {
  try {
    const samplesDir = 'Z:\\雲端處方';
    if (!fs.existsSync(samplesDir)) {
      return res.json({ samples: [] });
    }
    
    const files = fs.readdirSync(samplesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        filename: file,
        name: file.replace('.json', '').replace(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_/, '')
      }));
    
    res.json({ samples: files });
  } catch (error) {
    console.error('取得範例檔案列表時發生錯誤:', error);
    res.status(500).json({ error: '取得範例檔案列表失敗' });
  }
});

// 啟動伺服器
app.listen(port, '0.0.0.0', () => {
  console.log(`JSON瀏覽工具伺服器運行在 http://localhost:${port}`);
});

module.exports = app;

