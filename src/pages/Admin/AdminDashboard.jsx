import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
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
    Divider,
    TablePagination
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

import { getAllClients, deleteClient, registerUser, updateClient } from '../../api/authService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    const [rows, setRows] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [openProfileDialog, setOpenProfileDialog] = useState(false);

    const [clientFormData, setClientFormData] = useState({
        email: '', phone: '', company: '', password: ''
    });
    const [adminFormData, setAdminFormData] = useState({
        email: '', phone: '', company: '', password: ''
    });

    const currentUser = JSON.parse(localStorage.getItem('user')) || { email: 'admin@gmail.com' };

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAllClients();
            const usersList = Array.isArray(data) ? data : (data?.data || []);
            setRows(usersList);
        } catch (err) {
            console.error(err);
            setError('Не вдалося завантажити список клієнтів.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = rows.map((n) => n.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) { newSelected = newSelected.concat(selected, id); }
        else if (selectedIndex === 0) { newSelected = newSelected.concat(selected.slice(1)); }
        else if (selectedIndex === selected.length - 1) { newSelected = newSelected.concat(selected.slice(0, -1)); }
        else if (selectedIndex > 0) { newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1)); }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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

    const colWidths = {
        checkbox: '60px',
        name: '25%',
        company: '25%',
        phone: '20%',
        email: '30%'
    };

    const headerCellStyle = {
        fontWeight: 'bold',
        color: '#555',
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        paddingLeft: '16px',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            right: 0,
            height: '24px',
            width: '1px',
            backgroundColor: '#e0e0e0'
        }
    };

    const lastHeaderCellStyle = {
        ...headerCellStyle,
        '&:after': { display: 'none' }
    };

    const rowCellStyle = {
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        paddingLeft: '16px',
        color: '#555',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    };

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                
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

                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button 
                        variant="contained" sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        onClick={handleOpenCreateClient}
                    >
                        СТВОРИТИ
                    </Button>
                    <Button 
                        variant="contained" sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={selected.length !== 1}
                        onClick={handleOpenEditClient}
                    >
                        РЕДАГУВАТИ
                    </Button>
                    <Button 
                        variant="contained" sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                        disabled={selected.length === 0}
                        onClick={handleDelete}
                    >
                        ВИДАЛИТИ
                    </Button>
                </Box>

                <Paper sx={{ width: '100%', mb: 2, boxShadow: 0, border: 'none' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            
                            {/* TABLE HEADER (FLEX) */}
                            <Box sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                                <Box sx={{ ...headerCellStyle, width: colWidths.checkbox, justifyContent: 'center', paddingLeft: 0 }}>
                                    <Checkbox
                                        color="default"
                                        indeterminate={selected.length > 0 && selected.length < rows.length}
                                        checked={rows.length > 0 && selected.length === rows.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </Box>
                                <Box sx={{ ...headerCellStyle, width: colWidths.name }}>Контактна особа</Box>
                                <Box sx={{ ...headerCellStyle, width: colWidths.company }}>Компанія</Box>
                                <Box sx={{ ...headerCellStyle, width: colWidths.phone }}>Номер телефону</Box>
                                <Box sx={{ ...lastHeaderCellStyle, width: colWidths.email }}>Email</Box>
                            </Box>

                            {/* TABLE BODY (FLEX ROWS) */}
                            {rows.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: '#777' }}>Клієнтів не знайдено</Box>
                            ) : (
                                rows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => {
                                        const isItemSelected = isSelected(row.id);
                                        return (
                                            <Box
                                                key={row.id}
                                                onClick={() => handleClick(row.id)}
                                                sx={{
                                                    display: 'flex',
                                                    borderBottom: '1px solid #e0e0e0',
                                                    cursor: 'pointer',
                                                    bgcolor: isItemSelected ? '#f5f5f5' : 'transparent',
                                                    '&:hover': { bgcolor: '#f5f5f5' },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <Box sx={{ ...rowCellStyle, width: colWidths.checkbox, justifyContent: 'center', paddingLeft: 0 }}>
                                                    <Checkbox
                                                        color="default"
                                                        checked={isItemSelected}
                                                    />
                                                </Box>
                                                <Box sx={{ ...rowCellStyle, width: colWidths.name }}>{row.name || '—'}</Box>
                                                <Box sx={{ ...rowCellStyle, width: colWidths.company }}>{row.company || '—'}</Box>
                                                <Box sx={{ ...rowCellStyle, width: colWidths.phone }}>{row.phone || '—'}</Box>
                                                <Box sx={{ ...rowCellStyle, width: colWidths.email }}>{row.email}</Box>
                                            </Box>
                                        );
                                    })
                            )}

                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={rows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ borderTop: 'none' }}
                            />
                        </Box>
                    )}
                </Paper>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>{isEditMode ? 'Редагування' : 'Створення клієнта'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="normal" label="E-mail" fullWidth
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
                    <DialogTitle>Редагування</DialogTitle>
                    <DialogContent>
                        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
                            Після збереження змін потрібно буде увійти в систему знову.
                        </Alert>
                        <TextField
                            margin="normal" label="E-mail" fullWidth
                            value={adminFormData.email}
                            onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                        />
                        <TextField
                            margin="normal" label="Номер телефону" fullWidth
                            value={adminFormData.phone}
                            onChange={(e) => setAdminFormData({...adminFormData, phone: e.target.value})}
                        />
                        <TextField
                            margin="normal" label="Пароль" type="password" fullWidth
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