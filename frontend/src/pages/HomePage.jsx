import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Yuanxing</h1>
          <p className="hero-subtitle">Axure RP 原型在线预览平台</p>
          <p className="hero-desc">
            上传你的 .rp 文件，自动生成可在浏览器中预览的 HTML 原型。
            无需 Axure 客户端，通过链接即可分享和查看。
          </p>
          <div className="hero-actions">
            <Link to="/upload" className="btn btn-primary">开始上传</Link>
            <Link to="/projects" className="btn btn-secondary">查看项目</Link>
          </div>
        </div>
      </section>
      <section className="features">
        <h2>核心功能</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">1.</div>
            <h3>一键上传</h3>
            <p>支持 Axure RP 9/10 的 .rp 文件，拖拽即可上传</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">2.</div>
            <h3>自动转换</h3>
            <p>智能解析 RP 结构，生成高保真 HTML 原型</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">3.</div>
            <h3>链接分享</h3>
            <p>生成预览链接，团队成员随时查看</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">4.</div>
            <h3>响应式预览</h3>
            <p>支持多设备尺寸，适配不同屏幕</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
