import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';


const UserProfile = () => (
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
				>
					Кнопка 1
				</Button>
				<Button
					variant="contained"
					sx={{ flex: 1 }}
				>
					Кнопка 2
				</Button>
			</Box>
		</Box>
	</Container>
);

export default UserProfile;
