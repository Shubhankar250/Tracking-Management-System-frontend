import React from "react";
import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  fetchAllModules,
  fetchLogTypesByModule,
  clearLogTypes,
  fetchActivityLogs
} from "../slices/activityLogSlice";
import { downloadActivityLogsApi } from "../api/activityLogApi";

const LogContent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [command, setCommand] = useState("");

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLogType, setSelectedLogType] = useState("");
  const today = new Date().toISOString().split("T")[0];

const [from, setFrom] = useState(today);
const [to, setTo] = useState(today);

  const dispatch = useAppDispatch();

  /* 🔥 ADDED logs here */
  const { modules, logTypes, logs } = useAppSelector(
    state => state.activityLog
  );

  const PROMPT = "activity-log@server:~$";

  /* Load modules */
  useEffect(() => {
    dispatch(fetchAllModules());
  }, [dispatch]);

  /* Module change */
  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const module = e.target.value;
    setSelectedModule(module);
    setSelectedLogType("");
    dispatch(clearLogTypes());

    if (module) {
      dispatch(fetchLogTypesByModule(module));
    }
  };

  /* 🔥 Search */
  const handleSearch = () => {
    if (!from || !to) return;

    const cli =
      `$ logs --module ${selectedModule || "ALL"} ` +
      `--from ${from} --to ${to}` +
      (selectedLogType ? ` --type ${selectedLogType}` : "");

    /* 🔥 ADD CLI COMMAND OUTPUT */
    setLines([
      cli,
      "",
      "Fetching activity logs...",
      ""
    ]);
    

    dispatch(
      fetchActivityLogs({
        from,
        to,
        module: selectedModule || undefined,
        log_type: selectedLogType || undefined
      })
    );
  };

  /* 🔥 ADD: show logs when API returns */
  useEffect(() => {
    if (!logs || logs.length === 0) return;
    

    setLines(prev => {
      const updated = [...prev];   
      logs.forEach((log: any, i: number) => {
        updated.push(
          `${i + 1}. [${log.activityTime}] ` +
          `${log.activityType} | ` +
          `${log.message} | ` +
          `AGENT: ${log.userAgent} | ` +
          `IP: ${log.ipAddress} | ` +
          `REFERAL: ${log.httpReferal} | ` +
          `ID: ${log.userId} | ` +
          `BY: ${log.createdBy}`
        );
      });

      updated.push("");
      updated.push(`✔ Total Records: ${logs.length}`);
      updated.push(PROMPT);

      return updated;
    });
  }, [logs]);

  /* Terminal enter */
  const handleEnter = () => {
    setLines(prev => [...prev, `${PROMPT} ${command}`]);
    setCommand("");
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [lines]);
 /* Download helper */


  /* CSV / Excel download */
  const handleDownload = (format: "csv" | "excel") => {
  downloadActivityLogsApi({
    from,
    to,
    module: selectedModule || undefined,
    log_type: selectedLogType || undefined,
    format
  });
};
  return (
    <div className="log-content-wrapper">

      {/* Header row */}
      <div className="log-header">
        <div className="filter-heading">Search Filters</div>
        <div className="download-wrapper">
          <div className="download-dropdown">
            <button
              className="btn btn-primary"
              onClick={() => setOpen(!open)}
            >
              Download <i className="bi bi-chevron-down"></i>
            </button>

            {open && (
            <ul className="download-menu">
              <li onClick={() => { setOpen(false); handleDownload("csv"); }}>
                CSV
              </li>
              <li onClick={() => { setOpen(false); handleDownload("excel"); }}>
                Excel
              </li>
            </ul>
          )}
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="filters-row">
        <div className="filter-item">
          <label>Module</label>
          <select value={selectedModule} onChange={handleModuleChange}>
            <option value="">Select Module</option>
            {Object.entries(modules).map(([id, name]) => (
              <option key={id} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Log Type</label>
          <select
            value={selectedLogType}
            onChange={e => setSelectedLogType(e.target.value)}
            disabled={!selectedModule}
          >
            <option value="">Select Log Type</option>
            {logTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>

        <div className="filter-item">
          <label>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>

        <div className="filter-item search-btn-wrapper">
          <button className="btn btn-primary" onClick={handleSearch}>
            Search Logs
          </button>
        </div>
      </div>

      {/* Log viewer */}
      <div
        id="activityTerminal"
        ref={terminalRef}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="terminal">
          <div className="terminal-greeting">
            Activity Log CLI Ready
          </div>

          {lines.map((line, i) => (
            <div key={i} className="terminal-line">
              {line}
            </div>
          ))}

          <div className="terminal-input-line">
            <span className="terminal-prompt">{PROMPT} </span>
            <input
              ref={inputRef}
              className="terminal-input"
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEnter();
                }
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogContent;
