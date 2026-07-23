'use client';

import { createContext, useState, useEffect, use } from 'react';

const SheetContext = createContext('');

const SheetProvider = ({ children }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetData, setSheetData] = useState(null);

  useEffect(() => {
    if (!sheetOpen) {
      setTimeout(() => setSheetData(null), 300);
    }
  }, [sheetOpen]);

  const value = {
    sheetOpen,
    setSheetOpen,
    sheetData,
    setSheetData,
  };

  return <SheetContext value={value}>{children}</SheetContext>;
};

const useSheet = () => {
  return use(SheetContext);
};

export { SheetContext, SheetProvider, useSheet };
