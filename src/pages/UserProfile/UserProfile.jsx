
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Checkbox,
  TablePagination
} from '@mui/material';
import { fetchTasks } from '../../api/taskService';

const colWidths = {
	checkbox: '60px',
	title: 'calc(100% - 60px - 120px)',
	priority: '120px'
};

const headerCellStyle = {
	fontWeight: 'bold',
	color: '#555',
	display: 'flex',
	alignItems: 'center',
	height: '56px',
	paddingLeft: '16px',
	position: 'relative',
	boxSizing: 'border-box',
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
	whiteSpace: 'nowrap',
	boxSizing: 'border-box'
};

const priorityColors = {
	1: { bg: '#E2E2E2', text: '#555' },
	2: { bg: '#A4C0D7', text: '#fff' },
	3: { bg: '#7CBED1', text: '#fff' },
	4: { bg: '#65BCA6', text: '#fff' },
	5: { bg: '#BCD11D', text: '#fff' },
	6: { bg: '#FFCA05', text: '#fff' },
	7: { bg: '#F9A006', text: '#fff' },
	8: { bg: '#F27200', text: '#fff' },
	9: { bg: '#EA4204', text: '#fff' },
	10: { bg: '#E10404', text: '#fff' },
	pause: { bg: '#CFCFCF', text: '#fff' },
	default: { bg: '#e0e0e0', text: '#555' }
};


const UserProfile = () => {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selected, setSelected] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const navigate = useNavigate();

	useEffect(() => {
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
		fetchData();
	}, []);

	const handleSelectAllClick = (event) => {
		if (event.target.checked) {
			const newSelected = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => row.id);
			setSelected([...new Set([...selected, ...newSelected])]);
			return;
		}
		// Remove only those on current page
		const currentPageIds = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => row.id);
		setSelected(selected.filter((id) => !currentPageIds.includes(id)));
	};

	const handleClick = (id) => {
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

	const handleCancelSelection = () => {
		setSelected([]);
	};

	const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<Container maxWidth="md">
			<Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
				<Typography variant="h4" gutterBottom sx={{ mb: 2, ml: 0 }}>
					Перелік задач
				</Typography>
				<Box sx={{
					display: 'flex',
					gap: 2,
					mt: 1,
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: 'center',
					justifyContent: 'flex-start',
					width: '100%',
					pl: 0
				}}>
					<Button
						variant="contained"
						sx={{ flex: 0.2, position: 'relative' }}
						onClick={() => navigate('/details')}
					>
						Додати заявку
					</Button>
                    <Button
                        variant="contained"
                        sx={{ flex: 0.2, position: 'relative' }}
                        disabled={selected.length !== 1}
                    >
                        редагувати
                    </Button>
					<Button
						variant="contained"
						sx={{ flex: 0.2, position: 'relative' }}
						onClick={handleCancelSelection}
						disabled={selected.length === 0}
					>
						скасувати
					</Button>
				</Box>
				{error && <Alert severity="error" sx={{ mt: 3, width: '100%' }}>{error}</Alert>}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					<Paper sx={{ mt: 4, width: '100%', maxWidth: 900 }}>
						{/* Flex-таблиця */}
						<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
							{/* Header */}
							<Box sx={{ display: 'flex', width: '100%', borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
								<Box sx={{ ...headerCellStyle, width: colWidths.checkbox, justifyContent: 'center' }}>
									<Checkbox
										color="primary"
										indeterminate={selected.length > 0 && selected.length < paginatedRows.length}
										checked={paginatedRows.length > 0 && paginatedRows.every(row => isSelected(row.id))}
										onChange={handleSelectAllClick}
										inputProps={{ 'aria-label': 'select all tasks' }}
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
										sx={{ display: 'flex', width: '100%', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: isItemSelected ? '#f5faff' : 'inherit', transition: 'background 0.2s' }}
										onClick={() => handleClick(row.id)}
									>
										<Box sx={{ ...rowCellStyle, width: colWidths.checkbox, justifyContent: 'center' }}>
											<Checkbox
												color="primary"
												checked={isItemSelected}
												inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${row.id}` }}
												tabIndex={-1}
												disableRipple
												onClick={e => e.stopPropagation()}
												onChange={() => handleClick(row.id)}
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
														width: '32px',
														height: '32px',
														borderRadius: '50%',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														fontWeight: 'bold',
														fontSize: '0.875rem'
												}}
											>
												{row.priority}
											</Box>
										</Box>
									</Box>
								);
							})}
							{/* Пагінація */}
							<TablePagination
								component="div"
								count={rows.length}
								page={page}
								onPageChange={handleChangePage}
								rowsPerPage={rowsPerPage}
								onRowsPerPageChange={handleChangeRowsPerPage}
								rowsPerPageOptions={[5, 10, 25]}
								labelRowsPerPage="Рядків на сторінці:"
							/>
						</Box>
					</Paper>
				)}
			</Box>
		</Container>
	);
};

export default UserProfile;
