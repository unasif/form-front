import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid 
} from '@mui/material';

const RegistrationPage = () => {
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
    console.log('Дані реєстрації:', formData);
    // Тут буде перехід на наступну сторінку деталей запиту
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
          Реєстрація
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

          <Button
            type="submit"
            variant="contained"
            sx={{ 
              mt: 4, 
              px: 4, 
              py: 1,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '8px' 
            }}
          >
            ДАЛІ -{'>'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RegistrationPage;