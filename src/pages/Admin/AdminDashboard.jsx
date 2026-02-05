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
    DialogActions
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
// Імпортуємо всі необхідні методи API
import { getAllClients, deleteClient, registerUser, updateClient } from '../../api/authService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // СТАН ДАНИХ
    const [rows, setRows] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // СТАН ВИБОРУ
    const [selected, setSelected] = useState([]);
    
    // СТАН МЕНЮ ПРОФІЛЮ
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // СТАН МОДАЛЬНОГО ВІКНА (Діалог)
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        company: '',
        password: '' // Пароль потрібен тільки для створення
    });

    const user = JSON.parse(localStorage.getItem('user')) || { email: 'admin@gmail.com' };

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

    // --- ОБРОБКА ТАБЛИЦІ ---
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

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    // --- ОБРОБКА КНОПОК ДІЙ ---

    // 1. ВІДКРИТТЯ ВІКНА СТВОРЕННЯ
    const handleOpenCreate = () => {
        setIsEditMode(false);
        setFormData({ email: '', phone: '', company: '', password: '' });
        setOpenDialog(true);
    };

    // 2. ВІДКРИТТЯ ВІКНА РЕДАГУВАННЯ
    const handleOpenEdit = () => {
        if (selected.length !== 1) return;
        
        const clientToEdit = rows.find(row => row.id === selected[0]);
        if (clientToEdit) {
            setFormData({
                email: clientToEdit.email,
                phone: clientToEdit.phone || '',
                company: clientToEdit.company || '',
                password: '' // Пароль при редагуванні пустий (якщо не міняємо)
            });
            setIsEditMode(true);
            setOpenDialog(true);
        }
    };

    // 3. ВИДАЛЕННЯ
    const handleDelete = async () => {
        if (!window.confirm('Ви впевнені, що хочете видалити вибраних клієнтів?')) return;

        try {
            // Видаляємо всіх вибраних по черзі
            for (const id of selected) {
                await deleteClient(id);
            }
            setSelected([]); // Очистити вибір
            fetchData(); // Оновити таблицю
        } catch (err) {
            alert('Помилка при видаленні');
            console.error(err);
        }
    };

    // 4. ЗБЕРЕЖЕННЯ (Створення або Оновлення)
    const handleSave = async () => {
        try {
            if (isEditMode) {
                // Оновлення
                const userId = selected[0];
                await updateClient(userId, formData);
                alert('Дані оновлено!');
            } else {
                // Створення
                await registerUser(formData);
                alert('Клієнта створено!');
            }
            setOpenDialog(false);
            fetchData(); // Оновити таблицю
        } catch (err) {
            console.error(err);
            alert('Помилка збереження: ' + (err.response?.data?.message || err.message));
        }
    };

    // --- ОБРОБКА МЕНЮ ПРОФІЛЮ ---
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleProfileEdit = () => {
        handleMenuClose();
        navigate('/profile'); // Перехід на сторінку профілю адміна
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                
                {/* HEADER */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box sx={{ mt: 2 }}>
                        {/* Змінено h1 на h2 */}
                        <Typography variant="h4" component="h2" sx={{ color: '#333', fontWeight: 500 }}>
                            Таблиця клієнтів
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: '#bdbdbd', width: 56, height: 56, fontSize: 24 }}>
                                A
                            </Avatar>
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                            {user.email}
                        </Typography>

                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            PaperProps={{ elevation: 3, sx: { mt: 1.5 } }}
                            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                        >
                            {/* Тепер ця кнопка веде на профіль */}
                            <MenuItem onClick={handleProfileEdit}>
                                <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Мій профіль
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'red' }}>
                                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Вийти
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* КНОПКИ ДІЙ (ТЕПЕР ВОНИ ПРАЦЮЮТЬ) */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        onClick={handleOpenCreate} // Додано обробник
                    >
                        СТВОРИТИ
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={selected.length !== 1}
                        onClick={handleOpenEdit} // Додано обробник
                    >
                        РЕДАГУВАТИ
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={selected.length === 0}
                        onClick={handleDelete} // Додано обробник
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
                                    {/* Змінено назву стовпця */}
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

                {/* МОДАЛЬНЕ ВІКНО ДЛЯ СТВОРЕННЯ/РЕДАГУВАННЯ */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>{isEditMode ? 'Редагувати клієнта' : 'Створити клієнта'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="normal"
                            label="Email (Логін)"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                         <TextField
                            margin="normal"
                            label="Номер телефону"
                            fullWidth
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                        <TextField
                            margin="normal"
                            label="Компанія"
                            fullWidth
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                        />
                        <TextField
                            margin="normal"
                            label="Пароль"
                            type="password"
                            fullWidth
                            helperText={isEditMode ? "Залиште пустим, якщо не хочете змінювати" : "Обов'язкове поле для створення"}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Скасувати</Button>
                        <Button onClick={handleSave} variant="contained" color="primary">
                            Зберегти
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default AdminDashboard;