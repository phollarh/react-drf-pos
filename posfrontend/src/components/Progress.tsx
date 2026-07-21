import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function ProgressSign() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CircularProgress color='info' size="20px" />
    </Box>
  );
}
