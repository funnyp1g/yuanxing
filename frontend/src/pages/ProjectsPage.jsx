import React, { useState, useEffect } from 'react';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      setError('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm('确定要删除这个项目吗？')) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  const copyLink = (projectId) => {
    const link = `${window.location.origin}/previews/${projectId}/index.html`;
    navigator.clipboard.writeText(link);
    alert('链接已复制');
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>我的项目</h2>
        <span className="project-count">{projects.length} 个项目</span>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>还没有项目</p>
          <a href="/upload" className="btn btn-primary">去上传</a>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-preview">
                <iframe
                  src={`/previews/${project.id}/index.html`}
                  title={project.name}
                  className="preview-frame"
                ></iframe>
              </div>
              <div className="project-info">
                <h3 className="project-name" title={project.name}>
                  {project.name}
                </h3>
                <div className="project-meta">
                  <span>{project.pageCount} 页</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="project-actions">
                  <a
                    href={`/previews/${project.id}/index.html`}
                    target="_blank"
                    rel="noopener"
                    className="btn btn-sm btn-primary"
                  >
                    预览
                  </a>
                  <button
                    onClick={() => copyLink(project.id)}
                    className="btn btn-sm btn-secondary"
                  >
                    复制链接
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="btn btn-sm btn-danger"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
