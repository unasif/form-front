import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    Avatar,
    Menu,
    MenuItem,
    IconButton,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Divider
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings'; // Шестірня по макету
import EditIcon from '@mui/icons-material/Edit';

// Імпортуємо методи API
import { getAllClients, deleteClient, registerUser, updateClient } from '../../api/authService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // --- СТАНИ ---
    const [rows, setRows] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState([]);
    
    // Меню
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Модалка КЛІЄНТІВ (Створити/Редагувати клієнта)
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [clientFormData, setClientFormData] = useState({
        email: '', phone: '', company: '', password: ''
    });

    // Модалка АДМІНА (Редагувати себе)
    const [openProfileDialog, setOpenProfileDialog] = useState(false);
    const [adminFormData, setAdminFormData] = useState({
        email: '', phone: '', company: '', password: ''
    });

    // Дані поточного адміна з LocalStorage
    const currentUser = JSON.parse(localStorage.getItem('user')) || { email: 'admin@gmail.com' };

    // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAllClients();
            const usersList = Array.isArray(data) ? data : (data.data || []);
            setRows(usersList);
        } catch (err) {
            console.error("Помилка завантаження:", err);
            setError('Не вдалося завантажити список клієнтів.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- ЛОГІКА ТАБЛИЦІ ---
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = rows.map((n) => n.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) { newSelected = newSelected.concat(selected, id); }
        else if (selectedIndex === 0) { newSelected = newSelected.concat(selected.slice(1)); }
        else if (selectedIndex === selected.length - 1) { newSelected = newSelected.concat(selected.slice(0, -1)); }
        else if (selectedIndex > 0) { newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1)); }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    // --- ДІЇ З КЛІЄНТАМИ ---
    const handleOpenCreateClient = () => {
        setIsEditMode(false);
        setClientFormData({ email: '', phone: '', company: '', password: '' });
        setOpenDialog(true);
    };

    const handleOpenEditClient = () => {
        if (selected.length !== 1) return;
        const client = rows.find(row => row.id === selected[0]);
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
            for (const id of selected) await deleteClient(id);
            setSelected([]);
            fetchData();
        } catch (err) {
            alert('Помилка при видаленні');
        }
    };

    const handleSaveClient = async () => {
        try {
            if (isEditMode) {
                await updateClient(selected[0], clientFormData);
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

    // --- ДІЇ ПРОФІЛЮ АДМІНА ---
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // 1. Відкрити вікно редагування профілю
    const handleOpenAdminProfile = () => {
        handleMenuClose();
        // Заповнюємо форму поточними даними адміна
        setAdminFormData({
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            company: currentUser.company || '', // Якщо в адміна є компанія
            password: ''
        });
        setOpenProfileDialog(true);
    };

    // 2. Зберегти профіль адміна
    const handleSaveAdminProfile = async () => {
        try {
            if (!currentUser.id) throw new Error("ID користувача не знайдено");
            
            // Оновлюємо самого себе
            await updateClient(currentUser.id, adminFormData);
            
            alert('Ваш профіль оновлено. Будь ласка, увійдіть знову.');
            
            // Логіка виходу після оновлення
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

                    {/* ПРОФІЛЬ АДМІНА (Як на макеті) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: '#bdbdbd', width: 56, height: 56, fontSize: 24 }}>
                                A
                            </Avatar>
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                            {currentUser.email}
                        </Typography>

                        {/* Меню профілю */}
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 150 } }}
                            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleOpenAdminProfile}>
                                <SettingsIcon sx={{ mr: 1.5, fontSize: 20, color: '#757575' }} /> 
                                Редагувати
                            </MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
                                <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> 
                                Вийти
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* КНОПКИ ДІЙ */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        onClick={handleOpenCreateClient}
                    >
                        СТВОРИТИ
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={selected.length !== 1}
                        onClick={handleOpenEditClient}
                    >
                        РЕДАГУВАТИ
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={selected.length === 0}
                        onClick={handleDelete}
                    >
                        ВИДАЛИТИ
                    </Button>
                </Box>

                {/* ТАБЛИЦЯ */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="clients table">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="default"
                                            indeterminate={selected.length > 0 && selected.length < rows.length}
                                            checked={rows.length > 0 && selected.length === rows.length}
                                            onChange={handleSelectAllClick}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Контактна особа</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Компанія</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Номер телефону</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Email</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            Клієнтів не знайдено
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => {
                                        const isItemSelected = isSelected(row.id);
                                        return (
                                            <TableRow
                                                hover
                                                onClick={(event) => handleClick(event, row.id)}
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={row.id}
                                                selected={isItemSelected}
                                                sx={{ cursor: 'pointer', '&.Mui-selected': { bgcolor: '#f5f5f5' } }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox color="default" checked={isItemSelected} />
                                                </TableCell>
                                                <TableCell component="th" scope="row" sx={{ color: '#555' }}>
                                                    {row.name || '—'}
                                                </TableCell>
                                                <TableCell sx={{ color: '#555' }}>{row.company || '—'}</TableCell>
                                                <TableCell sx={{ color: '#555' }}>{row.phone || '—'}</TableCell>
                                                <TableCell sx={{ color: '#555' }}>{row.email}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* МОДАЛЬНЕ ВІКНО 1: ДЛЯ КЛІЄНТІВ */}
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

                {/* МОДАЛЬНЕ ВІКНО 2: ПРОФІЛЬ АДМІНА */}
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