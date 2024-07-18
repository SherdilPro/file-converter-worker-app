import * as XLSX from 'xlsx';

addEventListener('message', ({ data }) => {
  const { files } = data;
  const results = files.map((file:any) => {
    const { type, content, filename } = file;
    
    switch(type) {
      case 'xlsx-to-csv':
        return convertXlsxToCsv(content, filename);
      case 'csv-to-xml':
        return convertCsvToXml(content, filename);
      case 'xlsx-to-xml':
        return convertXlsxToXml(content, filename);
      default:
        return { error: 'Unknown conversion type', filename };
    }
  });

  postMessage({ results });
});

function convertXlsxToCsv(bstr: string, filename: string) {
  const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
  const wsname: string = wb.SheetNames[0];
  const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  const csvData: string = XLSX.utils.sheet_to_csv(ws);
  return { csvData, filename: filename.replace('.xlsx', '.csv') };
}

// function convertCsvToXml(csv: string, filename: string) {
//   const csvRows = csv.split('\n');
//   let xmlData = '<?xml version="1.0" encoding="UTF-8"?><root>';
  
//   const headers = csvRows[0].split(',');
//   for (let i = 1; i < csvRows.length; i++) {
//     const row = csvRows[i].split(',');
//     xmlData += '<row>';
//     for (let j = 0; j < headers.length; j++) {
//       xmlData += `<${headers[j]}>${row[j]}</${headers[j]}>`;
//     }
//     xmlData += '</row>';
//   }
//   xmlData += '</root>';
  
//   return { xmlData, filename: filename.replace('.csv', '.xml') };
// }
function convertCsvToXml(csv: string, filename: string) {
  const csvRows = csv.split('\n');
    let xmlData = '<?xml version="1.0" encoding="UTF-8"?><root>';
    
    const headers = csvRows[0].split(',').map(formatHeader);
    for (let i = 1; i < csvRows.length; i++) {
        const row = csvRows[i].split(',');
        xmlData += '<row>';
        for (let j = 0; j < headers.length; j++) {
            xmlData += `<${headers[j].trim()}>${sanitizeXmlValue(row[j].trim())}</${headers[j].trim()}>`;
        }
        xmlData += '</row>';
    }
    xmlData += '</root>';
  
  return { xmlData, filename: filename.replace('.csv', '.xml') };
}
function sanitizeXmlValue(value:any) {
  return value != undefined? value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;'):"";
}

// Function to replace spaces with hyphens in headers and sanitize them
function formatHeader(header:any) {
  const formattedHeader = header.trim().replace(/\s+/g, '-');
  return sanitizeXmlValue(formattedHeader);
}
function convertXlsxToXml(bstr: string, filename: string) {
  const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
  const wsname: string = wb.SheetNames[0];
  const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  const csv = XLSX.utils.sheet_to_csv(ws);
  
  const csvRows = csv.split('\n');
  let xmlData = '<?xml version="1.0" encoding="UTF-8"?><root>';
  
  const headers = csvRows[0].split(',').map(formatHeader);
  for (let i = 1; i < csvRows.length; i++) {
    const row = csvRows[i].split(',');
    xmlData += '<row>';
    for (let j = 0; j < headers.length; j++) {
      xmlData += `<${headers[j].trim()}>${sanitizeXmlValue(row[j].trim())}</${headers[j].trim()}>`;
    }
    xmlData += '</row>';
  }
  xmlData += '</root>';
  
  return { xmlData, filename: filename.replace('.xlsx', '.xml') };
}