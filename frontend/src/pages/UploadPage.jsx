import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.rp')) {
      setFile(selected);
      setError(null);
    } else {
      setError('请选择 .rp 格式的文件');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.rp')) {
      setFile(dropped);
      setError(null);
    } else {
      setError('请拖入 .rp 格式的文件');
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('请先选择文件');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('rpFile', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (data.success) {
        setResult(data.project);
      } else {
        setError(data.error || '上传失败');
      }
    } catch (err) {
      setError('上传出错: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}${result.previewUrl}`;
    navigator.clipboard.writeText(link);
    alert('链接已复制: ' + link);
  };

  if (result) {
    return (
      <div className="upload-page">
        <div className="result-card">
          <div className="result-icon">✓</div>
          <h2>转换成功!</h2>
          <p className="result-info">
            共 {result.pageCount} 个页面已生成
          </p>
          <div className="result-actions">
            <a href={result.previewUrl} target="_blank" rel="noopener" className="btn btn-primary">
              立即预览
            </a>
            <button onClick={copyLink} className="btn btn-secondary">
              复制链接
            </button>
            <button onClick={() => { setResult(null); setFile(null); }} className="btn btn-ghost">
              继续上传
            </button>
          </div>
          <div className="page-list">
            <h4>页面列表</h4>
            <ul>
              {result.pages.map((page, idx) => (
                <li key={page.id}>
                  <span className="page-num">{idx + 1}</span>
                  {page.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page">
      <h2>上传 RP 文件</h2>
      <p className="upload-desc">将 Axure RP 原型文件转换为可在浏览器预览的 HTML</p>
      
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".rp"
          onChange={handleFileChange}
          id="file-input"
          className="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          {file ? (
            <>
              <div className="file-icon">📄</div>
              <div className="file-name">{file.name}</div>
              <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              <div className="file-hint">点击或拖拽更换文件</div>
            </>
          ) : (
            <>
              <div className="upload-icon">☁️</div>
              <div className="upload-text">拖拽 .rp 文件到此处</div>
              <div className="upload-hint">或点击选择文件</div>
            </>
          )}
        </label>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {uploading && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">转换中... {progress}%</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn btn-primary btn-upload"
      >
        {uploading ? '转换中...' : '开始转换'}
      </button>
    </div>
  );
}

export default UploadPage;
