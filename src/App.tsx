import React, { useEffect, useState, ChangeEvent } from "react";
import DataGrid, { textEditor, Column } from "react-data-grid";
import { read, utils, WorkSheet } from "xlsx";
import 'animate.css';
import 'react-data-grid/lib/styles.css';
import './App.css';
import Calendar from 'react-calendar';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import moment from 'moment';

type DataSet = { [index: string]: WorkSheet; };
type Row = any[];
type AOAColumn = Column<Row>;
type RowCol = { rows: Row[]; columns: AOAColumn[]; };
type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece]



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
  // rows: utils.sheet_to_json<Row>(data[sheetName], { header: 1, defval: 0 }),
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
  const [value, setValue] = useState<Value>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

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
    const data = read(file, { sheetStubs: true });

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
  // useEffect(() => {
  //   (async () => {
  //     const f = await fetch("https://sheetjs.com/pres.numbers");
  //     await handleAB(await f.arrayBuffer());
  //   })();
  // }, []);

  useEffect(() => {
    window.addEventListener('error', (e) => {
      if (e.message === 'ResizeObserver loop completed with undelivered notifications.' || e.message === 'Script error.') {
        const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div')
        const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay')
        if (resizeObserverErr) {
          resizeObserverErr.setAttribute('style', 'display: none')
        }
        if (resizeObserverErrDiv) {
          resizeObserverErrDiv.setAttribute('style', 'display: none')
        }
      }
    })
  }, [])

  function handleCalendarToggle() {
    setShowCalendar(!showCalendar)
  }

  function onChange(nextValue: Value) {
    setValue(nextValue)
    setShowCalendar(false)
  }

  async function uploadToDatabase() {
    try {
      if (file && value) {
        const formData = new FormData();
        formData.append("excelFile", file);
        formData.append("sheetName", current);
        formData.append("month", value ? value.toString() : new Date().toString())

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
    <div className="main-content">
      <h1 className="my-element" style={{ textAlign: "center" }}>😍😍😍😍😍😍</h1>
      <div style={{ display: "flex", justifyContent: "center", alignContent: "center", flexDirection: "row" }}>
        {/* <Calendar value={value} onChange={onChange} />
        <span style={{ marginLeft: "10px", display: "flex", alignItems: "center", fontFamily: "Arial, sans-serif", fontSize: "16px", fontWeight: "bold", color: "#333", textTransform: "uppercase" }}>Selected date: {value?.toLocaleString()} </span>
         */}
        <div className="button-container">
          <Button size="sm" variant="success" onClick={handleCalendarToggle}>
            {showCalendar ? "Hide Calendar" : "Open Calendar"}
          </Button>
          {showCalendar && (
            <Calendar value={value} onChange={onChange} />
          )}
          <span style={{ marginLeft: "10px", display: "flex", alignItems: "center", fontFamily: "Arial, sans-serif", fontSize: "16px", fontWeight: "bold", color: "#333", textTransform: "uppercase" }}>
            Selected date: {value?.toLocaleString()}
          </span>
        </div>
      </div>
      <input type="file" onChange={handleFile} />
      {sheets.length > 0 && (<>
        <p>Use the dropdown to switch to a worksheet:&nbsp;
          <select onChange={async (e) => selectSheet(sheets[+(e.target.value)])}>
            {sheets.map((sheet, idx) => (<option key={sheet} value={idx}>{sheet}</option>))}
          </select>
        </p>
        <div className="flex-cont"><b>Current Sheet: {current}</b></div>
        <DataGrid columns={columns} rows={rows} onRowsChange={setRows} rowHeight={40} defaultColumnOptions={{
          sortable: true,
          resizable: true
        }} style={{ minHeight: "50vh" }} />
        <div style={{ width: "200px", margin: "10px auto" }}>
          <Button variant="primary" size="sm" onClick={() => uploadToDatabase()}>Upload to database</Button>
        </div>
      </>)}
    </div>

  );
}



