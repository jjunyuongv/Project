// @ts-nocheck

import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import axios from 'axios';
import App from './App.jsx';
import './index.css';

import ReactDOM from 'react-dom/client';
import { AuthProvider } from './components/pages/reportform/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(

    <AuthProvider>
      <App />
    </AuthProvider>

);
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8081';
