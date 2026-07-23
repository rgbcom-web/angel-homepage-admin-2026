'use client';

import { createContext, use } from 'react';

const ManageModuleContext = createContext('');

const ManageModuleContextProvider = ({ children, ...values }) => {
  const value = {
    ...values,
  };

  return <ManageModuleContext value={value}>{children}</ManageModuleContext>;
};

const useManageModuleContext = () => {
  return use(ManageModuleContext);
};

export { ManageModuleContext, ManageModuleContextProvider, useManageModuleContext };
