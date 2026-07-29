import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">📐</span>
          <span className="logo-text">Yuanxing</span>
        </Link>
        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            首页
          </Link>
          <Link to="/upload" className={`nav-link ${isActive('/upload') ? 'active' : ''}`}>
            上传原型
          </Link>
          <Link to="/projects" className={`nav-link ${isActive('/projects') ? 'active' : ''}`}>
            我的项目
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
