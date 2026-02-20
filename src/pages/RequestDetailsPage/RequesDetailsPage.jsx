import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Grid,
  LinearProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axiosClient from '../../api/axiosClient';

const SUBTOPICS_CONFIG = {
  bas: {
    title: "Оберіть тему BAS / 1С",
    options: [
      { label: "Помилка при запуску програми", value: "Помилка при запуску програми" },
      { label: "Помилка під час роботи (обміни, документи, звіти)", value: "Помилка під час роботи (обміни, документи, звіти)" },
      { label: "Користувачі та права (створення, налаштування ролей)", value: "Користувачі та права (створення, налаштування ролей)" },
      { label: "Консультація по функціоналу", value: "Консультація по функціоналу" },
      { label: "Доробка / розробка додаткового функціоналу", value: "Доробка / розробка додаткового функціоналу" },
      { label: "Оновлення / міграція бази", value: "Оновлення / міграція бази" },
    ]
    },
    tech: {
      title: "Оберіть тему технічного запиту",
      options: [
        { label: "Підключення до сервера / RDP / VPN", value: "Підключення до сервера / RDP / VPN" },
        { label: "Не працює обладнання (принтери, сканери, ПК)", value: "Не працює обладнання (принтери, сканери, ПК)" },
        { label: "Доступи та права (логіни, паролі, групи безпеки)", value: "Доступи та права (логіни, паролі, групи безпеки)" },
        { label: "Мережа та інтернет (LAN, Wi‑Fi, DNS, DHCP)", value: "Мережа та інтернет (LAN, Wi‑Fi, DNS, DHCP)" },
        { label: "Резервне копіювання / відновлення даних", value: "Резервне копіювання / відновлення даних" },
        { label: "Безпека (антивірус, фаєрвол, аудит)", value: "Безпека (антивірус, фаєрвол, аудит)" },
      ]
    },
    general: {
      title: "Оберіть тему запиту",
      options: [
        { label: "Загальні питання (не можу визначитись з групою)", value: "Загальні питання (не можу визначитись з групою)" },
        { label: "Запит на навчальні матеріали / інструкції", value: "Запит на навчальні матеріали / інструкції" },
        { label: "Пропозиції та зауваження", value: "Пропозиції та зауваження" },
        { label: "Зустрічі / обговорення завдань", value: "Зустрічі / обговорення завдань" },
      ]
    }
  };

const RequestDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState({
    mainTheme: 'bas',
    subTheme: 'general',
    otherSubTheme: '',
    priority: 'low',
    description: '',
    files: []
  });

  const isGuest = location.state?.guestFlow || !localStorage.getItem('token');

  const [fileErrors, setFileErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Максимальний розмір файлу та кількість файлів
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const MAX_FILES = 10;

  const validateFile = (file) => {
    if (!file) {
      return true;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      return `Файл "${file.name}" занадто великий (${sizeMB}MB). Максимум 100MB.`;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const newFiles = files ? Array.from(files) : [];
      handleFilesSelect(newFiles);
    } else {
      setRequestData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFilesSelect = (filesToAdd) => {
    const errors = [];
    const validFiles = [];
    const currentCount = requestData.files.length;

    for (let i = 0; i < filesToAdd.length; i++) {
      const file = filesToAdd[i];
      
      if (currentCount + validFiles.length >= MAX_FILES) {
        errors.push(`Максимум ${MAX_FILES} файлів. Дальше файли не будуть додані.`);
        break;
      }

      const validation = validateFile(file);
      if (validation === true) {
        validFiles.push(file);
      } else {
        errors.push(validation);
      }
    }

    if (validFiles.length > 0) {
      setRequestData(prev => ({ ...prev, files: [...prev.files, ...validFiles] }));
    }

    setFileErrors(errors);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dtFiles = e.dataTransfer && e.dataTransfer.files;
    if (dtFiles && dtFiles.length > 0) {
      handleFilesSelect(Array.from(dtFiles));
    }
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
      handleFilesSelect(Array.from(clipboardFiles));
      return;
    }

    const items = e.clipboardData && e.clipboardData.items;
    if (items) {
      const filesToAdd = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            filesToAdd.push(file);
          }
        }
      }
      if (filesToAdd.length > 0) {
        handleFilesSelect(filesToAdd);
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
    
    // Додавання всіх файлів
    requestData.files.forEach((file) => {
      formData.append('file', file); 
    });

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const resp = await axiosClient.post('tasks/create', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        }
      });
      
      setIsSubmitting(false);
      if (isGuest) {
        // Якщо користувач без авторизації — повертаємо на логін
        alert("Заявку успішно створено!");
        navigate('/login');
      } else {
        // Якщо авторизований — повертаємо в кабінет до списку задач
        navigate('/profile');
      };
    } catch (err) {
      console.error('Помилка створення задачі:', err);
      setIsSubmitting(false);
      
      // Виправлено setFileError -> setFileErrors
      if (err.response?.status === 413) {
        setFileErrors(['❌ Файл занадто великий для сервера!']);
      } else if (err.response?.status === 500) {
        setFileErrors(['❌ Помилка сервера (Multer): Перевірте назву поля файлів']);
      } else {
        setFileErrors(['Не вдалося створити задачу. Спробуйте ще раз.']);
      }
    }
  };

  const currentSubTopicConfig = SUBTOPICS_CONFIG[requestData.mainTheme] || SUBTOPICS_CONFIG.general;

  const handleMainThemeChange = (e) => {
    const newTheme = e.target.value;
    setRequestData(prev => ({
      ...prev,
      mainTheme: newTheme,
      subTheme: '',
      otherSubTheme: ''
    }));
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
            <RadioGroup name="mainTheme" value={requestData.mainTheme} onChange={handleMainThemeChange}>
              <FormControlLabel value="bas" control={<Radio />} label="BAS / 1C" />
              <FormControlLabel value="tech" control={<Radio />} label="Технічне питання" />
              <FormControlLabel value="general" control={<Radio />} label="Загальні / Інше" />
            </RadioGroup>
          </FormControl>

          {/* Уточнення теми запиту */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
              {currentSubTopicConfig.title}
            </FormLabel>
            <RadioGroup name="subTheme" value={requestData.subTheme} onChange={handleChange}>
              {/* Рендеримо опції з конфігурації */}
              {currentSubTopicConfig.options.map((option) => (
                <FormControlLabel 
                  key={option.value} 
                  value={option.value} 
                  control={<Radio />} 
                  label={option.label} 
                />
              ))}
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
                multiple
                style={{ display: 'none' }}
                onChange={handleChange}
              />

              {fileErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {fileErrors.map((error, idx) => (
                    <div key={idx}>⚠️ {error}</div>
                  ))}
                </Alert>
              )}

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
                  Перетягніть файли сюди, натисніть щоб відкрити провідник або вставте (Ctrl+V)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Максимум 10 файлів по 100MB кожен
                </Typography>

                {requestData.files.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Додані файли ({requestData.files.length}/{MAX_FILES}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {requestData.files.map((file, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1
                          }}
                        >
                          <Typography variant="body2">
                            {idx + 1}. {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                          </Typography>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRequestData(prev => ({
                                ...prev,
                                files: prev.files.filter((_, i) => i !== idx)
                              }));
                            }}
                          >
                            Видалити
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Немає доданих файлів
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Кнопки */}
          {isSubmitting && (
            <Box sx={{ width: '100%', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2">Завантаження файлу...</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{uploadProgress}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(isGuest ? '/contact' : '/profile')} 
              disabled={isSubmitting}
              sx={{ px: 3, py: 1, borderRadius: '8px', textTransform: 'none', backgroundColor: '#1976d2' }}
            >
              Назад
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ px: 3, py: 1, borderRadius: '8px', textTransform: 'none', backgroundColor: '#1976d2' }}
            >
              {isSubmitting ? 'Завантаження...' : 'Відправити'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default RequestDetailsPage;