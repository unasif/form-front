import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchTasks } from '../../api/taskService';


const columns = [
	{ field: 'id', headerName: 'ID', minWidth: 70, flex: 0.5 },
	{ field: 'title', headerName: 'Назва задачі', flex: 1, minWidth: 180 },
	{ field: 'priority', headerName: 'Пріорітет', flex: 1, minWidth: 120 },
	{ field: 'status', headerName: 'Статус', flex: 1, minWidth: 120 },
	{ field: 'author_name', headerName: 'Автор', flex: 1, minWidth: 120 },
	{ field: 'author', headerName: 'E-mail автора', flex: 1, minWidth: 180 },
	{ field: 'date', headerName: 'Дата', flex: 1, minWidth: 150 },
	{
		field: 'link',
		headerName: 'Посилання',
		flex: 1,
		minWidth: 120,
		renderCell: (params) =>
			params.value ? (
				<a href={params.value} target="_blank" rel="noopener noreferrer">Відкрити</a>
			) : null,
		sortable: false,
		filterable: false,
	},
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
				tasks = tasks.filter(
					(task) => task && typeof task === 'object' && task.id !== undefined && task.title !== undefined
				);
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
						<DataGrid
							rows={rows}
							columns={columns}
							checkboxSelection
							disableRowSelectionOnClick
							autoHeight
							sx={{ minHeight: 300 }}
							onRowSelectionModelChange={setSelected}
							rowSelectionModel={selected}
							getRowId={(row) => row.id}
						/>
					</Paper>
				)}
			</Box>
		</Container>
	);
};

export default UserProfile;
