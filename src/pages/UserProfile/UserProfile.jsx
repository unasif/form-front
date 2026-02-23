import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Paper, CircularProgress,
  Alert, Checkbox, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { fetchTasks, downloadTaskFileApi } from '../../api/taskService';

const priorityColWidth = '100px';
const colWidths = {
    title: `calc(100% - ${priorityColWidth})`, 
    priority: priorityColWidth 
};

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

    const handleDownloadFile = async (file) => {
    if (!file.wsPath) return;
    
    try {
        const blob = await downloadTaskFileApi(file.wsPath);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Помилка завантаження:', error);
        alert('Не вдалося завантажити файл. Спробуйте пізніше.');
    }
};
    const getFileIcon = (fileName) => {
    if (!fileName) return <InsertDriveFileIcon sx={{ color: '#757575', mr: 1 }} />;
    
    const ext = fileName.split('.').pop().toLowerCase();
    
    switch (ext) {
        case 'pdf':
            return <PictureAsPdfIcon sx={{ color: '#d32f2f', mr: 1 }} />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
            return <ImageIcon sx={{ color: '#1976d2', mr: 1 }} />;
        case 'doc':
        case 'docx':
        case 'txt':
        case 'rtf':
            return <DescriptionIcon sx={{ color: '#1976d2', mr: 1 }} />;
        case 'xls':
        case 'xlsx':
        case 'csv':
            return <TableChartIcon sx={{ color: '#2e7d32', mr: 1 }} />;
        case 'zip':
        case 'rar':
        case '7z':
            return <FolderZipIcon sx={{ color: '#ed6c02', mr: 1 }} />;
        default:
            return <InsertDriveFileIcon sx={{ color: '#757575', mr: 1 }} />;
    }
};


    const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Container maxWidth={false} sx={{ maxWidth: '3000px', mx: 'auto' }}>
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 2, ml: 0 }}>
                    Перелік задач
                </Typography>
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mt: 1, 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    width: '100%', 
                    pl: 0 
                }}>
                    <Button 
                        variant="contained" 
                        sx={{ 
                            bgcolor: '#1976d2',
                            fontWeight: 'bold',
                            width: { xs: 200, sm: 180 },
                            py: { xs: 1.2, sm: 1 }
                        }} 
                        onClick={() => navigate('/details')}
                    >
                        Додати заявку
                    </Button>
                </Box>
                
                {error && <Alert severity="error" sx={{ mt: 3, width: '100%' }}>{error}</Alert>}
				
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                    ) : (
                            <Paper sx={{ mt: 4, width: '100%' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    {/* Header */}
                                    <Box sx={{ display: 'flex', width: '100%', borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
                                        <Box sx={{ ...headerCellStyle, width: colWidths.title }}>Назва задачі</Box>
                                        <Box sx={{ 
                                            ...lastHeaderCellStyle, 
                                            width: colWidths.priority,
                                            justifyContent: 'center',
                                            paddingLeft: 0
                                        }}>
                                            Пріоритет
                                        </Box>
                                    </Box>
                                    {/* Body */}
                                    {paginatedRows.map((row) => (
                                        <Box
                                            key={row.id}
                                            sx={{ display: 'flex', width: '100%', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.2s', '&:hover': { background: '#f9f9f9' } }}
                                            onClick={() => handleRowClickView(row)}
                                        >
                                            <Box sx={{ ...rowCellStyle, width: colWidths.title }}>
                                                <Typography noWrap sx={{ width: '100%', fontSize: 'inherit', color: 'inherit' }}>
                                                    {row.title}
                                                </Typography>
                                            </Box>
                                                <Box sx={{ 
                                                    ...rowCellStyle, 
                                                    width: colWidths.priority, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    paddingLeft: 0
                                                }}>
                                                    <Box
                                                        sx={{
                                                            backgroundColor: priorityColors[row.priority]?.bg || priorityColors.default.bg,
                                                            color: priorityColors[row.priority]?.text || priorityColors.default.text,
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.95rem',
                                                            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.08)',
                                                            letterSpacing: '0.02em',
                                                            transition: 'background 0.2s',
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {row.priority}
                                                    </Box>
                                                </Box>
                                        </Box>
                                    ))}
                                    <TablePagination component="div" count={rows.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25]} labelRowsPerPage="Рядків на сторінці:" />
                                </Box>
                            </Paper>
                    )}
			</Box>

            {/* --- МОДАЛЬНЕ ВІКНО ПЕРЕГЛЯДУ --- */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
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
                            <Box component="ul" sx={{ pl: 0, mb: 0 }}>
                                {taskViewData.files.map((file, idx) => {
                                    const fileName = file.name || `Файл ${idx + 1}`;
                                    return (
                                        <li key={file.id || idx} style={{ 
                                            marginBottom: '12px', 
                                            listStyleType: 'none', 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            padding: '8px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '8px',
                                            transition: 'background-color 0.2s'
                                        }}>
                                            {getFileIcon(fileName)}
                                            <span 
                                                onClick={() => handleDownloadFile(file)}
                                                style={{ 
                                                    color: '#333', 
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    wordBreak: 'break-word'
                                                }}
                                                onMouseEnter={(e) => e.target.style.color = '#1976d2'}
                                                onMouseLeave={(e) => e.target.style.color = '#333'}
                                            >
                                                {fileName}
                                            </span>
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