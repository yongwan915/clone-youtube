import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';
import Watch from './pages/Watch/Watch';
import Home from './pages/Home/Home';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="app">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="app__page">
          <Sidebar isOpen={sidebarOpen} />
          <div className="app__mainContent">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/watch/:videoId" element={<Watch />} />
              {/* 다른 라우트들은 여기에 추가 */}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
