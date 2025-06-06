const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 7000;

// 中間件設定
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 設定檔案上傳
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('只接受JSON檔案'), false);
    }
  }
});

// 首頁路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 上傳JSON檔案的API
app.post('/api/upload', upload.single('jsonFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '請選擇JSON檔案' });
    }

    const filePath = req.file.path;
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 清理上傳的檔案
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      data: jsonData,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('處理檔案時發生錯誤:', error);
    res.status(500).json({ error: '檔案處理失敗: ' + error.message });
  }
});

// 載入預設範例檔案的API
app.get('/api/sample/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const samplePath = path.join(__dirname, 'samples', filename);
    
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
    const samplesDir = path.join(__dirname, 'samples');
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

