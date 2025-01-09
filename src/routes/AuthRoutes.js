import Login from '../pages/Login/Login';
import SignUp from '../pages/Signup/SignUp';

export const authRoutes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/sign-up',
    element: <SignUp />
  }
];