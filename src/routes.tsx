import Login from './pages/Login';
import RequestAccount from './pages/RequestAccount';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import ImageAnalysis from './pages/ImageAnalysis';
import Admin from './pages/Admin';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
    visible: false
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false
  },
  {
    name: 'Request Account',
    path: '/request-account',
    element: <RequestAccount />,
    visible: false
  },
  {
    name: 'Forgot Password',
    path: '/forgot-password',
    element: <ForgotPassword />,
    visible: false
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <Dashboard />,
    visible: false
  },
  {
    name: 'Upload',
    path: '/upload',
    element: <Upload />,
    visible: false
  },
  {
    name: 'Image Analysis',
    path: '/analyze/:imageId',
    element: <ImageAnalysis />,
    visible: false
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />,
    visible: false
  }
];

export default routes;