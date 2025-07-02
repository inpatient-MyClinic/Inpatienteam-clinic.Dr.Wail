
import React from "react";
import UserForm from "./userManagement/UserForm";
import UserFilters from "./userManagement/UserFilters";
import SystemFeatures from "./userManagement/SystemFeatures";
import UserManagementHeader from "./userManagement/UserManagementHeader";
import UserTableSection from "./userManagement/UserTableSection";
import LoadingState from "./userManagement/LoadingState";
import DoctorPrivileges from "./userManagement/DoctorPrivileges";
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

  console.log('EnhancedUserManagement: Hook returned - users:', users.length, 'isLoading:', isLoading, 'filteredUsers:', filteredUsers.length);

  // Show loading state
  if (isLoading) {
    console.log('EnhancedUserManagement: Showing loading state');
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <UserManagementHeader totalUsers={users.length} />

      <SystemFeatures />

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
