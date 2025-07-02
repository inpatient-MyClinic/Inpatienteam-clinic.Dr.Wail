
import React from "react";
import UserForm from "./userManagement/UserForm";
import UserTable from "./userManagement/UserTable";
import UserFilters from "./userManagement/UserFilters";
import { useUserManagement } from "./userManagement/useUserManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Trash2, Search, FileSpreadsheet, Save, RefreshCw } from "lucide-react";

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

  const features = [
    {
      icon: Users,
      title: "Add Users",
      description: "Add users with email validation and category assignment",
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: Shield,
      title: "Edit Permissions",
      description: "Edit field-level permissions for each user",
      color: "bg-green-100 text-green-800"
    },
    {
      icon: Trash2,
      title: "Delete Users",
      description: "Remove users from the system",
      color: "bg-red-100 text-red-800"
    },
    {
      icon: Search,
      title: "Search & Filter",
      description: "Filter by category, specialty, and status",
      color: "bg-purple-100 text-purple-800"
    },
    {
      icon: FileSpreadsheet,
      title: "Excel Import/Export",
      description: "Import users from Excel and export filtered data",
      color: "bg-orange-100 text-orange-800"
    },
    {
      icon: Save,
      title: "Persistent Storage",
      description: "All data is saved to localStorage automatically",
      color: "bg-indigo-100 text-indigo-800"
    },
    {
      icon: RefreshCw,
      title: "Real-time Updates",
      description: "Changes are reflected immediately in the UI",
      color: "bg-teal-100 text-teal-800"
    }
  ];

  // Show loading state
  if (isLoading) {
    console.log('EnhancedUserManagement: Showing loading state');
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Enhanced User Management</h2>
            <p className="text-gray-600">Loading user management system...</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          </CardContent>
        </Card>
      </div>
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

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Features</CardTitle>
          <CardDescription>Available functionality in the User Management system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className={`p-2 rounded-md ${feature.color}`}>
                  <feature.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

      {/* Always show the user table, even if empty */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length} of {users.length})</CardTitle>
          <CardDescription>
            {hasActiveFilters ? 
              "Filtered user list - click 'Clear All Filters' to see all users" : 
              "Complete user list with management options"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {hasActiveFilters ? 
                  "No users match the current filters." : 
                  "No users found. Add some users to get started."
                }
              </p>
              <p className="text-sm text-blue-600 mb-2">
                Debug Info: Total users in storage: {users.length}, Filtered: {filteredUsers.length}
              </p>
              {users.length === 0 && (
                <p className="text-sm text-green-600">
                  Try adding your first user using the form above!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedUserManagement;
