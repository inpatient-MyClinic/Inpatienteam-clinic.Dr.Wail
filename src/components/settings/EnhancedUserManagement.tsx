
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import UserForm from "./userManagement/UserForm";
import UserFilters from "./userManagement/UserFilters";
import SystemFeatures from "./userManagement/SystemFeatures";
import UserManagementHeader from "./userManagement/UserManagementHeader";
import UserTableSection from "./userManagement/UserTableSection";
import LoadingState from "./userManagement/LoadingState";
import DoctorPrivileges from "./userManagement/DoctorPrivileges";
import AccessControl from "./userManagement/AccessControl";
import { useUserManagement } from "./userManagement/useUserManagement";

const EnhancedUserManagement = () => {
  console.log('EnhancedUserManagement: Component rendering');
  
  const {
    // State
    users,
    newUserEmail,
    setNewUserEmail,
    newUserCategory,
    setNewUserCategory,
    newUserSpecialty,
    setNewUserSpecialty,
    editingUser,
    editingPermissions,
    searchFilter,
    setSearchFilter,
    categoryFilter,
    setCategoryFilter,
    specialtyFilter,
    setSpecialtyFilter,
    statusFilter,
    setStatusFilter,
    isLoading,
    
    // Actions
    addUser,
    deleteUser,
    startEditing,
    savePermissions,
    cancelEditing,
    updatePermission,
    handleExcelUpload,
    exportToExcel,
    clearFilters,
    updateUser,
    
    // Computed
    filteredUsers,
    hasActiveFilters
  } = useUserManagement();

  console.log('EnhancedUserManagement: Current state -', {
    usersCount: users.length,
    isLoading,
    filteredCount: filteredUsers.length,
    hasActiveFilters
  });

  // Show loading state
  if (isLoading) {
    console.log('EnhancedUserManagement: Rendering loading state');
    return <LoadingState />;
  }

  // Show error state if no users and not loading
  if (!isLoading && users.length === 0) {
    console.log('EnhancedUserManagement: No users found, showing initialization message');
    return (
      <div className="space-y-6">
        <UserManagementHeader totalUsers={0} />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No users found. The system will create default users automatically. 
            If this persists, try refreshing the page.
          </AlertDescription>
        </Alert>
        <SystemFeatures users={users} onUpdateUser={updateUser} />
        <UserForm
          newUserEmail={newUserEmail}
          setNewUserEmail={setNewUserEmail}
          newUserCategory={newUserCategory}
          setNewUserCategory={setNewUserCategory}
          newUserSpecialty={newUserSpecialty}
          setNewUserSpecialty={setNewUserSpecialty}
          onAddUser={addUser}
          onExcelUpload={handleExcelUpload}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserManagementHeader totalUsers={users.length} />

      <AccessControl />

      <SystemFeatures users={users} onUpdateUser={updateUser} />

      <UserForm
        newUserEmail={newUserEmail}
        setNewUserEmail={setNewUserEmail}
        newUserCategory={newUserCategory}
        setNewUserCategory={setNewUserCategory}
        newUserSpecialty={newUserSpecialty}
        setNewUserSpecialty={setNewUserSpecialty}
        onAddUser={addUser}
        onExcelUpload={handleExcelUpload}
      />

      <DoctorPrivileges 
        users={users}
        onUpdateUser={updateUser}
      />

      <UserFilters
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        onExport={exportToExcel}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        filteredCount={filteredUsers.length}
        totalCount={users.length}
      />

      <UserTableSection
        filteredUsers={filteredUsers}
        users={users}
        hasActiveFilters={hasActiveFilters}
        editingUser={editingUser}
        editingPermissions={editingPermissions}
        onEdit={startEditing}
        onSave={savePermissions}
        onCancel={cancelEditing}
        onDelete={deleteUser}
        onUpdatePermission={updatePermission}
        categoryFilter={categoryFilter}
        specialtyFilter={specialtyFilter}
        statusFilter={statusFilter}
        onCategoryFilterChange={setCategoryFilter}
        onSpecialtyFilterChange={setSpecialtyFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
};

export default EnhancedUserManagement;
