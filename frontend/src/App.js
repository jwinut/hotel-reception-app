// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainPage from './MainPage';
import WalkInOptionsPage from './WalkInOptionsPage'; // Import the new page

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>ระบบจัดการโรงแรม</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/walk-in-options" element={<WalkInOptionsPage />} />
            {/* Add other routes here later */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;