import * as React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/antd.css';
import App from './App';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Menu from './components/Menu';
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  // <StrictMode>
  <BrowserRouter>
    <Menu />
    <Routes>
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
  // </StrictMode>
);
