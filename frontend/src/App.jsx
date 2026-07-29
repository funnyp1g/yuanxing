import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import PreviewPage from './pages/PreviewPage.jsx';
import Header from './components/Header.jsx';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/preview/:projectId" element={<PreviewPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
