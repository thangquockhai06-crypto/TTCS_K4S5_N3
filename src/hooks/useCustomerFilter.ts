import { useMemo, useState } from 'react';
import {
  CustomerSortFieldType,
  CustomerStatusType,
  CustomerTierType,
  ICustomer,
  SortDirectionType,
} from '../interfaces';
import { useCustomerSearch } from './useCustomerSearch';

export interface IUseCustomerFilterReturn {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedStatus: CustomerStatusType | 'All';
  setSelectedStatus: (status: CustomerStatusType | 'All') => void;
  selectedTier: CustomerTierType | 'All';
  setSelectedTier: (tier: CustomerTierType | 'All') => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  sortField: CustomerSortFieldType;
  setSortField: (field: CustomerSortFieldType) => void;
  sortDirection: SortDirectionType;
  toggleSortDirection: () => void;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  filteredCustomers: ICustomer[];
  availableTags: string[];
  resetFilters: () => void;
}

export function useCustomerFilter(customers: readonly ICustomer[]): IUseCustomerFilterReturn {
  const { searchQuery, setSearchQuery, searchedCustomers, clearSearch } =
    useCustomerSearch(customers);

  const [selectedStatus, setSelectedStatus] = useState<CustomerStatusType | 'All'>('All');
  const [selectedTier, setSelectedTier] = useState<CustomerTierType | 'All'>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortField, setSortField] = useState<CustomerSortFieldType>('dealValue');
  const [sortDirection, setSortDirection] = useState<SortDirectionType>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const availableTags = useMemo<string[]>(() => {
    const tagSet = new Set<string>();
    customers.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return ['All', ...Array.from(tagSet).slice(0, 10)];
  }, [customers]);

  const filteredCustomers = useMemo<ICustomer[]>(() => {
    const filtered = searchedCustomers.filter((customer) => {
      const statusMatch = selectedStatus === 'All' || customer.status === selectedStatus;
      const tierMatch = selectedTier === 'All' || customer.tier === selectedTier;
      const tagMatch = selectedTag === 'All' || customer.tags.includes(selectedTag);
      return statusMatch && tierMatch && tagMatch;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'dealValue') {
        comparison = a.dealValue - b.dealValue;
      } else if (sortField === 'healthScore') {
        comparison = a.healthScore - b.healthScore;
      } else if (sortField === 'fullName') {
        comparison = a.fullName.localeCompare(b.fullName);
      } else if (sortField === 'company') {
        comparison = a.company.localeCompare(b.company);
      } else {
        comparison = a.id.localeCompare(b.id);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [searchedCustomers, selectedStatus, selectedTier, selectedTag, sortField, sortDirection]);

  const toggleSortDirection = (): void => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const resetFilters = (): void => {
    clearSearch();
    setSelectedStatus('All');
    setSelectedTier('All');
    setSelectedTag('All');
    setSortField('dealValue');
    setSortDirection('desc');
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedTier,
    setSelectedTier,
    selectedTag,
    setSelectedTag,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
    viewMode,
    setViewMode,
    filteredCustomers,
    availableTags,
    resetFilters,
  };
}
