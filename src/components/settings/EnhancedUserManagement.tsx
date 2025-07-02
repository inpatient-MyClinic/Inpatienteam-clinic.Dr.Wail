
import React from "react";
import UserForm from "./userManagement/UserForm";
import UserTable from "./userManagement/UserTable";
import UserFilters from "./userManagement/UserFilters";
import { useUserManagement } from "./userManagement/useUserManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    
    // Computed
    filteredUsers,
    hasActiveFilters
  } = useUserManagement();

  console.log('EnhancedUserManagement: Hook returned - users:', users.length, 'isLoading:', isLoading, 'filteredUsers:', filteredUsers.length);

  if (isLoading) {
    console.log('EnhancedUserManagement: Showing loading state');
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced User Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced User Management</h2>
          <p className="text-gray-600">
            Manage users with field permissions ({users.length} total users)
          </p>
        </div>
      </div>

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

      {filteredUsers.length > 0 ? (
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
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {hasActiveFilters ? "No users match the current filters." : "No users found. Add some users to get started."}
            </p>
            <p className="text-sm text-blue-600">
              Debug: Total users in storage: {users.length}, Filtered: {filteredUsers.length}
            </p>
            {users.length === 0 && (
              <p className="text-sm text-green-600 mt-2">
                Try adding your first user using the form above!
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedUserManagement;
