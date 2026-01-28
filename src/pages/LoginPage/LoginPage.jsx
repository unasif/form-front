import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button
} from "@mui/material";
import { loginUser } from '../api/authService';

const LoginPage = () => {
  
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
      login: '',
      password: ''
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
      
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        console.log("Данні входу ", formData);

        try {
          const isEmail = formData.login.includes('@');
          const payload = {
              password: formData.password
          };
          if (isEmail) {
              payload.email = formData.login;
          } else {
              payload.phone = formData.login;
          }
          console.log("Відправляємо на сервер:", payload);
          const data = await loginUser(payload);
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log("Успішний вхід!", data);
          navigate('/'); 

      } catch (err) {
          console.error("Помилка входу:", err);
          const message = err.response?.data?.message || 'Щось пішло не так. Перевірте дані.';
          setError(message);
      } finally {
          setLoading(false);
      }
    };

    return (
    <Container maxWidth="sm">
      <Box sx={{ 
        marginTop: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
            Авторизація
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="E-mail або номер телефону"
              name="login"
              autoComplete="email"
              autoFocus
              value={formData.login}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <Box sx={{ 
                display: 'flex', 
                gap: 2,
                mt: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center', 
                justifyContent: 'center',
            }}>
                <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ 
                    flex: 0.2,
                    position: 'relative'
                }}
                >
                {loading ? <CircularProgress size={24} /> : 'УВІЙТИ'}
                </Button>

                <Button
                variant="contained"
                onClick={() => navigate('/registration')}
                sx={{ 
                    flex: 1,
                }}
                >
                Додати заявку без авторизації
                </Button>
            </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;