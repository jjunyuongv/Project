// @ts-nocheck

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

import { AuthProvider } from './components/pages/LoginForm/AuthContext.jsx';

// 전역 axios 설정: 프록시('/api') 경유로 일원화 (절대주소 8081 금지)
axios.defaults.withCredentials = true;
axios.defaults.baseURL = '/api';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
