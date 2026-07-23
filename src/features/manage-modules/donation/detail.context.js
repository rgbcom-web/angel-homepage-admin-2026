'use client';

import { use, createContext, useState, useEffect } from 'react';
import { useSheet } from '@/features/components/sheet';
import { useManageModuleContext } from '../components/manage-modules.context';
import { getItemById } from './api';

export const DetailContext = createContext({});

export function DetailProvider({ children }) {
  const { tableName, answerTableName } = useManageModuleContext();
  const { sheetData } = useSheet();
  const { id } = sheetData || {};
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const { data } = await getItemById(tableName, id, answerTableName);
    setData(data);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return <DetailContext value={{ data, fetchData }}>{data && children}</DetailContext>;
}

export function useDetail() {
  return use(DetailContext);
}
