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
    Alert
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import { getAllClients } from '../../api/authService'; // Перевір шлях до файлу!

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    const [rows, setRows] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selected, setSelected] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Дані адміна
    const user = JSON.parse(localStorage.getItem('user')) || { email: 'admin@gmail.com' };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getAllClients();
                
                // Перевірка структури даних
                const usersList = Array.isArray(data) ? data : (data.data || []);
                setRows(usersList);
            } catch (err) {
                console.error("Помилка завантаження клієнтів:", err);
                setError('Не вдалося завантажити список клієнтів.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Логіка чекбоксів ---
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

    // --- Меню профілю ---
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                
                {/* ВЕРХНЯ ЧАСТИНА (Header) по макету */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    mb: 4 
                }}>
                    {/* Заголовок зліва */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h4" component="h1" sx={{ color: '#333', fontWeight: 500 }}>
                            Таблиця клієнтів
                        </Typography>
                    </Box>

                    {/* Профіль справа (Аватар + пошта під ним) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: '#bdbdbd', width: 56, height: 56, fontSize: 24 }}>
                                A
                            </Avatar>
                        </IconButton>
                        <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                            {user.email}
                        </Typography>

                        {/* Випадаюче меню */}
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            PaperProps={{
                                elevation: 3,
                                sx: { mt: 1.5 }
                            }}
                            transformOrigin={{ horizontal: 'center', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleMenuClose}>
                                <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Редагувати
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'red' }}>
                                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Вийти
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
                    >
                        СТВОРИТИ
                    </Button>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={selected.length !== 1}
                    >
                        РЕДАГУВАТИ
                    </Button>
                    {/* На макеті кнопка Видалити теж синя */}
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={selected.length === 0}
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
                    // Прибираємо тінь (elevation={0}) щоб виглядало як на макеті - чисто
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
                                    <TableCell sx={{ fontWeight: 'bold', color: '#555' }}>Ім'я</TableCell>
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
                                                {/* ВІДОБРАЖЕННЯ ДАНИХ: Переконайся, що бекенд віддає ці поля */}
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
            </Container>
        </Box>
    );
};

export default AdminDashboard;