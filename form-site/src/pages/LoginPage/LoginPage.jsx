import React, { useState } from 'react';
import stayle from "./LoginPage.module.scss";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button
} from "@mui/material";

const LoginPage = () => {
    const [formData, setFormData] = useState({
      login: '',
      password: ''
    });
      
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Данні входу ", fromData);
        //НАЗІ СЮДИ ЛОГОКІ АВТОРИЗАЦІЇ
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
            />
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
            }}>
                <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                УВІЙТИ
                </Button>

                <Button
                variant="contained"
                onClick={() => console.log('Перехід до створення без авторизації')}
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