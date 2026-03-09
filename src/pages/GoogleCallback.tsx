import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { setUser, setToken, setRegistered, setAccountType } = useUserStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const username = searchParams.get('username');
    const profileImage = searchParams.get('profileImage');
    const role = searchParams.get('accountType') as 'creator' | 'brand';

    if (token && id) {
      setToken(token);
      setUser({
        id,
        email: email || '',
        username: username || '',
        profileImage: profileImage || '',
        isVIP: false,
        accountType: role
      });
      
      setRegistered(true);
      setAccountType(role);

      navigate('/profile/me', { replace: true });
    } else {
      console.error("Google Auth Callback failed: Missing parameters");
      navigate('/login?error=google_failed');
    }
  }, [searchParams, navigate, setUser, setToken, setRegistered, setAccountType]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-lg font-medium animate-pulse">Authenticating with Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;