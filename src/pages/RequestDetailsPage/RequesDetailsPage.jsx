import React, { useState, useRef, useEffect } from 'react';
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
import axiosClient from '../../api/axiosClient';

const RequestDetailsPage = () => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState({
    mainTheme: 'bas',
    subTheme: 'general',
    otherSubTheme: '',
    priority: 'low',
    description: '',
    file: null
  });

  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const file = files && files[0] ? files[0] : null;
      setRequestData(prev => ({ ...prev, file }));
    } else {
      setRequestData(prev => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    if (requestData.file) {
      const url = URL.createObjectURL(requestData.file);
      setFilePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setFilePreview(null);
  }, [requestData.file]);

  const handleFileSelect = (file) => {
    if (file) setRequestData(prev => ({ ...prev, file }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dtFiles = e.dataTransfer && e.dataTransfer.files;
    if (dtFiles && dtFiles[0]) handleFileSelect(dtFiles[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePaste = (e) => {
    const clipboardFiles = e.clipboardData && e.clipboardData.files;
    if (clipboardFiles && clipboardFiles.length > 0) {
      handleFileSelect(clipboardFiles[0]);
      return;
    }

    const items = e.clipboardData && e.clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
            break;
          }
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build human-readable topic from selected mainTheme
    const mainThemeMap = {
      bas: 'BAS / 1C',
      tech: 'Технічне питання',
      general: 'Загальні / Інше'
    };

    const priorityMap = {
      low: 1,
      medium: 5,
      high: 10
    };

    const topic = `${mainThemeMap[requestData.mainTheme] || requestData.mainTheme}`;
    const subtopic = requestData.subTheme === 'other' ? requestData.otherSubTheme : requestData.subTheme;

    const formData = new FormData();
    formData.append('topic', topic);
    if (subtopic) formData.append('subtopic', subtopic);
    formData.append('description', requestData.description || '');
    if (requestData.priority) formData.append('priority', priorityMap[requestData.priority]);
    if (requestData.file) formData.append('file', requestData.file);

    try {
      const resp = await axiosClient.post('tasks/create', formData);
      console.log('Task created response:', resp.data);
      navigate('/tasks');
    } catch (err) {
      console.error('Помилка створення задачі:', err);
      alert('Не вдалося створити задачу. Спробуйте ще раз.');
    }
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
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                style={{ display: 'none' }}
                onChange={handleChange}
              />

              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onPaste={handlePaste}
                tabIndex={0}
                onClick={openFileDialog}
                sx={{
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Перетягніть файл сюди, натисніть щоб відкрити провідник або вставте (Ctrl+V)
                </Typography>
                {requestData.file ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography variant="body2">{requestData.file.name}</Typography>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); setRequestData(prev => ({ ...prev, file: null })); }}>
                      Видалити
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">Немає доданого файлу</Typography>
                )}
                {filePreview && (
                  <Box component="img" src={filePreview} alt="preview" sx={{ mt: 1, maxHeight: 120 }} />
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Кнопки */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/contact')}
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