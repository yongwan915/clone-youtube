import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import routes from './routes/routes';
import './App.css';
import Watch from './pages/Watch/Watch';
import Channel from './pages/Channel/Channel';

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
              {routes.map((route) => 
                route.path && (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<route.element />}
                  />
                )
              )}
              <Route path="/watch/:videoId" element={<Watch />} />
              <Route path="/channel/:user_id" element={<Channel />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
