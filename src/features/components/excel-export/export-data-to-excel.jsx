'use client';

import * as Excel from 'exceljs';
import { saveAs } from 'file-saver';
import moment from 'moment';

export async function exportDataToExcel({ data, headers, dataStyle, fileName }) {
  try {
    const wb = new Excel.Workbook();
    const sheet = wb.addWorksheet('Sheet1');

    const headerLabels = headers.map((header) => header.label);
    const headerWidths = headers.map((header) => header.width);
    const headerRow = sheet.addRow(headerLabels);

    headerRow.eachCell((cell, colNum) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9EAD3' },
      };
      cell.font = { bold: true };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: false,
      };
      sheet.getColumn(colNum).width = headerWidths[colNum - 1];
    });

    data.forEach((row) => {
      const rowDatas = headers.map((header) => row[header.key]);
      const appendRow = sheet.addRow(rowDatas);

      appendRow.eachCell((cell, colNum) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: false,
        };

        const key = headers[colNum - 1].key;
        const style = dataStyle?.[key];
        if (style) {
          const styleKeys = Object.keys(style);
          styleKeys.forEach((styleKey) => {
            cell[styleKey] = style[styleKey];
          });
        }
      });
    });

    // 파일 다운로드
    const fileData = await wb.xlsx.writeBuffer();
    const blob = new Blob([fileData], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${fileName}-${moment().format('YYYYMMDDHms')}.xlsx`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { errors: { message: '데이터를 내보내는 중 오류가 발생했습니다.' } };
  }
}
