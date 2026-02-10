import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid'; // Використовуємо DataGrid
import {
    Box,
    Container,
    Typography,
    Button,
    Avatar,
    Menu,
    MenuItem,
    IconButton,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Divider,
    CircularProgress
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

import { getAllClients, deleteClient, registerUser, updateClient } from '../../api/authService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // --- СТАНИ ---
    // 1. Ініціалізуємо пустим масивом! Це важливо для твоєї теорії.
    const [rows, setRows] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // DataGrid зберігає ID вибраних рядків
    const [rowSelectionModel, setRowSelectionModel] = useState([]);

    // Меню та Модалки
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [openProfileDialog, setOpenProfileDialog] = useState(false);

    // Форми
    const [clientFormData, setClientFormData] = useState({
        email: '', phone: '', company: '', password: ''
    });
    const [adminFormData, setAdminFormData] = useState({
        email: '', phone: '', company: '', password: ''
    });

    const currentUser = JSON.parse(localStorage.getItem('user')) || { email: 'admin@gmail.com' };

    // --- КОЛОНКИ (Використовуємо useMemo, щоб вони не перестворювались) ---
    const columns = useMemo(() => [
        { field: 'name', headerName: 'Контактна особа', flex: 1, minWidth: 150 },
        { field: 'company', headerName: 'Компанія', flex: 1, minWidth: 150 },
        { field: 'phone', headerName: 'Номер телефону', flex: 1, minWidth: 150 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    ], []);

    // --- ЗАВАНТАЖЕННЯ ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAllClients();
            
            // 2. Перевірка: якщо прийшло щось не те, ставимо пустий масив
            if (Array.isArray(data)) {
                setRows(data);
            } else if (data && Array.isArray(data.data)) {
                setRows(data.data);
            } else {
                console.warn("Дані прийшли в невідомому форматі, встановлюю пустий масив", data);
                setRows([]); 
            }
        } catch (err) {
            console.error(err);
            setError('Не вдалося завантажити список клієнтів.');
            setRows([]); // При помилці теж пустий масив
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- ОБРОБНИКИ КНОПОК ---
    const handleOpenCreateClient = () => {
        setIsEditMode(false);
        setClientFormData({ email: '', phone: '', company: '', password: '' });
        setOpenDialog(true);
    };

    const handleOpenEditClient = () => {
        if (rowSelectionModel.length !== 1) return;
        const client = rows.find(row => row.id === rowSelectionModel[0]);
        if (client) {
            setClientFormData({
                email: client.email,
                phone: client.phone || '',
                company: client.company || '',
                password: ''
            });
            setIsEditMode(true);
            setOpenDialog(true);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Ви впевнені, що хочете видалити вибраних клієнтів?')) return;
        try {
            for (const id of rowSelectionModel) await deleteClient(id);
            setRowSelectionModel([]);
            fetchData();
        } catch (err) {
            alert('Помилка при видаленні');
        }
    };

    const handleSaveClient = async () => {
        try {
            if (isEditMode) {
                await updateClient(rowSelectionModel[0], clientFormData);
                alert('Дані клієнта оновлено!');
            } else {
                await registerUser(clientFormData);
                alert('Клієнта створено!');
            }
            setOpenDialog(false);
            fetchData();
        } catch (err) {
            alert('Помилка збереження: ' + (err.response?.data?.message || err.message));
        }
    };

    // --- МЕНЮ ТА ПРОФІЛЬ ---
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };
    const handleOpenAdminProfile = () => {
        handleMenuClose();
        setAdminFormData({
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            company: currentUser.company || '',
            password: ''
        });
        setOpenProfileDialog(true);
    };
    const handleSaveAdminProfile = async () => {
        try {
            if (!currentUser.id) throw new Error("ID користувача не знайдено");
            await updateClient(currentUser.id, adminFormData);
            alert('Ваш профіль оновлено. Будь ласка, увійдіть знову.');
            handleLogout(); 
        } catch (err) {
            alert('Помилка оновлення профілю: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                
                {/* HEADER */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h4" component="h2" sx={{ color: '#333', fontWeight: 500 }}>
                            Таблиця клієнтів
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: '#bdbdbd', width: 56, height: 56, fontSize: 24 }}>A</Avatar>
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                            {currentUser.email}
                        </Typography>
                        <Menu
                            anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}
                            PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 150 } }}
                            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleOpenAdminProfile}>
                                <SettingsIcon sx={{ mr: 1.5, fontSize: 20, color: '#757575' }} /> Редагувати
                            </MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                                <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> Вийти
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* BUTTONS */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button 
                        variant="contained" sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        onClick={handleOpenCreateClient}
                    >
                        СТВОРИТИ
                    </Button>
                    <Button 
                        variant="contained" sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={rowSelectionModel.length !== 1}
                        onClick={handleOpenEditClient}
                    >
                        РЕДАГУВАТИ
                    </Button>
                    <Button 
                        variant="contained" sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={rowSelectionModel.length === 0}
                        onClick={handleDelete}
                    >
                        ВИДАЛИТИ
                    </Button>
                </Box>

                {/* DATAGRID CONTAINER */}
                {/* 3. Обов'язково задаємо height для контейнера */}
                <Box sx={{ height: 500, width: '100%' }}>
                    <DataGrid
                        // 4. ЗАХИСТ ВІД UNDEFINED (Твоя теорія)
                        rows={rows || []} 
                        columns={columns || []}

                        // Налаштування пагінації
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 5 },
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        
                        // Чекбокси
                        checkboxSelection
                        disableRowSelectionOnClick
                        
                        // Лоадер
                        loading={loading}
                        
                        // Стейт вибору
                        onRowSelectionModelChange={(newRowSelectionModel) => {
                            setRowSelectionModel(newRowSelectionModel);
                        }}
                        rowSelectionModel={rowSelectionModel}

                        // --- СТИЛІЗАЦІЯ ПІД МАКЕТ ---
                        sx={{
                            border: 'none', // Прибираємо зовнішню рамку
                            // Стиль заголовків
                            '& .MuiDataGrid-columnHeaders': {
                                borderBottom: '1px solid #e0e0e0', // Лінія під шапкою
                                backgroundColor: '#fff',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                fontWeight: 'bold',
                                color: '#555',
                                outline: 'none !important', // Прибираємо синю обводку при фокусі
                            },
                            // Стиль розділювачів (Separator)
                            '& .MuiDataGrid-columnSeparator': {
                                display: 'none', // Ховаємо стандартні
                            },
                            // Малюємо СВОЇ розділювачі (вертикальні риски в шапці)
                            '& .MuiDataGrid-columnHeader:not(:last-child):after': {
                                content: '""',
                                position: 'absolute',
                                right: 0,
                                top: '25%',
                                height: '50%',
                                width: '1px',
                                backgroundColor: '#e0e0e0',
                            },
                            // Стиль рядків (без вертикальних ліній)
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #e0e0e0',
                                outline: 'none !important',
                            },
                            // Прибираємо рамку при фокусі на клітинці
                            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                        }}
                    />
                </Box>

                {/* DIALOGS */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>{isEditMode ? 'Редагувати клієнта' : 'Створити клієнта'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="normal" label="Email (Логін)" fullWidth
                            value={clientFormData.email}
                            onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                        />
                         <TextField
                            margin="normal" label="Номер телефону" fullWidth
                            value={clientFormData.phone}
                            onChange={(e) => setClientFormData({...clientFormData, phone: e.target.value})}
                        />
                        <TextField
                            margin="normal" label="Компанія" fullWidth
                            value={clientFormData.company}
                            onChange={(e) => setClientFormData({...clientFormData, company: e.target.value})}
                        />
                        <TextField
                            margin="normal" label="Пароль" type="password" fullWidth
                            helperText={isEditMode ? "Залиште пустим, якщо не хочете змінювати" : "Обов'язкове поле"}
                            value={clientFormData.password}
                            onChange={(e) => setClientFormData({...clientFormData, password: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Скасувати</Button>
                        <Button onClick={handleSaveClient} variant="contained" color="primary">Зберегти</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openProfileDialog} onClose={() => setOpenProfileDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Редагування мого профілю</DialogTitle>
                    <DialogContent>
                        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
                            Після збереження змін потрібно буде увійти в систему знову.
                        </Alert>
                        <TextField
                            margin="normal" label="Мій Email" fullWidth
                            value={adminFormData.email}
                            onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                        />
                        <TextField
                            margin="normal" label="Мій номер телефону" fullWidth
                            value={adminFormData.phone}
                            onChange={(e) => setAdminFormData({...adminFormData, phone: e.target.value})}
                        />
                        <TextField
                            margin="normal" label="Новий пароль" type="password" fullWidth
                            helperText="Залиште пустим, якщо не хочете змінювати пароль"
                            value={adminFormData.password}
                            onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenProfileDialog(false)}>Скасувати</Button>
                        <Button onClick={handleSaveAdminProfile} variant="contained" color="primary">
                            Зберегти та Вийти
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Box>
    );
};

export default AdminDashboard;