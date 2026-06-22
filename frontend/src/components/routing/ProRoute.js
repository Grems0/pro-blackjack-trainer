import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function ProRoute({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, location]);

  if (!user) return null;
  return children;
}
