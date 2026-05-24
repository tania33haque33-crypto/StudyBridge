import { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as VerifyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LockOpen as UnsuspendIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import adminService from '@/services/adminService';
import { formatDate } from '@/utils/formatters';

const ROLE_COLORS = { admin: 'error', moderator: 'warning', student: 'default' };

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [newRole, setNewRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useQuery(
    ['adminUsers', searchQuery, roleFilter, page, rowsPerPage],
    () =>
      adminService.getAllUsers({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        page: page + 1,
        limit: rowsPerPage,
      }),
    { keepPreviousData: true }
  );

  const users = data?.data || [];
  const total = data?.total || 0;

  const invalidate = () => queryClient.invalidateQueries('adminUsers');

  const suspendMutation = useMutation(
    ({ id, reason }) => adminService.suspendUser(id, reason),
    { onSuccess: () => { toast.success('User suspended'); setSuspendDialogOpen(false); setSuspendReason(''); invalidate(); }, onError: () => toast.error('Failed to suspend user') }
  );

  const unsuspendMutation = useMutation(
    (id) => adminService.unsuspendUser(id),
    { onSuccess: () => { toast.success('User unsuspended'); invalidate(); }, onError: () => toast.error('Failed to unsuspend user') }
  );

  const verifyMutation = useMutation(
    (id) => adminService.verifyUser(id),
    { onSuccess: () => { toast.success('User verified'); invalidate(); }, onError: () => toast.error('Failed to verify user') }
  );

  const deleteMutation = useMutation(
    (id) => adminService.deleteUser(id),
    { onSuccess: () => { toast.success('User deleted'); setDeleteDialogOpen(false); invalidate(); }, onError: () => toast.error('Failed to delete user') }
  );

  const roleMutation = useMutation(
    ({ id, role }) => adminService.updateUserRole(id, role),
    { onSuccess: () => { toast.success('Role updated'); setRoleDialogOpen(false); invalidate(); }, onError: () => toast.error('Failed to update role') }
  );

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openSuspend = () => { setSuspendDialogOpen(true); handleMenuClose(); };
  const openDelete = () => { setDeleteDialogOpen(true); handleMenuClose(); };
  const openRole = () => { setNewRole(selectedUser?.role || 'student'); setRoleDialogOpen(true); handleMenuClose(); };

  return (
    <>
      <Helmet>
        <title>User Management - Admin</title>
      </Helmet>

      <Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {total} total users
        </Typography>

        {/* Search and Filters */}
        <Card sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Card>

        {/* Users Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : users.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">No users found</Typography>
                        </TableCell>
                      </TableRow>
                    )
                  : users.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={user.profilePicture}>
                              {user.firstName?.[0]}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>
                              {user.firstName} {user.lastName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={ROLE_COLORS[user.role] || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            <Chip
                              label={user.isEmailVerified ? 'Verified' : 'Unverified'}
                              size="small"
                              color={user.isEmailVerified ? 'success' : 'default'}
                            />
                            {user.isSuspended && (
                              <Chip label="Suspended" size="small" color="error" />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{formatDate(user.lastLogin)}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Card>

        {/* Action Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {!selectedUser?.isEmailVerified && (
            <MenuItem onClick={() => { verifyMutation.mutate(selectedUser._id); handleMenuClose(); }}>
              <VerifyIcon sx={{ mr: 1 }} fontSize="small" color="success" />
              Verify User
            </MenuItem>
          )}
          {selectedUser?.isSuspended ? (
            <MenuItem onClick={() => { unsuspendMutation.mutate(selectedUser._id); handleMenuClose(); }}>
              <UnsuspendIcon sx={{ mr: 1 }} fontSize="small" color="success" />
              Unsuspend User
            </MenuItem>
          ) : (
            <MenuItem onClick={openSuspend}>
              <BlockIcon sx={{ mr: 1 }} fontSize="small" color="warning" />
              Suspend User
            </MenuItem>
          )}
          <MenuItem onClick={openRole}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Change Role
          </MenuItem>
          <MenuItem onClick={openDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete User
          </MenuItem>
        </Menu>

        {/* Suspend Dialog */}
        <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Suspend {selectedUser?.firstName} {selectedUser?.lastName}</DialogTitle>
          <DialogContent>
            <TextField
              label="Reason for suspension"
              multiline
              rows={4}
              fullWidth
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSuspendDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => suspendMutation.mutate({ id: selectedUser._id, reason: suspendReason })}
              variant="contained"
              color="error"
              disabled={suspendMutation.isLoading}
            >
              Suspend
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to permanently delete{' '}
              <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>? This cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => deleteMutation.mutate(selectedUser._id)}
              variant="contained"
              color="error"
              disabled={deleteMutation.isLoading}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Role Dialog */}
        <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
          <DialogTitle>Change Role</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2, minWidth: 240 }}>
              <InputLabel>Role</InputLabel>
              <Select value={newRole} label="Role" onChange={(e) => setNewRole(e.target.value)}>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => roleMutation.mutate({ id: selectedUser._id, role: newRole })}
              variant="contained"
              disabled={roleMutation.isLoading}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default UserManagement;
