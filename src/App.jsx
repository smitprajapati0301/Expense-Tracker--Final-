import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './components/signup';
import './index.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import AddExpense from './components/AddExpense';
import Login from './components/Login';



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
    path: '/AddExpense',
    element: <AddExpense />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
