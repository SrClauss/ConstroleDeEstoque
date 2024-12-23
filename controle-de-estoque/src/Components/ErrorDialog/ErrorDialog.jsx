import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Button 
} from '@mui/material';

export default function DialogConfirm({ 
  open, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Não
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Sim
        </Button>
      </DialogActions>
    </Dialog>
  );
}