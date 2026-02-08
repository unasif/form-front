
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
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Checkbox
} from '@mui/material';
import { fetchTasks } from '../../api/taskService';

const headerSeparatorStyle = {
	position: 'relative',
	fontWeight: 'bold',
	color: '#555',
	'&:after': {
		content: '""',
		position: 'absolute',
		right: 0,
		top: '25%',
		height: '50%',
		width: '1px',
		backgroundColor: '#e0e0e0'
	}
};
const lastHeaderStyle = {
	fontWeight: 'bold',
	color: '#555'
};

const columns = [
	{ id: 'title', label: 'Назва задачі', style: headerSeparatorStyle },
	{ id: 'priority', label: 'Пріорітет', style: lastHeaderStyle }
];

const UserProfile = () => {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selected, setSelected] = useState([]);
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
			const newSelected = rows.map((row) => row.id);
			setSelected(newSelected);
			return;
		}
		setSelected([]);
	};

	const handleClick = (event, id) => {
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

	return (
		<Container maxWidth="md">
			<Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<Typography variant="h4" align="center" gutterBottom>
					Таблиця задач
				</Typography>
				<Box sx={{
					display: 'flex',
					gap: 2,
					mt: 3,
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: 'center',
					justifyContent: 'center',
					width: '100%'
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
						sx={{ flex: 1 }}
						disabled={selected.length !== 1}
					>
						редагувати
					</Button>
				</Box>
				{error && <Alert severity="error" sx={{ mt: 3, width: '100%' }}>{error}</Alert>}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					<Paper sx={{ mt: 4, width: '100%', maxWidth: 900 }}>
						<TableContainer>
							<Table sx={{ minWidth: 650 }}>
								<TableHead>
									<TableRow>
										<TableCell padding="checkbox">
											<Checkbox
												color="primary"
												indeterminate={selected.length > 0 && selected.length < rows.length}
												checked={rows.length > 0 && selected.length === rows.length}
												onChange={handleSelectAllClick}
												inputProps={{ 'aria-label': 'select all tasks' }}
											/>
										</TableCell>
										{columns.map((col) => (
											<TableCell key={col.id} sx={col.style}>{col.label}</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.map((row) => {
										const isItemSelected = isSelected(row.id);
										return (
											<TableRow
												hover
												role="checkbox"
												aria-checked={isItemSelected}
												tabIndex={-1}
												key={row.id}
												selected={isItemSelected}
												onClick={(event) => handleClick(event, row.id)}
											>
												<TableCell padding="checkbox">
													<Checkbox
														color="primary"
														checked={isItemSelected}
														inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${row.id}` }}
													/>
												</TableCell>
												<TableCell>{row.title}</TableCell>
												<TableCell>{row.priority}</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					</Paper>
				)}
			</Box>
		</Container>
	);
};

export default UserProfile;
