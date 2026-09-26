import { useEffect, useMemo, useState } from 'react';
import { ICustomer } from '../interfaces';

export interface IUseCustomerSearchReturn {
  searchQuery: string;
  debouncedQuery: string;
  setSearchQuery: (query: string) => void;
  searchedCustomers: ICustomer[];
  clearSearch: () => void;
}

export function useCustomerSearch(
  customers: readonly ICustomer[],
  debounceMs = 180
): IUseCustomerSearchReturn {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const searchedCustomers = useMemo<ICustomer[]>(() => {
    if (!debouncedQuery) {
      return [...customers];
    }

    return customers.filter((customer) => {
      const matchName = customer.fullName.toLowerCase().includes(debouncedQuery);
      const matchCompany = customer.company.toLowerCase().includes(debouncedQuery);
      const matchEmail = customer.email.toLowerCase().includes(debouncedQuery);
      const matchIndustry = customer.industry.toLowerCase().includes(debouncedQuery);
      const matchLocation = customer.location.toLowerCase().includes(debouncedQuery);
      const matchTags = customer.tags.some((tag) => tag.toLowerCase().includes(debouncedQuery));
      return (
        matchName || matchCompany || matchEmail || matchIndustry || matchLocation || matchTags
      );
    });
  }, [customers, debouncedQuery]);

  const clearSearch = (): void => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return {
    searchQuery,
    debouncedQuery,
    setSearchQuery,
    searchedCustomers,
    clearSearch,
  };
}
