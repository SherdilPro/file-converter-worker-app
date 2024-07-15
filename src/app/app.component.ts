import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'file-converter-worker-app - xlsx-to-csv';
  worker?: Worker;
  filesToProcess: number = 0;
  filesProcessed: number = 0;
  conversionType: string = ""; // Default conversion type
  acceptedFileTypes: string = ''; // Accepted file types based on conversion type

  onConversionTypeChange() {
    switch (this.conversionType) {
      case 'xlsx-to-csv':
        this.acceptedFileTypes = '.xlsx'; // Only accept XLSX files
        break;
      case 'csv-to-xml':
        this.acceptedFileTypes = '.csv'; // Only accept CSV files
        break;
      case 'xlsx-to-xml':
        this.acceptedFileTypes = '.xlsx'; // Only accept XLSX files
        break;
      default:
        console.error('Unknown conversion type:', this.conversionType);
        break;
    }
  }
  ngOnInit() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./file-type-converter.worker', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        this.handleWorkerResults(data.results);
      };
    } else {
      console.error('Web Workers are not supported in this environment.');
    }
  }

  onFileChange(evt: any) {
    const files: FileList = evt.target.files;
    this.filesToProcess = files.length;
    this.filesProcessed = 0;
    const fileList:any = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        // const fileType = file.name.endsWith('.xlsx') ? 'xlsx' : 'csv';
        // const conversionType = fileType === 'xlsx' ? 'xlsx-to-csv' : 'csv-to-xml';  // Change this logic based on user selection
        fileList.push({ type: this.conversionType, content: bstr, filename: file.name });
        if (fileList.length === files.length) {
          this.worker?.postMessage({ files: fileList });
        }
      };
      reader.readAsBinaryString(file);
    }
  }

  handleWorkerResults(results: any[]) {
    results.forEach(result => {
      if (result.csvData) {
        this.downloadFile(result.csvData, result.filename, 'text/csv');
      } else if (result.xmlData) {
        this.downloadFile(result.xmlData, result.filename, 'application/xml');
      } else if (result.error) {
        console.error(`Error processing file ${result.filename}: ${result.error}`);
      }
      this.filesProcessed++;
    });

    if (this.filesProcessed === this.filesToProcess) {
      alert('All files have been processed and downloaded!');
    }
  }

  downloadFile(content: string, filename: string, contentType: string) {
    const bom = '\uFEFF';
    const blob: Blob = new Blob([bom + content], { type: contentType });
    const url: string = window.URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  convertXlsxToCsv(content: string, filename: string) {
    // Implement your XLSX to CSV conversion logic here
    console.log('Converting XLSX to CSV:', filename);
  }

  convertCsvToXml(content: string, filename: string) {
    // Implement your CSV to XML conversion logic here
    console.log('Converting CSV to XML:', filename);
  }

  convertXlsxToXml(content: string, filename: string) {
    // Implement your XLSX to XML conversion logic here
    console.log('Converting XLSX to XML:', filename);
  }
}