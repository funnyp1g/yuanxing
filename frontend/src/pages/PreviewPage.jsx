import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function PreviewPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('desktop');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setProject(data.project);
      } else {
        setError('项目不存在');
      }
    } catch (err) {
      setError('获取项目信息失败');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/previews/${projectId}/index.html`;
    navigator.clipboard.writeText(link);
    alert('分享链接已复制到剪贴板');
  };

  const viewModes = {
    desktop: { width: '100%', height: '100%', label: '桌面' },
    tablet: { width: '768px', height: '1024px', label: '平板' },
    mobile: { width: '375px', height: '812px', label: '手机' }
  };

  if (loading) {
    return (
      <div className="preview-page">
        <div className="loading">加载预览中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="preview-page">
        <div className="error-state">
          <p>{error}</p>
          <a href="/projects" className="btn btn-primary">返回项目列表</a>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-page">
      <div className="preview-toolbar">
        <div className="toolbar-left">
          <h3>{project?.name}</h3>
          <span className="page-count">{project?.pageCount} 页</span>
        </div>
        <div className="toolbar-center">
          <div className="device-switcher">
            {Object.entries(viewModes).map(([key, mode]) => (
              <button
                key={key}
                className={`device-btn ${viewMode === key ? 'active' : ''}`}
                onClick={() => setViewMode(key)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-right">
          <button onClick={copyShareLink} className="btn btn-primary">
            分享链接
          </button>
        </div>
      </div>
      
      <div className="preview-canvas-wrapper">
        <div
          className={`preview-canvas device-${viewMode}`}
          style={{
            width: viewModes[viewMode].width,
            height: viewModes[viewMode].height
          }}
        >
          <iframe
            src={`/previews/${projectId}/index.html`}
            title="Preview"
            className="preview-iframe"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default PreviewPage;
