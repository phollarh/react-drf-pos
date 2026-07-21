import { Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

interface errorMessageProps{
    errorMessage : string
}
export default function FilledAlerts({errorMessage}:errorMessageProps) {
  return (
      
      <Alert variant="filled" severity="error">
        <Typography component="span">
            {errorMessage}
        </Typography>
        
      </Alert>

  );
}
