import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'file-converter-worker-app - xlsx-to-csv';
  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const csvData: string = XLSX.utils.sheet_to_csv(ws);
      this.downloadCSV(csvData, 'converted.csv');
    };
    reader.readAsBinaryString(target.files[0]);
  }

  downloadCSV(csv: string, filename: string) {
    const bom = '\uFEFF';
    const blob: Blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url: string = window.URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}