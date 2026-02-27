import React, { useState, useEffect, useRef } from 'react';
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
    TablePagination,
    FormControlLabel,
    FormControl,
    InputLabel,
    Select,
    useMediaQuery
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';

import { getAllClients, deleteClient, registerUser, updateClient, getAllProjects } from '../../api/authService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    const isHideProject = useMediaQuery('(max-width:1400px)');
    const isMobile = useMediaQuery('(max-width:990px)');
    const isTablet = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:550px)');
    const showProject = (!isHideProject || isMobile) && !isSmallMobile;

    const [rows, setRows] = useState([]); 
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [showDeleteId, setShowDeleteId] = useState(null);
    const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);
    const pressTimer = useRef(null);
    const touchStartPos = useRef({ x: 0, y: 0 });

    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [openProfileDialog, setOpenProfileDialog] = useState(false);

    const [clientFormData, setClientFormData] = useState({
        email: '', phone: '', company: '', password: '', role: 'client', name: '', projectId: ''
    });
    const [adminFormData, setAdminFormData] = useState({
        email: '', phone: '', company: '', password: ''
    });

    const currentUser = JSON.parse(localStorage.getItem('user')) || { email: 'admin@gmail.com' };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, projectsData] = await Promise.all([
                getAllClients(),
                getAllProjects()
            ]);
            
            const usersList = Array.isArray(usersData) ? usersData : (usersData?.data || []);
            const filteredList = usersList.filter(user => 
                user.id !== currentUser.id && user.email !== currentUser.email
            );
            setRows(filteredList);
            setProjects(projectsData || []);
        } catch (err) {
            console.error(err);
            setError('Не вдалося завантажити дані.');
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
        if (isMobile) return; 
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) { newSelected = newSelected.concat(selected, id); }
        else if (selectedIndex === 0) { newSelected = newSelected.concat(selected.slice(1)); }
        else if (selectedIndex === selected.length - 1) { newSelected = newSelected.concat(selected.slice(0, -1)); }
        else if (selectedIndex > 0) { newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1)); }
        setSelected(newSelected);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const handlePointerDown = (id, e) => {
        if (!isMobile) return;
        touchStartPos.current = { x: e.clientX, y: e.clientY };
        setIsLongPressTriggered(false);
        pressTimer.current = setTimeout(() => {
            setShowDeleteId(id);
            setIsLongPressTriggered(true);
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        }, 600); 
    };

    const handlePointerMove = (e) => {
        if (!pressTimer.current) return;
        const dx = Math.abs(e.clientX - touchStartPos.current.x);
        const dy = Math.abs(e.clientY - touchStartPos.current.y);
        if (dx > 10 || dy > 10) {
            clearPressTimer();
        }
    };

    const clearPressTimer = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const handleMobileRowClick = (client) => {
        if (!isMobile) return;
        if (isLongPressTriggered) {
            setIsLongPressTriggered(false);
            return;
        }
        if (showDeleteId !== null) {
            setShowDeleteId(null);
            return;
        }
        setClientFormData({
            email: (client.email === 'Не вказано' || !client.email) ? '' : client.email,
            phone: (client.phone === 'Не вказано' || !client.phone) ? '' : client.phone,
            company: (client.company === '-' || !client.company) ? '' : client.company,
            password: '',
            role: client.role || 'client',
            name: (client.name === 'Без імені' || !client.name) ? '' : client.name,
            projectId: client.projectId || ''
        });
        setIsEditMode(true);
        setOpenDialog(true);
    };

    const handleSingleDelete = async (id, e) => {
        e.stopPropagation(); 
        if (!window.confirm('Ви впевнені, що хочете видалити цього клієнта?')) return;
        try {
            await deleteClient(id);
            setShowDeleteId(null);
            fetchData();
        } catch (err) {
            alert('Помилка при видаленні');
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenCreateClient = () => {
        setIsEditMode(false);
        setClientFormData({ email: '', phone: '', company: '', password: '', role: 'client', name: '', projectId: '' });
        setOpenDialog(true);
    };

    const handleOpenEditClient = () => {
        if (selected.length !== 1) return;
        const client = rows.find(row => row.id === selected[0]);
        if (client) {
            setClientFormData({
                email: (client.email === 'Не вказано' || !client.email) ? '' : client.email,
                phone: (client.phone === 'Не вказано' || !client.phone) ? '' : client.phone,
                company: (client.company === '-' || !client.company) ? '' : client.company,
                password: '',
                role: client.role || 'client',
                name: (client.name === 'Без імені' || !client.name) ? '' : client.name,
                projectId: client.projectId || ''
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
            if (clientFormData.role === 'client' && !clientFormData.projectId) {
                alert("Будь ласка, оберіть проєкт у Worksection для цього клієнта.");
                return;
            }
            if (isEditMode) {
                await updateClient(isMobile ? clientFormData.id : selected[0], clientFormData);
                alert('Дані оновлено!');
            } else {
                await registerUser(clientFormData);
                alert(clientFormData.role === 'admin' ? 'Адміністратора створено!' : 'Клієнта створено!');
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

    const getProjectName = (id) => {
        if (!id) return '—';
        const project = projects.find(p => String(p.id) === String(id));
        return project ? project.name : '—';
    };

    const headerCellStyle = {
        fontWeight: 'bold',
        color: '#555',
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        paddingLeft: '16px',
        paddingRight: '16px',
        position: 'relative',
        minWidth: 0,
        '&:after': {
            content: '""',
            position: 'absolute',
            right: 0,
            height: '24px',
            width: '1px',
            backgroundColor: '#e0e0e0'
        }
    };

    const lastHeaderCellStyle = { ...headerCellStyle, '&:after': { display: 'none' } };

    const rowCellStyle = {
        display: 'flex',
        alignItems: 'center',
        height: '64px', 
        paddingLeft: '16px',
        paddingRight: '16px',
        color: '#555',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0
    };

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh', py: { xs: 2, md: 4 } }}>
            <Container component="form" maxWidth={false} sx={{ maxWidth: 1920 }}>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 2, md: 4 } }}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant={isMobile ? "h5" : "h4"} component="h2" sx={{ color: '#333', fontWeight: 500 }}>
                            Перелік клієнтів
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: '#bdbdbd', width: { xs: 46, md: 56 }, height: { xs: 46, md: 56 }, fontSize: { xs: 20, md: 24 } }}>A</Avatar>
                        </IconButton>
                        {!isSmallMobile && (
                            <Typography variant="body2" sx={{ color: '#757575', mt: 1 }}>
                                {currentUser.email}
                            </Typography>
                        )}
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

                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#1976d2', width: isMobile ? '100%' : 140, fontWeight: 'bold', py: isMobile ? 1.5 : 1 }}
                        onClick={handleOpenCreateClient}
                    >
                        СТВОРИТИ
                    </Button>
                    {!isMobile && (
                        <>
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
                        </>
                    )}
                </Box>

                <Paper sx={{ width: '100%', mb: 2, boxShadow: isMobile ? 1 : 0, border: isMobile ? '1px solid #e0e0e0' : 'none', overflow: 'hidden' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            
                            <Box sx={{ display: 'flex', borderBottom: '2px solid #e0e0e0', bgcolor: '#f9f9f9' }}>
                                {!isMobile && (
                                    <Box sx={{ ...headerCellStyle, width: '60px', flexShrink: 0, justifyContent: 'center', paddingLeft: 0, paddingRight: 0, '&:after': { display: 'none' } }}>
                                        <Checkbox
                                            color="default"
                                            indeterminate={selected.length > 0 && selected.length < rows.length}
                                            checked={rows.length > 0 && selected.length === rows.length}
                                            onChange={handleSelectAllClick}
                                        />
                                    </Box>
                                )}
                                <Box sx={{ ...headerCellStyle, flex: 2 }}>Контактна особа</Box>
                                <Box sx={{ ...(isSmallMobile ? lastHeaderCellStyle : headerCellStyle), flex: isSmallMobile ? 1 : 1.2 }}>Організація</Box>
                                {showProject && (
                                    <Box sx={{ ...(isTablet ? lastHeaderCellStyle : headerCellStyle), flex: 1.5 }}>Проєкт</Box>
                                )}
                                {!isTablet && (
                                    <Box sx={{ ...headerCellStyle, width: '190px', flexShrink: 0 }}>Номер телефону</Box>
                                )}
                                {!isMobile && (
                                    <Box sx={{ ...headerCellStyle, flex: 1.5 }}>Email</Box>
                                )}
                                {!isTablet && (
                                    <Box sx={{ ...lastHeaderCellStyle, width: '140px', flexShrink: 0 }}>Адміністратор</Box>
                                )}
                            </Box>

                            {rows.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: '#777' }}>Клієнтів не знайдено</Box>
                            ) : (
                                rows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => {
                                        const isItemSelected = isSelected(row.id);
                                        const isDeleteVisible = showDeleteId === row.id;

                                        return (
                                            <Box
                                                key={row.id}
                                                onClick={() => isMobile ? handleMobileRowClick(row) : handleClick(row.id)}
                                                onPointerDown={(e) => handlePointerDown(row.id, e)}
                                                onPointerMove={handlePointerMove}
                                                onPointerUp={clearPressTimer}
                                                onPointerLeave={clearPressTimer}
                                                onPointerCancel={clearPressTimer} 
                                                onContextMenu={(e) => { if(isMobile) e.preventDefault(); }}
                                                sx={{
                                                    display: 'flex',
                                                    borderBottom: '1px solid #e0e0e0',
                                                    cursor: 'pointer',
                                                    bgcolor: isItemSelected ? '#f5f5f5' : 'transparent',
                                                    '&:hover': { bgcolor: isMobile ? 'transparent' : '#f5f5f5' },
                                                    transition: 'background-color 0.2s',
                                                    position: 'relative',
                                                    WebkitTouchCallout: isMobile ? 'none' : 'auto',
                                                    WebkitUserSelect: isMobile ? 'none' : 'auto',
                                                    userSelect: isMobile ? 'none' : 'auto',
                                                }}
                                            >
                                                {!isMobile && (
                                                    <Box sx={{ ...rowCellStyle, width: '60px', flexShrink: 0, justifyContent: 'center', paddingLeft: 0, paddingRight: 0 }}>
                                                        <Checkbox color="default" checked={isItemSelected} />
                                                    </Box>
                                                )}
                                                <Box sx={{ ...rowCellStyle, flex: 2 }}>{row.name && row.name !== 'Без імені' ? row.name : '—'}</Box>
                                                <Box sx={{ ...rowCellStyle, flex: isSmallMobile ? 1 : 1.2 }}>{row.company && row.company !== '-' ? row.company : '—'}</Box>
                                                {showProject && (
                                                    <Box sx={{ ...rowCellStyle, flex: 1.5 }}>{getProjectName(row.projectId)}</Box>
                                                )}
                                                {!isTablet && (
                                                    <Box sx={{ ...rowCellStyle, width: '190px', flexShrink: 0 }}>{row.phone || '—'}</Box>
                                                )}
                                                {!isMobile && (
                                                    <Box sx={{ ...rowCellStyle, flex: 1.5 }}>{row.email && row.email !== 'Не вказано' ? row.email : '—'}</Box>
                                                )}
                                                {!isTablet && (
                                                    <Box sx={{ ...rowCellStyle, width: '140px', flexShrink: 0 }}>
                                                        {row.role === 'admin' ? 'Так' : '—'}
                                                    </Box>
                                                )}
                                                {isDeleteVisible && (
                                                    <Box 
                                                        sx={{
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            bgcolor: '#f44336',
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            px: 3,
                                                            animation: 'slideIn 0.2s ease-out',
                                                            '@keyframes slideIn': {
                                                                from: { transform: 'translateX(100%)' },
                                                                to: { transform: 'translateX(0)' }
                                                            }
                                                        }}
                                                        onClick={(e) => handleSingleDelete(row.id, e)}
                                                    >
                                                        <DeleteIcon />
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    })
                            )}

                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50]}
                                component="div"
                                count={rows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ borderTop: 'none' }}
                                labelRowsPerPage="Рядків на сторінці:"
                                labelDisplayedRows={({ from, to, count }) => 
                                    `${from}–${to} з ${count !== -1 ? count : `більше ніж ${to}`}`
                                }
                            />
                        </Box>
                    )}
                </Paper>

                <Dialog 
                    open={openDialog} 
                    onClose={() => setOpenDialog(false)} 
                    fullWidth 
                    maxWidth="sm"
                    PaperProps={{
                        component: 'form',
                        onSubmit: (e) => {
                            e.preventDefault();
                            handleSaveClient();
                        }
                    }}
                >
                    <DialogTitle>{isEditMode ? 'Редагування користувача' : 'Створення користувача'}</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="normal" label="E-mail" fullWidth 
                            value={clientFormData.email}
                            onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                        />
                         <TextField
                            margin="normal" label="Номер телефону" fullWidth required
                            value={clientFormData.phone}
                            onChange={(e) => setClientFormData({...clientFormData, phone: e.target.value})}
                        />

                        {clientFormData.role === 'client' && (
                            <>
                                <TextField
                                    margin="normal" label="Ім'я контактної особи" fullWidth required
                                    value={clientFormData.name}
                                    onChange={(e) => setClientFormData({...clientFormData, name: e.target.value})}
                                />
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="project-select-label">Проєкт у Worksection</InputLabel>
                                    <Select
                                        labelId="project-select-label"
                                        value={clientFormData.projectId}
                                        label="Проєкт у Worksection"
                                        onChange={(e) => setClientFormData({...clientFormData, projectId: e.target.value})}
                                        MenuProps={{
                                            PaperProps: {
                                                style: { maxHeight: 250 },
                                            },
                                        }}
                                    >
                                        {projects.map((project) => (
                                            <MenuItem key={project.id} value={project.id}>
                                                {project.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    margin="normal" label="Організація" fullWidth
                                    value={clientFormData.company}
                                    onChange={(e) => setClientFormData({...clientFormData, company: e.target.value})}
                                />
                            </>
                        )}

                        <TextField
                            margin="normal" label="Пароль" type="password" fullWidth
                            helperText={isEditMode ? "Залиште пустим, якщо не хочете змінювати" : "Обов'язкове поле"}
                            required={!isEditMode}
                            value={clientFormData.password}
                            onChange={(e) => setClientFormData({...clientFormData, password: e.target.value})}
                        />

                        <Box sx={{ mt: 2, mb: 1 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={clientFormData.role === 'admin'}
                                        onChange={(e) => setClientFormData({ 
                                            ...clientFormData, 
                                            role: e.target.checked ? 'admin' : 'client' 
                                        })}
                                        color="primary"
                                    />
                                }
                                label='Надати права "Адміністратор"'
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Скасувати</Button>
                        <Button type="submit" variant="contained" color="primary">Зберегти</Button>
                    </DialogActions>
                </Dialog>

                <Dialog 
                    open={openProfileDialog} 
                    onClose={() => setOpenProfileDialog(false)} 
                    fullWidth 
                    maxWidth="sm"
                    PaperProps={{
                        component: 'form',
                        onSubmit: (e) => {
                            e.preventDefault();
                            handleSaveAdminProfile();
                        }
                    }}
                >
                    <DialogTitle>Редагування профілю</DialogTitle>
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
                            margin="normal" label="Номер телефону" fullWidth required
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
                        <Button type="submit" variant="contained" color="primary">
                            Зберегти та Вийти
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default AdminDashboard;