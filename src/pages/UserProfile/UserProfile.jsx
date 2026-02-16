import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Paper, CircularProgress,
  Alert, Checkbox, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { fetchTasks, updateTaskApi } from '../../api/taskService';

const colWidths = { checkbox: '60px', title: 'calc(100% - 60px - 120px)', priority: '120px' };

const headerCellStyle = {
	fontWeight: 'bold', color: '#555', display: 'flex', alignItems: 'center',
	height: '56px', paddingLeft: '16px', position: 'relative', boxSizing: 'border-box',
	'&:after': { content: '""', position: 'absolute', right: 0, height: '24px', width: '1px', backgroundColor: '#e0e0e0' }
};

const lastHeaderCellStyle = { ...headerCellStyle, '&:after': { display: 'none' } };

const rowCellStyle = {
	display: 'flex', alignItems: 'center', height: '56px', paddingLeft: '16px',
	color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxSizing: 'border-box'
};

const priorityColors = {
	1: { bg: '#E2E2E2', text: '#555' }, 2: { bg: '#A4C0D7', text: '#fff' },
	3: { bg: '#7CBED1', text: '#fff' }, 4: { bg: '#65BCA6', text: '#fff' },
	5: { bg: '#BCD11D', text: '#fff' }, 6: { bg: '#FFCA05', text: '#fff' },
	7: { bg: '#F9A006', text: '#fff' }, 8: { bg: '#F27200', text: '#fff' },
	9: { bg: '#EA4204', text: '#fff' }, 10: { bg: '#E10404', text: '#fff' },
	pause: { bg: '#CFCFCF', text: '#fff' }, default: { bg: '#e0e0e0', text: '#555' }
};

const UserProfile = () => {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selected, setSelected] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const navigate = useNavigate();

    // --- стани для модального вікна ---
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [taskFormData, setTaskFormData] = useState({
        id: null,
        topic: '',
        subtopic: '',
        description: '',
        priority: 1,
        newFiles: null // Для завантаження нових файлів при редагуванні
    });

	const fetchData = async () => {
		try {
			setLoading(true);
			const data = await fetchTasks();
			let tasks = Array.isArray(data) ? data : (data?.data || []);
			if (!Array.isArray(tasks)) tasks = [];
			tasks = tasks
				.filter((task) => task && typeof task === 'object' && task.id !== undefined && task.title !== undefined)
				.map(({ image, ...rest }) => rest);
			setRows(tasks);
		} catch (err) {
			setError('Не вдалося завантажити задачі.');
			setRows([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleSelectAllClick = (event) => {
		if (event.target.checked) {
			const newSelected = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => row.id);
			setSelected([...new Set([...selected, ...newSelected])]);
			return;
		}
		const currentPageIds = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => row.id);
		setSelected(selected.filter((id) => !currentPageIds.includes(id)));
	};

    // Оновлений handleClick для ЧЕКБОКСА (не для всього рядка)
	const handleCheckboxClick = (id) => {
		const selectedIndex = selected.indexOf(id);
		let newSelected = [];
		if (selectedIndex === -1) {
			newSelected = [...selected, id];
		} else {
			newSelected = selected.filter((selId) => selId !== id);
		}
		setSelected(newSelected);
	};

	const isSelected = (id) => selected.indexOf(id) !== -1;

	const handleChangePage = (event, newPage) => setPage(newPage);
	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleCancelSelection = () => setSelected([]);

    // --- логіка модального вікна (перегляд та редагування) ---

    // Відкриття в режимі перегляду (клік по рядку)
    const handleRowClickView = (row) => {
        // Розділяємо title на topic та subtopic
        const parts = (row.title || '').split(' | ');
        setTaskFormData({
            id: row.id,
            topic: parts[0] ? parts[0].trim() : '',
            subtopic: parts[1] ? parts[1].trim() : '',
            description: row.description || 'Опис відсутній', 
            priority: row.priority || 1,
            newFiles: null
        });
        setIsEditMode(false);
        setOpenDialog(true);
    };

    // Відкриття в режимі РЕДАГУВАННЯ (клік по кнопці)
    const handleOpenEdit = () => {
        if (selected.length !== 1) return;
        const taskToEdit = rows.find(r => r.id === selected[0]);
        if (taskToEdit) {
            const parts = (taskToEdit.title || '').split(' | ');
            setTaskFormData({
                id: taskToEdit.id,
                topic: parts[0] ? parts[0].trim() : '',
                subtopic: parts[1] ? parts[1].trim() : '',
                description: taskToEdit.description || '', // Для редагування
                priority: taskToEdit.priority || 1,
                newFiles: null
            });
            setIsEditMode(true);
            setOpenDialog(true);
        }
    };

    // Збереження змін
    const handleSaveTask = async () => {
        try {
            const formData = new FormData();
            if (taskFormData.topic) formData.append('topic', taskFormData.topic);
            if (taskFormData.subtopic) formData.append('subtopic', taskFormData.subtopic);
            formData.append('priority', taskFormData.priority);
            
            // Якщо вибрані нові файли
            if (taskFormData.newFiles) {
                Array.from(taskFormData.newFiles).forEach(file => {
                    formData.append('files', file);
                });
            }

            await updateTaskApi(taskFormData.id, formData);
            alert('Задачу успішно оновлено!');
            setOpenDialog(false);
            setSelected([]); // Скидаємо виділення
            fetchData(); // Оновлюємо таблицю
        } catch (err) {
            alert('Помилка при оновленні: ' + (err.response?.data?.message || err.message));
        }
    };

	const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<Container maxWidth="md">
			<Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
				<Typography variant="h4" gutterBottom sx={{ mb: 2, ml: 0 }}>
					Перелік задач
				</Typography>
				<Box sx={{ display: 'flex', gap: 2, mt: 1, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', width: '100%', pl: 0 }}>
					<Button variant="contained" sx={{ flex: 0.2 }} onClick={() => navigate('/details')}>
						Додати заявку
					</Button>
                    <Button 
                        variant="contained" 
                        sx={{ flex: 0.2 }} 
                        disabled={selected.length !== 1}
                        onClick={handleOpenEdit} // Додано обробник
                    >
                        редагувати
                    </Button>
					<Button variant="contained" sx={{ flex: 0.2 }} onClick={handleCancelSelection} disabled={selected.length === 0}>
						скасувати
					</Button>
				</Box>
				
                {error && <Alert severity="error" sx={{ mt: 3, width: '100%' }}>{error}</Alert>}
				
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                    ) : (
                        <form style={{ width: '100%' }}>
                            <Paper sx={{ mt: 4, width: '100%', maxWidth: 900 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    {/* Header */}
                                    <Box sx={{ display: 'flex', width: '100%', borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
                                        <Box sx={{ ...headerCellStyle, width: colWidths.checkbox, justifyContent: 'center' }}>
                                            <Checkbox
                                                color="primary"
                                                indeterminate={selected.length > 0 && selected.length < paginatedRows.length}
                                                checked={paginatedRows.length > 0 && paginatedRows.every(row => isSelected(row.id))}
                                                onChange={handleSelectAllClick}
                                            />
                                        </Box>
                                        <Box sx={{ ...headerCellStyle, width: colWidths.title }}>Назва задачі</Box>
                                        <Box sx={{ ...lastHeaderCellStyle, width: colWidths.priority }}>Пріоритет</Box>
                                    </Box>
                                    {/* Body */}
                                    {paginatedRows.map((row) => {
                                        const isItemSelected = isSelected(row.id);
                                        return (
                                            <Box
                                                key={row.id}
                                                sx={{ display: 'flex', width: '100%', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: isItemSelected ? '#f5faff' : 'inherit', transition: 'background 0.2s', '&:hover': { background: '#f9f9f9' } }}
                                                onClick={() => handleRowClickView(row)} // Відкриваємо перегляд при кліку на рядок
                                            >
                                                <Box sx={{ ...rowCellStyle, width: colWidths.checkbox, justifyContent: 'center' }}>
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isItemSelected}
                                                        disableRipple
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); // Запобігаємо відкриттю модального вікна при кліку на чекбокс
                                                            handleCheckboxClick(row.id); 
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ ...rowCellStyle, width: colWidths.title }}>
                                                    <Typography noWrap sx={{ width: '100%', fontSize: 'inherit', color: 'inherit' }}>
                                                        {row.title}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ ...rowCellStyle, width: colWidths.priority, justifyContent: 'center', paddingLeft: 0 }}>
                                                    <Box
                                                        sx={{
                                                            backgroundColor: priorityColors[row.priority]?.bg || priorityColors.default.bg,
                                                            color: priorityColors[row.priority]?.text || priorityColors.default.text,
                                                            minWidth: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.95rem',
                                                            px: 1.5,
                                                            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.08)',
                                                            letterSpacing: '0.02em',
                                                            transition: 'background 0.2s',
                                                        }}
                                                    >
                                                        {row.priority}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                    <TablePagination component="div" count={rows.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Рядків на сторінці:" />
                                </Box>
                            </Paper>
                        </form>
                    )}
			</Box>

            {/* --- МОДАЛЬНЕ ВІКНО --- */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    {isEditMode ? 'Редагування задачі' : 'Перегляд задачі'}
                </DialogTitle>
                
                <DialogContent> 
                    <TextField
                        margin="normal" 
                        label="Тема (Topic)" 
                        fullWidth
                        value={taskFormData.topic}
                        InputProps={{ readOnly: !isEditMode }}
                        onChange={(e) => setTaskFormData({...taskFormData, topic: e.target.value})}
                    />
                    <TextField
                        margin="normal" 
                        label="Підтема (Subtopic)" 
                        fullWidth
                        value={taskFormData.subtopic}
                        InputProps={{ readOnly: !isEditMode }}
                        onChange={(e) => setTaskFormData({...taskFormData, subtopic: e.target.value})}
                    />
                    <TextField
                        margin="normal" 
                        label="Опис" 
                        fullWidth 
                        multiline 
                        rows={4}
                        value={taskFormData.description}
                        InputProps={{ readOnly: !isEditMode }}
                        onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                    />
                    
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="priority-label">Пріоритет</InputLabel>
                        <Select
                            labelId="priority-label"
                            value={taskFormData.priority}
                            label="Пріоритет"
                            inputProps={{ readOnly: !isEditMode }}
                            IconComponent={isEditMode ? undefined : () => null} 
                            onChange={(e) => setTaskFormData({...taskFormData, priority: e.target.value})}
                        >
                            {[1,2,3,4,5,6,7,8,9,10].map(p => (
                                <MenuItem key={p} value={p}>{p}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Поле для завантаження файлів (тільки в режимі редагування) */}
                    {isEditMode && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" gutterBottom>Додати файли:</Typography>
                            <input 
                                type="file" 
                                multiple 
                                onChange={(e) => setTaskFormData({...taskFormData, newFiles: e.target.files})} 
                            />
                        </Box>
                    )}
                    
                    {/* Місце для відображення існуючих файлів в режимі перегляду */}
                    {!isEditMode && (
                         <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                Прикріплені файли:
                            </Typography>
                            <Typography variant="body1">
                                Дані про файли не підтягуються з сервера (потребує оновлення API)
                            </Typography>
                         </Box>
                    )}
                </DialogContent>
                
                <DialogActions sx={{ pb: 2, pr: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>
                        {isEditMode ? 'Скасувати' : 'Закрити'}
                    </Button>
                    {isEditMode && (
                        <Button onClick={handleSaveTask} variant="contained" color="primary">
                            Зберегти
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
		</Container>
	);
};

export default UserProfile;