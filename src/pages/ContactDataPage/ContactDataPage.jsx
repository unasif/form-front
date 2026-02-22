import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid 
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const RegistrationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isGuest = location.state?.guestFlow;

  const [formData, setFormData] = useState({
    organization: '',
    name: '',
    phone: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Дані реєстрації (Гостя):', formData);
    navigate('/details', { 
      state: { 
        guestFlow: true, 
        guestData: formData 
      } 
    });
  };

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          marginTop: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center'
        }}
      >
        <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 'medium' }}>
          Контактні дані
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Організація"
                name="organization"
                required
                value={formData.organization}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Ваше ім'я"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            {/* Другий рядок */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Ваш номер телефону"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Ваш e-mail"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 4 
          }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/login')}
              sx={{ px: 3, borderRadius: '8px', textTransform: 'none' }}
            >
              Назад
            </Button>

            <Button
              type="submit"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                 px: 3, borderRadius: '8px', textTransform: 'none' 
              }}
            >
              Далі
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default RegistrationPage;