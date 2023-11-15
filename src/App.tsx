// import React, { useEffect, useState, ChangeEvent } from "react";
// import DataGrid, { textEditor, Column } from "react-data-grid";
// import { read, utils, WorkSheet, writeFile } from "xlsx";

// import 'react-data-grid/lib/styles.css';
// import './App.css';

// type DataSet = { [index: string]: WorkSheet; };
// type Row = any[];
// type AOAColumn = Column<Row>;
// type RowCol = { rows: Row[]; columns: AOAColumn[]; };

// function arrayify(rows: any[]): Row[] {
//   return rows.map(row => {
//     if (Array.isArray(row)) return row;
//     var length = Object.keys(row).length;
//     for (; length > 0; --length) if (row[length - 1] != null) break;
//     return Array.from({ length, ...row });
//   });
// }

// /* this method returns `rows` and `columns` data for sheet change */
// const getRowsCols = (data: DataSet, sheetName: string): RowCol => ({
//   rows: utils.sheet_to_json<Row>(data[sheetName], { header: 1 }),
//   columns: Array.from({
//     length: utils.decode_range(data[sheetName]["!ref"] || "A1").e.c + 1
//   }, (_, i) => ({ key: String(i), name: utils.encode_col(i), editor: textEditor }))
// });

// export default function App() {
//   const [rows, setRows] = useState<Row[]>([]); // data rows
//   const [columns, setColumns] = useState<AOAColumn[]>([]); // columns
//   const [workBook, setWorkBook] = useState<DataSet>({} as DataSet); // workbook
//   const [sheets, setSheets] = useState<string[]>([]); // list of sheet names
//   const [current, setCurrent] = useState<string>(""); // selected sheet
//   const [file, setFile] = useState<File | null>(null); // store the uploaded file

//   /* called when sheet dropdown is changed */
//   function selectSheet(name: string) {
//     /* update workbook cache in case the current worksheet was changed */
//     workBook[current] = utils.aoa_to_sheet(arrayify(rows));

//     /* get data for desired sheet and update state */
//     const { rows: new_rows, columns: new_columns } = getRowsCols(workBook, name);
//     setRows(new_rows);
//     setColumns(new_columns);
//     setCurrent(name);
//   }

//   /* this method handles refreshing the state with new workbook data */
//   async function handleAB(file: ArrayBuffer): Promise<void> {
//     /* read file data */
//     const data = read(file);

//     /* update workbook state */
//     setWorkBook(data.Sheets);
//     setSheets(data.SheetNames);

//     /* select the first worksheet */
//     const name = data.SheetNames[0];
//     const { rows: new_rows, columns: new_columns } = getRowsCols(data.Sheets, name);
//     setRows(new_rows);
//     setColumns(new_columns);
//     setCurrent(name);
//   }

//   //  called when file input element is used to select a new file */
//   //  async function handleFile(ev: ChangeEvent<HTMLInputElement>): Promise<void> {
//   //    const file = await ev.target.files?.[0]?.arrayBuffer();
//   //    if(file) {
//   //      await handleAB(file)
//   //    } 
//   //  }

//   async function handleFile(ev: ChangeEvent<HTMLInputElement>): Promise<void> {
//     const selectedFile = ev.target.files?.[0];
//     if (selectedFile) {
//       const file = await selectedFile.arrayBuffer();
//       await handleAB(file);
//       setFile(selectedFile);
//     } else {
//       console.error("No file selected.");
//     }
//   }

//   /* when page is loaded, fetch and processs worksheet */
//   useEffect(() => {
//     (async () => {
//       const f = await fetch("https://sheetjs.com/pres.numbers");
//       await handleAB(await f.arrayBuffer());
//     })();
//   }, []);

//   /* method is called when one of the save buttons is clicked */
//   function saveFile(ext: string): void {
//     console.log(rows);
//     /* update current worksheet in case changes were made */
//     workBook[current] = utils.aoa_to_sheet(arrayify(rows));

//     /* construct workbook and loop through worksheets */
//     const wb = utils.book_new();
//     sheets.forEach((n) => { utils.book_append_sheet(wb, workBook[n], n); });

//     /* generate a file and download it */
//     writeFile(wb, "SheetJSRDG." + ext);
//   }

//   async function uploadToDatabase() {
//     try {
//       if (file) {
//         const formData = new FormData();
        
//         // Convert the WorkSheet to a Blob
//         const sheetBlob = new Blob([utils.sheet_to_csv(workBook[current])], {
//           type: "text/csv",
//         });
  
//         formData.append("excelFile", sheetBlob);
  
//         // Add the selected sheet name to the form data
//         formData.append("sheetName", current);
  
//         const response = await fetch("http://localhost:3000/import-excel", {
//           method: "POST",
//           body: formData,
//         });
  
//         if (response.ok) {
//           const data = await response.json();
//           console.log("Upload success:", data);
//           alert("CHÚC MỪNG GẤU ĐỎ");
//         } else {
//           console.error("Upload failed:", response.statusText);
//         }
//       } else {
//         console.error("No file selected.");
//       }
//     } catch (error) {
//       console.error("Upload error:", error);
//     }
//   }

//   return (
//     <>
//       <h3>SheetJS × React-Data-Grid Demo</h3>
//       <h1 style={{textAlign: 'center'}}>HẾ LÔ MẤY CƯNG</h1>
//       <input type="file" onChange={handleFile} />
//       {sheets.length > 0 && (<>
//         <p>Use the dropdown to switch to a worksheet:&nbsp;
//           <select onChange={async (e) => selectSheet(sheets[+(e.target.value)])}>
//             {sheets.map((sheet, idx) => (<option key={sheet} value={idx}>{sheet}</option>))}
//           </select>
//         </p>
//         <div className="flex-cont"><b>Current Sheet: {current}</b></div>
//         <DataGrid columns={columns} rows={rows} onRowsChange={setRows} />
//         <p>Click one of the buttons to create a new file with the modified data</p>
//         <div><button onClick={() => uploadToDatabase()}>Upload to database</button></div>
//         {/* <div className="flex-cont">{["xlsx", "xlsb", "xls"].map((ext) => (
//           <button key={ext} onClick={() => saveFile(ext)}>export [.{ext}]</button>
//         ))}</div> */}

//       </>)}
//     </>
//   );
// }

import React, { useEffect, useState, ChangeEvent } from "react";
import DataGrid, { textEditor, Column } from "react-data-grid";
import { read, utils, WorkSheet, writeFile } from "xlsx";

import 'react-data-grid/lib/styles.css';
import './App.css';

type DataSet = { [index: string]: WorkSheet; };
type Row = any[];
type AOAColumn = Column<Row>;
type RowCol = { rows: Row[]; columns: AOAColumn[]; };

function arrayify(rows: any[]): Row[] {
  return rows.map(row => {
    if (Array.isArray(row)) return row;
    var length = Object.keys(row).length;
    for (; length > 0; --length) if (row[length - 1] != null) break;
    return Array.from({ length, ...row });
  });
}

/* this method returns `rows` and `columns` data for sheet change */
const getRowsCols = (data: DataSet, sheetName: string): RowCol => ({
  rows: utils.sheet_to_json<Row>(data[sheetName], { header: 1 }),
  columns: Array.from({
    length: utils.decode_range(data[sheetName]["!ref"] || "A1").e.c + 1
  }, (_, i) => ({ key: String(i), name: utils.encode_col(i), editor: textEditor }))
});

export default function App() {
  const [rows, setRows] = useState<Row[]>([]); // data rows
  const [columns, setColumns] = useState<AOAColumn[]>([]); // columns
  const [workBook, setWorkBook] = useState<DataSet>({} as DataSet); // workbook
  const [sheets, setSheets] = useState<string[]>([]); // list of sheet names
  const [current, setCurrent] = useState<string>(""); // selected sheet
  const [file, setFile] = useState<File | null>(null); // store the uploaded file

  /* called when sheet dropdown is changed */
  function selectSheet(name: string) {
    /* update workbook cache in case the current worksheet was changed */
    workBook[current] = utils.aoa_to_sheet(arrayify(rows));

    /* get data for desired sheet and update state */
    const { rows: new_rows, columns: new_columns } = getRowsCols(workBook, name);
    setRows(new_rows);
    setColumns(new_columns);
    setCurrent(name);
  }

  /* this method handles refreshing the state with new workbook data */
  async function handleAB(file: ArrayBuffer): Promise<void> {
    /* read file data */
    const data = read(file);

    /* update workbook state */
    setWorkBook(data.Sheets);
    setSheets(data.SheetNames);

    /* select the first worksheet */
    const name = data.SheetNames[0];
    const { rows: new_rows, columns: new_columns } = getRowsCols(data.Sheets, name);
    setRows(new_rows);
    setColumns(new_columns);
    setCurrent(name);
  }

  /* called when file input element is used to select a new file */
  // async function handleFile(ev: ChangeEvent<HTMLInputElement>): Promise<void> {
  //   const file = await ev.target.files?.[0]?.arrayBuffer();
  //   if(file) {
  //     await handleAB(file)
  //   } 
  // }

  async function handleFile(ev: ChangeEvent<HTMLInputElement>): Promise<void> {
    const selectedFile = ev.target.files?.[0];
    if (selectedFile) {
      const file = await selectedFile.arrayBuffer();
      await handleAB(file);
      setFile(selectedFile);
    } else {
      console.error("No file selected.");
    }
  }

  /* when page is loaded, fetch and processs worksheet */
  useEffect(() => {
    (async () => {
      const f = await fetch("https://sheetjs.com/pres.numbers");
      await handleAB(await f.arrayBuffer());
    })();
  }, []);

  /* method is called when one of the save buttons is clicked */
  function saveFile(ext: string): void {
    console.log(rows);
    /* update current worksheet in case changes were made */
    workBook[current] = utils.aoa_to_sheet(arrayify(rows));

    /* construct workbook and loop through worksheets */
    const wb = utils.book_new();
    sheets.forEach((n) => { utils.book_append_sheet(wb, workBook[n], n); });

    /* generate a file and download it */
    writeFile(wb, "SheetJSRDG." + ext);
  }

  async function uploadToDatabase() {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("excelFile", file);
        formData.append("sheetName", current);

        const response = await fetch("http://localhost:3001/import-excel", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Upload success:", data);
          console.log(formData)
          alert('CHÚC MỪNG GẤU ĐỎ')
        } else {
          console.error("Upload failed:", response.statusText);
        }
      } else {
        console.error("No file selected.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  }

  return (
    <>
      <h3>SheetJS × React-Data-Grid Demo</h3>
      <h1 style={{textAlign: 'center'}}>HẾ LÔ MẤY CƯNG</h1>
      <input type="file" onChange={handleFile} />
      {sheets.length > 0 && (<>
        <p>Use the dropdown to switch to a worksheet:&nbsp;
          <select onChange={async (e) => selectSheet(sheets[+(e.target.value)])}>
            {sheets.map((sheet, idx) => (<option key={sheet} value={idx}>{sheet}</option>))}
          </select>
        </p>
        <div className="flex-cont"><b>Current Sheet: {current}</b></div>
        <DataGrid columns={columns} rows={rows} onRowsChange={setRows} />
        <p>Click one of the buttons to create a new file with the modified data</p>
        <div><button onClick={() => uploadToDatabase()}>Upload to database</button></div>
        {/* <div className="flex-cont">{["xlsx", "xlsb", "xls"].map((ext) => (
          <button key={ext} onClick={() => saveFile(ext)}>export [.{ext}]</button>
        ))}</div> */}

      </>)}
    </>
  );
}



