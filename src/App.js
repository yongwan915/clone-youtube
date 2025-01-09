import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import routes from './routes';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Header onMenuClick={toggleSidebar} />
        <div className="app__page">
          <Sidebar isOpen={isSidebarOpen} />
          <div className="app__content">
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
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
