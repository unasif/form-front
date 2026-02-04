import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel,
  Grid 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const RequestDetailsPage = () => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState({
    mainTheme: 'bas',
    subTheme: 'general',
    otherSubTheme: '',
    priority: 'low',
    description: '',
    file: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Дані заявки відправлено:', requestData);
    // Після відправки зазвичай перекидають у кабінет (таблицю задач)
    navigate('/tasks'); 
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 4, marginBottom: 8 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
          Інформація для заявки
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Основна тема запиту */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
              Основна тема запиту
            </FormLabel>
            <RadioGroup name="mainTheme" value={requestData.mainTheme} onChange={handleChange}>
              <FormControlLabel value="bas" control={<Radio />} label="BAS / 1C" />
              <FormControlLabel value="tech" control={<Radio />} label="Технічне питання" />
              <FormControlLabel value="general" control={<Radio />} label="Загальні / Інше" />
            </RadioGroup>
          </FormControl>

          {/* Уточнення теми запиту */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
              Уточнення теми запиту
            </FormLabel>
            <RadioGroup name="subTheme" value={requestData.subTheme} onChange={handleChange}>
              <FormControlLabel value="general" control={<Radio />} label="Загальні питання (не можу визначитись з групою)" />
              <FormControlLabel value="materials" control={<Radio />} label="Запит на навчальні матеріали / інструкції" />
              <FormControlLabel value="suggestions" control={<Radio />} label="Пропозиції та зауваження" />
              <FormControlLabel value="meeting" control={<Radio />} label="Зустрічі / обговорення завдань" />
              <FormControlLabel 
                value="other" 
                control={<Radio />} 
                label={ 
                    <TextField 
                    placeholder="Інше (впишіть свій варіант)" 
                    fullWidth 
                    size="small"
                    value={requestData.otherSubTheme}
                    onChange={(e) => {
                        // При введенні тексту автоматично вибираємо цей Radio
                        setRequestData(prev => ({ 
                        ...prev, 
                        subTheme: 'other', 
                        otherSubTheme: e.target.value 
                        }));
                    }}
                    // Поле активне лише тоді, коли вибрано варіант "other"
                    onClick={() => setRequestData(prev => ({ ...prev, subTheme: 'other' }))}
                    sx={{ ml: 1, minWidth: '300px' }}
                    />
                } 
                />
            </RadioGroup>
          </FormControl>

          {/* Пріоритет */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
              Пріоритет
            </FormLabel>
            <RadioGroup name="priority" value={requestData.priority} onChange={handleChange}>
              <FormControlLabel value="low" control={<Radio />} label="Низький" />
              <FormControlLabel value="medium" control={<Radio />} label="Середній" />
              <FormControlLabel value="high" control={<Radio />} label="Високий" />
            </RadioGroup>
          </FormControl>

          {/* Опис та файли */}
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Опис запиту"
                name="description"
                multiline
                rows={2}
                value={requestData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                placeholder="Скріншот/Фото/Докуме..."
                name="file"
                value={requestData.file}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Кнопки */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/contact')} // Повернення на "Контактні дані"
              sx={{ px: 3, py: 1, borderRadius: '8px', textTransform: 'none', backgroundColor: '#1976d2' }}
            >
              Назад
            </Button>

            <Button
              type="submit"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 3, py: 1, borderRadius: '8px', textTransform: 'none', backgroundColor: '#1976d2' }}
            >
              Відправити
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default RequestDetailsPage;