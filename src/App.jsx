import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Hello from './components/Hello';
import './index.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Signup />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/Hello',
    element: <Hello />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
