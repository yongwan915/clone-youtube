import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const { checkAuth } = useAuth();
    
    if (!checkAuth()) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute; 