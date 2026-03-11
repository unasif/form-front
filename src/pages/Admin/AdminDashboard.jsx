import React, { useState, useEffect, useRef, useMemo } from 'react';
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
    useMediaQuery,
    InputAdornment
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { getAllClients, deleteClient, registerUser, updateClient, getAllProjects } from '../../api/authService';

const AdminDashboard = () => {
    const navigate = useNavigate(); 
    const isHideProject = useMediaQuery('(max-width:1400px)');
    const isMobile = useMediaQuery('(max-width:990px)');
    const isTablet = useMediaQuery('(max-width:768px)');
    const isButtonFullWidth = useMediaQuery('(max-width:600px)');
    const isSmallMobile = useMediaQuery('(max-width:550px)');
    const showProject = !isHideProject;
    const [rows, setRows] = useState([]); 
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [projectFilter, setProjectFilter] = useState('all');
    const [managerFilter, setManagerFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [showDeleteId, setShowDeleteId] = useState(null);
    const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);
    const pressTimer = useRef(null);
    const touchStartPos = useRef({ x: 0, y: 0 });
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [openProfileDialog, setOpenProfileDialog] = useState(false);
    const [showFormPassword, setShowFormPassword] = useState(false);
    const [showAdminFormPassword, setShowAdminFormPassword] = useState(false);
    const [clientFormData, setClientFormData] = useState({
        id: '', email: '', phone: '', company: '', password: '', role: 'client', name: '', projectId: ''
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

    const uniqueManagers = useMemo(() => {
        const managersMap = new Map();
        projects.forEach(p => {
            if (p.managerEmail) {
                managersMap.set(p.managerEmail, p.managerName || p.managerEmail);
            }
        });
        return Array.from(managersMap.entries()).map(([email, name]) => ({ email, name }));
    }, [projects]);

    const getProjectName = (id) => {
        if (!id) return '—';
        const project = projects.find(p => String(p.id) === String(id));
        return project ? project.name : '—';
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const processedRows = useMemo(() => {
        let result = rows.filter(row => {
            const matchProject = projectFilter === 'all' || String(row.projectId) === String(projectFilter);
            let matchManager = true;
            if (managerFilter !== 'all') {
                const project = projects.find(p => String(p.id) === String(row.projectId));
                matchManager = project && project.managerEmail === managerFilter;
            }
            return matchProject && matchManager;
        });
        if (sortConfig.key) {
            result.sort((a, b) => {
                let valA = '';
                let valB = '';
                if (sortConfig.key === 'project') {
                    valA = getProjectName(a.projectId);
                    valB = getProjectName(b.projectId);
                } else if (sortConfig.key === 'admin') {
                    valA = a.role === 'admin' ? 'Так' : 'Ні';
                    valB = b.role === 'admin' ? 'Так' : 'Ні';
                } else {
                    valA = a[sortConfig.key] || '';
                    valB = b[sortConfig.key] || '';
                }
                const strA = String(valA).trim();
                const strB = String(valB).trim();
                const compareResult = strA.localeCompare(strB, 'uk', { numeric: true });  
                return sortConfig.direction === 'asc' ? compareResult : -compareResult;
            });
        }
        return result;
    }, [rows, projectFilter, managerFilter, sortConfig, projects]);

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = processedRows.map((n) => n.id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleCheckboxClick = (id) => {
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

    const handleRowClick = (client) => {
        if (isMobile) {
            if (isLongPressTriggered) {
                setIsLongPressTriggered(false);
                return;
            }
            if (showDeleteId !== null) {
                setShowDeleteId(null);
                return;
            }
        }
        const isHashed = client.password && (client.password.startsWith('$2a$') || client.password.startsWith('$2b$'));
        setClientFormData({
            id: client.id,
            email: (client.email === 'Не вказано' || !client.email) ? '' : client.email,
            phone: (client.phone === 'Не вказано' || !client.phone) ? '' : client.phone,
            company: (client.company === '-' || !client.company) ? '' : client.company,
            password: isHashed ? '' : (client.password || ''),
            role: client.role || 'client',
            name: (client.name === 'Без імені' || !client.name) ? '' : client.name,
            projectId: client.projectId || ''
        });
        setIsEditMode(true);
        setShowFormPassword(false);
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
        setShowFormPassword(false);
        setClientFormData({ id: '', email: '', phone: '', company: '', password: '', role: 'client', name: '', projectId: '' });
        setOpenDialog(true);
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

    const validatePhone = (phone) => {
        return /^0\d{9}$/.test(phone);
    };

    const handleSaveClient = async () => {
        try {
            if (!validatePhone(clientFormData.phone)) {
                alert("Номер телефону має бути у форматі 0999999999 (10 цифр, починається з 0).");
                return;
            }
            if (clientFormData.role === 'client' && !clientFormData.projectId) {
                alert("Будь ласка, оберіть проєкт у Worksection для цього клієнта.");
                return;
            }
            if (isEditMode) {
                await updateClient(clientFormData.id, clientFormData);
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
        setShowAdminFormPassword(false);
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
            if (!validatePhone(adminFormData.phone)) {
                alert("Номер телефону має бути у форматі 0999999999 (10 цифр, починається з 0).");
                return;
            }
            if (!currentUser.id) throw new Error("ID користувача не знайдено");
            await updateClient(currentUser.id, adminFormData);
            alert('Ваш профіль оновлено. Будь ласка, увійдіть знову.');
            handleLogout(); 
        } catch (err) {
            alert('Помилка оновлення профілю: ' + (err.response?.data?.message || err.message));
        }
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

    const sortableHeaderStyle = {
        ...headerCellStyle,
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': { backgroundColor: '#f0f0f0' }
    };

    const lastHeaderCellStyle = { ...sortableHeaderStyle, '&:after': { display: 'none' } };

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

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return (
            <span style={{ marginLeft: '4px', fontSize: '14px', color: '#1976d2' }}>
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
        );
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

                <Box sx={{ 
                    display: 'flex', 
                    mb: 4, 
                    flexDirection: { xs: 'column', lg: 'row' }, 
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', lg: 'center' },
                    gap: 3
                }}>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: isButtonFullWidth ? 'column' : 'row' }}>
                        <Button 
                            variant="contained" 
                            sx={{ bgcolor: '#1976d2', width: isButtonFullWidth ? '100%' : 140, fontWeight: 'bold', py: isButtonFullWidth ? 1.5 : 1 }}
                            onClick={handleOpenCreateClient}
                        >
                            СТВОРИТИ
                        </Button>
                        {!isMobile && (
                            <Button 
                                variant="contained" sx={{ bgcolor: '#1976d2', width: 140, fontWeight: 'bold' }}
                                disabled={selected.length === 0}
                                onClick={handleDelete}
                            >
                                ВИДАЛИТИ
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        flexDirection: { xs: 'column', sm: 'row' },
                        flexWrap: 'wrap'
                    }}>
                        <FormControl sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }} size="small">
                            <InputLabel id="manager-filter-label">Керівник проєкту</InputLabel>
                            <Select
                                labelId="manager-filter-label"
                                value={managerFilter}
                                label="Керівник проєкту"
                                onChange={(e) => {
                                    setManagerFilter(e.target.value);
                                    setPage(0);
                                }}
                                MenuProps={{
                                    PaperProps: { style: { maxHeight: 300 } },
                                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                                    transformOrigin: { vertical: 'top', horizontal: 'left' }
                                }}
                            >
                                <MenuItem value="all">Всі керівники</MenuItem>
                                {uniqueManagers.map(m => (
                                    <MenuItem key={m.email} value={m.email}>{m.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }} size="small">
                            <InputLabel id="project-filter-label">Проєкт</InputLabel>
                            <Select
                                labelId="project-filter-label"
                                value={projectFilter}
                                label="Проєкт"
                                onChange={(e) => {
                                    setProjectFilter(e.target.value);
                                    setPage(0);
                                }}
                                MenuProps={{
                                    PaperProps: { style: { maxHeight: 300 } },
                                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                                    transformOrigin: { vertical: 'top', horizontal: 'left' }
                                }}
                            >
                                <MenuItem value="all">Всі проєкти</MenuItem>
                                {projects.map(p => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
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
                                            indeterminate={selected.length > 0 && selected.length < processedRows.length}
                                            checked={processedRows.length > 0 && selected.length === processedRows.length}
                                            onChange={handleSelectAllClick}
                                        />
                                    </Box>
                                )}
                                <Box sx={{ ...sortableHeaderStyle, flex: 2 }} onClick={() => handleSort('name')}>
                                    Контактна особа <SortIcon columnKey="name" />
                                </Box>
                                <Box sx={{ ...(isSmallMobile ? lastHeaderCellStyle : sortableHeaderStyle), flex: 1.2 }} onClick={() => handleSort('company')}>
                                    Організація <SortIcon columnKey="company" />
                                </Box>
                                {showProject && (
                                    <Box sx={{ ...sortableHeaderStyle, flex: 1.5 }} onClick={() => handleSort('project')}>
                                        Проєкт <SortIcon columnKey="project" />
                                    </Box>
                                )}
                                {!isTablet && (
                                    <Box sx={{ ...sortableHeaderStyle, width: '130px', flexShrink: 0 }} onClick={() => handleSort('phone')}>
                                        Телефон <SortIcon columnKey="phone" />
                                    </Box>
                                )}
                                {!isMobile && (
                                    <Box sx={{ ...sortableHeaderStyle, flex: 1.5 }} onClick={() => handleSort('email')}>
                                        Email <SortIcon columnKey="email" />
                                    </Box>
                                )}
                                {!isTablet && (
                                    <Box sx={{ ...lastHeaderCellStyle, width: '140px', flexShrink: 0 }} onClick={() => handleSort('admin')}>
                                        Адміністратор <SortIcon columnKey="admin" />
                                    </Box>
                                )}
                            </Box>

                            {processedRows.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center', color: '#777' }}>Клієнтів не знайдено</Box>
                            ) : (
                                processedRows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => {
                                        const isItemSelected = isSelected(row.id);
                                        const isDeleteVisible = showDeleteId === row.id;
                                        return (
                                            <Box
                                                key={row.id}
                                                onClick={() => handleRowClick(row)}
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
                                                    <Box 
                                                        sx={{ ...rowCellStyle, width: '60px', flexShrink: 0, justifyContent: 'center', paddingLeft: 0, paddingRight: 0 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCheckboxClick(row.id);
                                                        }}
                                                    >
                                                        <Checkbox color="default" checked={isItemSelected} />
                                                    </Box>
                                                )}
                                                <Box sx={{ ...rowCellStyle, flex: 2 }}>{row.name && row.name !== 'Без імені' ? row.name : '—'}</Box>
                                                <Box sx={{ ...rowCellStyle, flex: isSmallMobile ? 1 : 1.2 }}>{row.company && row.company !== '-' ? row.company : '—'}</Box>
                                                {showProject && (
                                                    <Box sx={{ ...rowCellStyle, flex: 1.5 }}>{getProjectName(row.projectId)}</Box>
                                                )}
                                                {!isTablet && (
                                                    <Box sx={{ ...rowCellStyle, width: '130px', flexShrink: 0 }}>{row.phone || '—'}</Box>
                                                )}
                                                {!isMobile && (
                                                    <Box sx={{ ...rowCellStyle, flex: 1.5 }}>{row.email && row.email !== 'Не вказано' ? row.email : '—'}</Box>
                                                )}
                                                {!isTablet && (
                                                    <Box sx={{ ...rowCellStyle, width: '140px', flexShrink: 0 }}>
                                                        <Checkbox 
                                                            checked={row.role === 'admin'} 
                                                            disableRipple
                                                            color="primary"
                                                            sx={{ pointerEvents: 'none', p: 0 }}
                                                        />
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
                                count={processedRows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Рядків на сторінці:"
                                labelDisplayedRows={({ from, to, count }) => 
                                    `${from}–${to} з ${count !== -1 ? count : `більше ніж ${to}`}`
                                }
                                sx={{ 
                                    borderTop: 'none',
                                    '.MuiTablePagination-toolbar': {
                                        paddingLeft: { xs: 0, sm: 2 },
                                        paddingRight: { xs: 0, sm: 2 },
                                    },
                                    '.MuiTablePagination-selectLabel, .MuiTablePagination-select, .MuiTablePagination-selectIcon': {
                                        display: { xs: 'none', sm: 'inline-flex' } 
                                    },
                                    '.MuiTablePagination-displayedRows': {
                                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                    }
                                }}
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
                        autoComplete: 'off',
                        onSubmit: (e) => {
                            e.preventDefault();
                            handleSaveClient();
                        }
                    }}
                >
                    <DialogTitle>{isEditMode ? 'Редагування користувача' : 'Створення користувача'}</DialogTitle>
                    <DialogContent>
                        <input style={{ display: 'none' }} type="email" name="fakeusernameremembered"/>
                        <input style={{ display: 'none' }} type="password" name="fakepasswordremembered"/>
                        <TextField
                            margin="normal" label="E-mail" fullWidth 
                            value={clientFormData.email}
                            autoComplete="new-password"
                            onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                        />
                         <TextField
                            margin="normal" label="Номер телефону" fullWidth required
                            placeholder="0999999999"
                            value={clientFormData.phone}
                            autoComplete="new-password"
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setClientFormData({...clientFormData, phone: val});
                            }}
                        />

                        {clientFormData.role === 'client' && (
                            <>
                                <TextField
                                    margin="normal" label="Ім'я контактної особи" fullWidth required
                                    value={clientFormData.name}
                                    autoComplete="new-password"
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
                                            PaperProps: { style: { maxHeight: 300 } },
                                            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                                            transformOrigin: { vertical: 'top', horizontal: 'left' }
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
                                    autoComplete="new-password"
                                    onChange={(e) => setClientFormData({...clientFormData, company: e.target.value})}
                                />
                            </>
                        )}

                        <TextField
                            margin="normal" label="Пароль" type={showFormPassword ? 'text' : 'password'} fullWidth
                            helperText={isEditMode ? "Залиште пустим, якщо не хочете змінювати" : "Обов'язкове поле"}
                            required={!isEditMode}
                            value={clientFormData.password}
                            autoComplete="new-password"
                            onChange={(e) => setClientFormData({...clientFormData, password: e.target.value})}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowFormPassword(!showFormPassword)} edge="end">
                                            {showFormPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
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
                        autoComplete: 'off',
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
                        <input style={{ display: 'none' }} type="email" name="fakeusernameremembered"/>
                        <input style={{ display: 'none' }} type="password" name="fakepasswordremembered"/>
                        <TextField
                            margin="normal" label="E-mail" fullWidth 
                            value={adminFormData.email}
                            autoComplete="new-password"
                            onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                        />
                        <TextField
                            margin="normal" label="Номер телефону" fullWidth required
                            placeholder="0999999999"
                            value={adminFormData.phone}
                            autoComplete="new-password"
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setAdminFormData({...adminFormData, phone: val});
                            }}
                        />
                        <TextField
                            margin="normal" label="Пароль" type={showAdminFormPassword ? 'text' : 'password'} fullWidth
                            helperText="Залиште пустим, якщо не хочете змінювати пароль"
                            value={adminFormData.password}
                            autoComplete="new-password"
                            onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowAdminFormPassword(!showAdminFormPassword)} edge="end">
                                            {showAdminFormPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
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