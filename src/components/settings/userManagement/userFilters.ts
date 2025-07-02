
import { User } from "./types";

export const filterUsers = (
  users: User[],
  searchFilter: string,
  categoryFilter: string,
  specialtyFilter: string,
  statusFilter: string
): User[] => {
  return users.filter(user => {
    const matchesSearch = searchFilter === "" || 
      user.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      user.category.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === "all" || user.category === categoryFilter;
    const matchesSpecialty = specialtyFilter === "all" || 
      (specialtyFilter === "none" && !user.specialty) ||
      user.specialty === specialtyFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesSpecialty && matchesStatus;
  });
};

export const hasActiveFilters = (
  searchFilter: string,
  categoryFilter: string,
  specialtyFilter: string,
  statusFilter: string
): boolean => {
  return searchFilter !== "" || categoryFilter !== "all" || specialtyFilter !== "all" || statusFilter !== "all";
};
