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
    Toolbar,
    AppBar,
    CircularProgress,
    Alert
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import { getAllClients } from '../../api/authService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // СТАН: Тепер дані зберігаємо тут, а не в константі
    const [rows, setRows] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selected, setSelected] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const user = JSON.parse(localStorage.getItem('user')) || { email: 'admin@agency.com' };

    // ЕФЕКТ: Завантажуємо дані при запуску сторінки
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getAllClients();
                
                // Перевірка: якщо бекенд повертає масив не напряму, а в полі data
                // Наприклад: { status: 'ok', data: [...] }
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

    // --- Логіка меню ---
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <AppBar position="static" color="default" sx={{ bgcolor: 'white', boxShadow: 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#333', fontWeight: 'bold' }}>
                        Особистий кабінет (Адміністратор)
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {user.email}
                        </Typography>
                        <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: '#1976d2' }}>A</Avatar>
                        </IconButton>
                        
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleMenuClose}>
                                <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Налаштування
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'red' }}>
                                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Вийти
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Таблиця клієнтів
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button variant="contained" color="primary" sx={{ width: 150 }}>
                        СТВОРИТИ
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        sx={{ width: 150 }}
                        disabled={selected.length !== 1} // Активна тільки якщо вибрано 1
                    >
                        РЕДАГУВАТИ
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error" // Червоний колір для видалення
                        sx={{ width: 150 }}
                        disabled={selected.length === 0} // Активна якщо вибрано хоч щось
                    >
                        ВИДАЛИТИ
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                        <Table sx={{ minWidth: 650 }} aria-label="user table">
                            <TableHead sx={{ bgcolor: '#fafafa' }}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={selected.length > 0 && selected.length < rows.length}
                                            checked={rows.length > 0 && selected.length === rows.length}
                                            onChange={handleSelectAllClick}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Ім'я</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Компанія</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Номер телефону</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
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
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox color="primary" checked={isItemSelected} />
                                                </TableCell>
                                                {/* Тут важливо: перевір назви полів, які повертає бекенд! */}
                                                <TableCell component="th" scope="row">
                                                    {row.name || 'Без імені'}
                                                </TableCell>
                                                <TableCell>{row.company || '-'}</TableCell>
                                                <TableCell>{row.phone || '-'}</TableCell>
                                                <TableCell>{row.email}</TableCell>
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