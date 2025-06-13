import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { announceToScreenReader } from '../utils/accessibility';
import '../styles/UserManagementPage.css';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'staff' | 'manager';
  email: string;
  isActive: boolean;
  createdAt: string;
}

const UserManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<{
    username: string;
    fullName: string;
    password: string;
    role: 'admin' | 'staff' | 'manager';
    email: string;
  }>({
    username: '',
    fullName: '',
    password: '',
    role: 'staff',
    email: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Simulated data for now
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          fullName: 'ผู้ดูแลระบบ',
          role: 'admin',
          email: 'admin@hotel.com',
          isActive: true,
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          username: 'staff01',
          fullName: 'พนักงานต้อนรับ 1',
          role: 'staff',
          email: 'staff01@hotel.com',
          isActive: true,
          createdAt: '2024-01-15'
        }
      ];
      setUsers(mockUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    // Validate form
    if (!newUser.username || !newUser.fullName || !newUser.password || !newUser.email) {
      alert(t('users.validation.required'));
      return;
    }

    // Simulate adding user
    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      email: newUser.email,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]!
    };

    setUsers([...users, user]);
    setShowAddForm(false);
    setNewUser({
      username: '',
      fullName: '',
      password: '',
      role: 'staff',
      email: ''
    });

    announceToScreenReader(t('users.addSuccess'), 'polite');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const deleteUser = (userId: string) => {
    if (window.confirm(t('users.confirmDelete'))) {
      setUsers(users.filter(user => user.id !== userId));
      announceToScreenReader(t('users.deleteSuccess'), 'polite');
    }
  };

  if (isLoading) {
    return (
      <div className="users-loading">
        <p role="status" aria-busy={true}>{t('users.loading')}</p>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      <div className="page-header">
        <h1>{t('users.title')}</h1>
        <button
          className="add-user-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? t('users.cancel') : t('users.addNew')}
        </button>
      </div>

      {showAddForm && (
        <div className="add-user-form">
          <h2>{t('users.addNew')}</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">{t('users.username')}</label>
              <input
                id="username"
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder={t('users.usernamePlaceholder')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fullName">{t('users.fullName')}</label>
              <input
                id="fullName"
                type="text"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                placeholder={t('users.fullNamePlaceholder')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">{t('users.email')}</label>
              <input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder={t('users.emailPlaceholder')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">{t('users.password')}</label>
              <input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder={t('users.passwordPlaceholder')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">{t('users.role')}</label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'staff' | 'manager' })}
              >
                <option value="staff">{t('users.roles.staff')}</option>
                <option value="manager">{t('users.roles.manager')}</option>
                <option value="admin">{t('users.roles.admin')}</option>
              </select>
            </div>
          </div>
          <button className="save-user-button" onClick={handleAddUser}>
            {t('users.save')}
          </button>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>{t('users.username')}</th>
              <th>{t('users.fullName')}</th>
              <th>{t('users.role')}</th>
              <th>{t('users.email')}</th>
              <th>{t('users.status')}</th>
              <th>{t('users.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.fullName}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {t(`users.roles.${user.role}`)}
                  </span>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? t('users.active') : t('users.inactive')}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="toggle-button"
                      onClick={() => toggleUserStatus(user.id)}
                      aria-label={user.isActive ? t('users.deactivate') : t('users.activate')}
                    >
                      {user.isActive ? t('users.deactivate') : t('users.activate')}
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        className="delete-button"
                        onClick={() => deleteUser(user.id)}
                        aria-label={t('users.delete')}
                      >
                        {t('users.delete')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;