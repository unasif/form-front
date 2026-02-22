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
    const [rowsPerPage, setRowsPerPage] = useState(10);
	const navigate = useNavigate();

    // --- стан для модального вікна перегляду ---
    const [openDialog, setOpenDialog] = useState(false);
    const [taskViewData, setTaskViewData] = useState({
        id: null,
        topic: '',
        subtopic: '',
        description: '',
        priority: 1,
        files: []
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

    // --- логіка модального вікна ---
    // Відкриття вікна перегляду (клік по рядку)
    const handleRowClickView = (row) => {
        const parts = (row.title || '').split(' | ');
        setTaskViewData({
            id: row.id,
            topic: parts[0] ? parts[0].trim() : '',
            subtopic: parts[1] ? parts[1].trim() : '',
            description: row.description || 'Опис відсутній',
            priority: row.priority || 1,
            files: row.files || []
        });
        setOpenDialog(true);
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
                       {/* Кнопка редагування видалена */}
				</Box>
				
                {error && <Alert severity="error" sx={{ mt: 3, width: '100%' }}>{error}</Alert>}
				
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                    ) : (
                            <Paper sx={{ mt: 4, width: '100%', maxWidth: 1350 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 1350 }}>
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
                                    <TablePagination component="div" count={rows.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25]} labelRowsPerPage="Рядків на сторінці:" />
                                </Box>
                            </Paper>
                    )}
			</Box>

            {/* --- МОДАЛЬНЕ ВІКНО ПЕРЕГЛЯДУ --- */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Перегляд задачі</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        label="Тема"
                        fullWidth
                        value={taskViewData.topic}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="normal"
                        label="Підтема"
                        fullWidth
                        value={taskViewData.subtopic}
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        margin="normal"
                        label="Опис"
                        fullWidth
                        multiline
                        rows={4}
                        value={taskViewData.description}
                        InputProps={{ readOnly: true }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="priority-label">Пріоритет</InputLabel>
                        <Select
                            labelId="priority-label"
                            value={taskViewData.priority}
                            label="Пріоритет"
                            inputProps={{ readOnly: true }}
                            IconComponent={() => null}
                        >
                            {[1,2,3,4,5,6,7,8,9,10].map(p => (
                                <MenuItem key={p} value={p}>{p}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Прикріплені файли:
                        </Typography>
                        {Array.isArray(taskViewData.files) && taskViewData.files.length > 0 ? (
                            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                                {taskViewData.files.map((file, idx) => {
                                    const fileName = file.name || `Файл ${idx + 1}`;
                                    const fileUrl = file.url;

                                    return (
                                        <li key={file.id || idx} style={{ marginBottom: '8px', listStyleType: 'none', display: 'flex', alignItems: 'center' }}>
                                            {fileUrl ? (
                                                <>
                                                    <span style={{ marginRight: '8px' }}>📎</span>
                                                    <a 
                                                        href={fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        download={fileName} 
                                                        style={{ 
                                                            color: '#1976d2', 
                                                            textDecoration: 'underline',
                                                            fontWeight: 500,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {fileName}
                                                    </a>
                                                </>
                                            ) : (
                                                <span style={{ color: 'gray' }}>📎 {fileName} (помилка отримання посилання)</span>
                                            )}
                                        </li>
                                    );
                                })}
                            </Box>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Немає прикріплених файлів
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ pb: 2, pr: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>
                        Закрити
                    </Button>
                </DialogActions>
            </Dialog>
		</Container>
	);
};

export default UserProfile;