import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from './api/authApi';
import './style/Login.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email không được để trống');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Mật khẩu không được để trống');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Attempting login with:', { email: formData.email });
      
      const response = await loginUser({
        email: formData.email.trim(),
        password: formData.password
      });

      console.log('Login response:', response);

      // Use AuthContext to handle login
      login(response.user, response.token);

      setSuccess('Đăng nhập thành công! Đang chuyển hướng...');

      // Navigate based on user role
      const role = response.user.role;
      setTimeout(() => {
        switch (role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'instructor':
            navigate('/instructor/courses');
            break;
          case 'student':
            navigate('/student');
            break;
          default:
            navigate('/student');
        }
      }, 1000);

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.message || 'Đăng nhập thất bại';
        setError(errorMessage);
      } else if (err.request) {
        // Network error
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Other error
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Đăng nhập</h1>
          <p className="login-subtitle">Vui lòng nhập thông tin đăng nhập của bạn</p>
        </div>
        
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✅ {success}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${error && !formData.email ? 'error' : ''}`}
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input ${error && !formData.password ? 'error' : ''}`}
              placeholder="Nhập mật khẩu của bạn"
              value={formData.password}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="register-link">
            <p>Chưa có tài khoản?</p>
            <Link to="/register" className="register-button-link">
              Đăng ký ngay
            </Link>
          </div>
          
          <div className="test-accounts">
            <details>
              <summary>📋 Tài khoản test</summary>
              <div className="test-accounts-list">
                <div><strong>Student:</strong> alice@student.kolp.vn / password123</div>
                <div><strong>Instructor:</strong> bob@instructor.kolp.vn / password123</div>
                <div><strong>Admin:</strong> admin@kolp.vn / password123</div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
