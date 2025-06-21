
import React from "react";
import UserForm from "./userManagement/UserForm";
import UserTable from "./userManagement/UserTable";
import UserFilters from "./userManagement/UserFilters";
import { useUserManagement } from "./userManagement/useUserManagement";

const EnhancedUserManagement = () => {
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
    
    // Computed
    filteredUsers,
    hasActiveFilters
  } = useUserManagement();

  return (
    <div className="space-y-6">
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

      <UserFilters
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        onExport={exportToExcel}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        filteredCount={filteredUsers.length}
        totalCount={users.length}
      />

      <UserTable
        users={filteredUsers}
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
