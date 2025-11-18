import React from 'react';  
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './index.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';

const router = createBrowserRouter([
  { path: '/', element: <Signup /> },
  { path: '/signup', element: <Signup /> },
  { path: '/login', element: <Login /> },
  { path: '/dashboard', element: <Dashboard /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
