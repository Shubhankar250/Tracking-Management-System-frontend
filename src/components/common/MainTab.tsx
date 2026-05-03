import { useState, useEffect } from "react";
import Select from "react-select";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchDevices } from "../../slices/devicesSlice";
import { fetchGeofences } from "../../slices/geofenceSlice";
import {
  fetchColumnsByReportType,
  clearColumns, fetchReportTypes, fetchTemplates
} from "../../slices/reportSlice";
import type { ReportDTO } from "../../slices/reportSlice";
import "../../assets/css/report-modal.css";
import CustomMultiValueContainer, {
  CustomOption,
} from "../common/CustomMultiValueContainer";

export interface MainTabHandles {
  reset: () => void;
  getFormData: () => ReportDTO;
  setFormData: (report: ReportDTO) => void;

}

const MainTab = React.forwardRef<MainTabHandles>((_props, ref) => {
  const { devices: deviceList } = useAppSelector((state) => state.devices);
  const geofences = useAppSelector((state) => state.geofence.geofences);
  const [initialSkipColumns, setInitialSkipColumns] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { templates } = useAppSelector((state) => state.reports);
  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: t.templateName,
  }));
  const { columns, reportTypes } = useAppSelector(
    (state) => state.reports as { columns: string[]; reportTypes: string[] }
  );
  const [schedule, setSchedule] = useState({
    daily: false,
    weekly: false,
    monthly: false,
    skip: false,
  });
  type OptionType = {
    value: number;
    label: string;
  };
  const dispatch = useAppDispatch();
  const [search] = useState("");
  // Datatable state
  const [page] = useState(1);
  const [pageSize] = useState(10);
  useEffect(() => {
    dispatch(fetchDevices());
    dispatch(fetchGeofences({
      page: page - 1,
      size: pageSize,
      search,
    }));
    dispatch(fetchReportTypes());
    dispatch(fetchTemplates());
  }, [dispatch]);

  const toggle = (key: keyof typeof schedule) => {
    setSchedule((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [reportType, setReportType] = useState(""); // report type
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [selectedGeofences, setSelectedGeofences] = useState<number[]>([]);
  const [skipColumns, setSkipColumns] = useState<string[]>([]);
  const [deviceOptionsSelected, setDeviceOptionsSelected] = useState<any[]>([]);
  const [geofenceOptionsSelected, setGeofenceOptionsSelected] = useState<any[]>([]);
  const [skipColumnOptionsSelected, setSkipColumnOptionsSelected] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [format, setFormat] = useState("");
  const [email, setEmail] = useState("");
  const [speedLimit, setSpeedLimit] = useState("60");
  const [stops, setStops] = useState("60");
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [geoMenuOpen, setGeoMenuOpen] = useState(false);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const deviceRef = React.useRef<any>(null);
  const geoRef = React.useRef<any>(null);
  const columnRef = React.useRef<any>(null);
  const [isAutoTitle, setIsAutoTitle] = useState(true);
  const [dailyTime, setDailyTime] = useState("00:00");
  const [weeklyTime, setWeeklyTime] = useState("00:00");
  const [monthlyTime, setMonthlyTime] = useState("00:00");
  const [weeklyDay, setWeeklyDay] = useState("mon");
  const [monthlyDate, setMonthlyDate] = useState("1");
  const [emailCc, setEmailCc] = useState("");

  const today = new Date();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [period, setPeriod] = useState("today");
  const [dateFrom, setDateFrom] = useState(formatDate(today));
  const [dateTo, setDateTo] = useState(formatDate(today));
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (deviceRef.current && !deviceRef.current.contains(event.target)) {
        setDeviceMenuOpen(false);
      }
      if (geoRef.current && !geoRef.current.contains(event.target)) {
        setGeoMenuOpen(false);
      }
      if (columnRef.current && !columnRef.current.contains(event.target)) {
        setColumnMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (reportType) {
      dispatch(fetchColumnsByReportType(reportType));
    } else {
      dispatch(clearColumns());
    }
  }, [reportType, dispatch]);
  useEffect(() => {
    if (reportType !== "geofencesreport") {
      setGeofenceOptionsSelected([]);   // 🔥 clear UI
      setSelectedGeofences([]);         // 🔥 clear data
      setGeoMenuOpen(false);            // 🔥 close dropdown
    }
  }, [reportType]);
useEffect(() => {
  if (reportType !== "geofencesreport") {
    setErrors((prev: any) => {
      const updated = { ...prev };
      delete updated.geofences;
      return updated;
    });
  }
}, [reportType]);
  useEffect(() => {
    if (!schedule.skip) {
      setColumnMenuOpen(false);              // close dropdown
      setSkipColumnOptionsSelected([]);      // clear UI
      setSkipColumns([]);                    // clear data
    }
  }, [schedule.skip]);
  useEffect(() => {
    setSkipColumnOptionsSelected([]);   // 🔥 clear UI
    setSkipColumns([]);                 // 🔥 clear data
    setColumnMenuOpen(false);           // 🔥 close dropdown
  }, [reportType]);

  useEffect(() => {
    if (columns.length > 0 && initialSkipColumns.length > 0) {
      const selected = columns
        .filter(col => initialSkipColumns.includes(col))
        .map(col => ({
          value: col,
          label: col.replace(/_/g, " ").toUpperCase(),
        }));

      setSkipColumnOptionsSelected(selected);
    }
  }, [columns, initialSkipColumns]);
  const reportTypeOptions = reportTypes.map((type: string) => {
    const value = type.toLowerCase().replace(/\s+/g, "");
    return { value, label: type };
  });
  const validate = () => {
    let newErrors: any = {};

    if (!title.trim()) {
      newErrors.title = "Title is mandatory";
    }

    if (!format) {
      newErrors.format = "Please select format";
    }

    if (!reportType) {
      newErrors.reportType = "Please select report type";
    }
    if (!selectedDevices || selectedDevices.length === 0) {
      newErrors.devices = "Please select at least one object";
    }
    if (reportType === "geofencesreport") {
      if (!selectedGeofences || selectedGeofences.length === 0) {
        newErrors.geofences = "Please select at least one Geofence";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handlePeriodChange = (value: string) => {
    const now = new Date();
    let from = new Date(now);
    let to = new Date(now);

    switch (value) {
      case "today":
        break;
      case "yesterday":
        from.setDate(now.getDate() - 1);
        to.setDate(now.getDate() - 1);
        break;
      case "2_days":
        from.setDate(now.getDate() - 2);
        to.setDate(now.getDate() - 2);
        break;
      case "3_days":
        from.setDate(now.getDate() - 3);
        to.setDate(now.getDate() - 3);
        break;
      case "this_week":
        const day = now.getDay() || 7;
        from.setDate(now.getDate() - day + 1);
        break;
      case "last_week":
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setDate(now.getDate() - (now.getDay() || 7));
        from = new Date(lastWeekEnd);
        from.setDate(lastWeekEnd.getDate() - 6);
        to = lastWeekEnd;
        break;
      case "this_month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "last_month":
        const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        from = new Date(year, month, 1);
        to = new Date(year, month + 1, 0);
        break;
    }

    setPeriod(value);
    setDateFrom(formatDate(from));
    setDateTo(formatDate(to));
  };

  const deviceOptions = deviceList.map((d) => ({
    value: d.id,
    label: d.name,
  }));
  const geofenceOptions: OptionType[] = geofences
    .filter((geo) => geo.id != null)
    .map((geo) => ({
      value: geo.id!,
      label: geo.pcts_name,
    }));
  const columnOptions = columns.map((col) => ({
    value: col,
    label: col.replace(/_/g, " ").toUpperCase(),
  }));

  const selectStyles = {
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };
  // 🔥 ADD THESE (options with ALL)



  const deviceOptionsWithAll = [
    { value: "all", label: "All" },
    ...deviceOptions,
  ];

  const geofenceOptionsWithAll = [
    { value: "all", label: "All" },
    ...geofenceOptions,
  ];


  const columnOptionsWithAll = [
    { value: "all", label: "All" },
    ...columnOptions,
  ];
  const getCompactDateTime = () => {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
  };

  React.useImperativeHandle(ref, () => ({
    reset() {
      setReportType("");
      setSelectedDevices([]);
      setSelectedGeofences([]);
      setSkipColumns([]);
      setSchedule({ daily: false, weekly: false, monthly: false, skip: false });
      setPeriod("today");
      setDateFrom(formatDate(today));
      setDateTo(formatDate(today));

      (document.querySelector('input[type="text"]') as HTMLInputElement).value = "";
      (document.querySelector('input[type="email"]') as HTMLInputElement).value = "";
      (document.querySelector('select') as HTMLSelectElement).value = "";
    },

    // ✅ EDIT PREFILL LOGIC
    setFormData(report: ReportDTO) {
      setReportType(report.reportType || "");
      setPeriod(report.period || "today");
      setDateFrom(report.from_date || formatDate(today));
      setDateTo(report.to_date || formatDate(today));

      // 🔥 DEVICES
      const deviceSelected = deviceOptions.filter(d =>
        report.devices?.includes(d.value));
      setDeviceOptionsSelected(deviceSelected);
      setSelectedDevices(report.devices || []);
      setInitialSkipColumns(report.skip_column || []);
      setSkipColumns(report.skip_column || []);

      // 🔥 GEOFENCES
      const geoSelected = geofenceOptions.filter(g =>
        report.geofences?.includes(g.value)
      );
      setGeofenceOptionsSelected(geoSelected);
      setSelectedGeofences(report.geofences || []);

      // 🔥 SKIP COLUMNS
      const columnSelected = columnOptions.filter(c =>
        report.skip_column?.includes(c.value)
      );
      setSkipColumnOptionsSelected(columnSelected);
      setSkipColumns(report.skip_column || []);

      setSchedule({
        daily: report.daily !== "false" && !!report.daily,
        weekly: report.weekly !== "false" && !!report.weekly,
        monthly: report.monthly !== "false" && !!report.monthly,
        skip: !!report.skip_column?.length,
      });

      // ⬇️ ADD THIS
      setDailyTime(report.daily && report.daily !== "false" ? report.daily : "00:00");
      if (report.weekly && report.weekly !== "false") {
        const [day, time] = report.weekly.split("_");

        setWeeklyDay(day || "mon");
        setWeeklyTime(time || "00:00");
      } else {
        setWeeklyDay("mon");
        setWeeklyTime("00:00");
      }
      if (report.monthly && report.monthly !== "false") {
        const [date, time] = report.monthly.split("_");

        setMonthlyDate(date || "1");
        setMonthlyTime(time || "00:00");
      } else {
        setMonthlyDate("1");
        setMonthlyTime("00:00");
      }

      setTitle(report.title || "");
      setFormat(report.outputFormat || "");
      setEmail(report.emailTo || "");
      setEmailCc(report.emailCc || "");
      setSpeedLimit(report.speed_limit || "60");
      setStops(report.stops || "60");







    }
    ,

    getFormData(): ReportDTO {
      if (!validate()) {
        throw new Error("Validation failed");
      }

      return {
        title,
        outputFormat: format,
        reportType: reportType,
        period,
        from_date: dateFrom,
        to_date: dateTo,
        devices: selectedDevices,
        geofences: selectedGeofences,
        skip_column: skipColumns,
        daily: schedule.daily ? dailyTime : "false",
        weekly: schedule.weekly ? `${weeklyDay}_${weeklyTime}` : "false",
        monthly: schedule.monthly ? `${parseInt(monthlyDate)}_${monthlyTime}` : "false",
        emailTo: email,
        emailCc: emailCc,
        template_id: selectedTemplate?.value,
        speed_limit: speedLimit,
        stops,
      };
    },

  }));
  const CustomMultiValue = () => null;
  return (
    <div className="report-form">
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label required">Type</label>
          <select
            value={reportType}
            onChange={(e) => {
              const value = e.target.value;
              setReportType(value);
              if (!value) {
                if (isAutoTitle) {
                  setTitle("");   //clear title
                }
                return;
              }

              // get label from options instead of static map
              const selected = reportTypeOptions.find(opt => opt.value === value);
              const label = selected?.label || "";

              const dateTime = getCompactDateTime();

              if (isAutoTitle && label) {
                const newTitle = `${label}_${dateTime}`;
                setTitle(newTitle);

                // 🔥 IMPORTANT: clear error when auto title is set
                if (newTitle.trim()) {
                  setErrors((prev: any) => ({
                    ...prev,
                    title: "",
                  }));
                }
              }
              if (errors.reportType) {
                setErrors((prev: any) => {
                  const updated = { ...prev };
                  delete updated.reportType;
                  return updated;
                });
              }
            }}
          >
            <option value="">Select Report</option>

            {reportTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {errors.reportType && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors.reportType}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label required">Format</label>
          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value);

              if (errors.format) {
                setErrors((prev: any) => {
                  const updated = { ...prev };
                  delete updated.format;
                  return updated;
                });
              }
            }}
          >
            <option value="">Select Format</option>
            <option value="HTML">HTML</option>
            <option value="JSON">JSON</option>
            <option value="XLSX">XLSX</option>
            <option value="CSV">CSV</option>
            <option value="PDF">PDF</option>
          </select>

          {errors.format && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors.format}
            </span>
          )}
        </div>
        <div className="form-group">
          <label className="form-label required">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              setTitle(value);
              setIsAutoTitle(false);

              setErrors((prev: any) => ({
                ...prev,
                title: value.trim() ? "" : "Title is mandatory",
              }));
            }}

          />

          {errors.title && errors.title !== "" && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors.title}
            </span>
          )}
        </div>


        <div className="form-group">
          <label>Objects</label>
          <div ref={deviceRef} onMouseDown={() => {
            // IMPORTANT (stop default focus toggle)
            setDeviceMenuOpen(prev => !prev);
          }}>
            <Select
              isMulti
              options={deviceOptionsWithAll}   // changed
              value={deviceOptionsSelected}
              placeholder="Select Objects"
              classNamePrefix="rs"
              menuPortalTarget={document.body}


              hideSelectedOptions={false}
              closeMenuOnSelect={false}
              closeMenuOnScroll={true}

              menuIsOpen={deviceMenuOpen}
              // onFocus={() => setDeviceMenuOpen(true)}

              onChange={(selected) => {
                const values = selected ? [...selected] : [];

                // If ALL clicked
                if (values.some(v => v.value === "all")) {
                  setDeviceOptionsSelected(deviceOptions); // only real options
                  setSelectedDevices(deviceOptions.map(i => i.value));
                  if (errors.devices) {
                    setErrors((prev: any) => {
                      const updated = { ...prev };
                      delete updated.devices;
                      return updated;
                    });
                  }
                  return;
                }


                // 🔥 Remove ALL if present accidentally
                const filtered = values.filter(v => v.value !== "all");

                setDeviceOptionsSelected(filtered);
                setSelectedDevices(filtered.map(i => i.value));
                if (errors.devices) {
                  setErrors((prev: any) => {
                    const updated = { ...prev };
                    delete updated.devices;
                    return updated;
                  });
                }
              }}
              styles={{
                ...selectStyles,
                input: (base) => ({
                  ...base,
                  opacity: 0,        // 👈 hide completely
                  width: 0,          // 👈 remove space
                  margin: 0,
                  padding: 0,
                }),
                control: (base) => ({
                  ...base,
                  cursor: "pointer",
                }),
              }}



              components={{
                ValueContainer: CustomMultiValueContainer,
                Option: CustomOption,
                MultiValue: CustomMultiValue,
              }}
            />
          </div>
          {errors.devices && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors.devices}
            </span>
          )}

        </div>

        <div className="form-group">
          <label>Period</label>
          <select value={period} onChange={(e) => handlePeriodChange(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="2_days">Before 2 days</option>
            <option value="3_days">Before 3 days</option>
            <option value="this_week">This week</option>
            <option value="last_week">Last week</option>
            <option value="this_month">This month</option>
            <option value="last_month">Last month</option>
          </select>
        </div>

        <div className="form-group">
          <label>Geofences</label>
          <div ref={geoRef} onMouseDown={() => {
            if (reportType !== "geofencesreport") return;   // 🔥 ADD THIS LINE
            // e.preventDefault();
            setGeoMenuOpen(prev => !prev);
          }}
          >
            <Select
              isMulti
              classNamePrefix="rs"
              placeholder="Select Geofences"
              options={geofenceOptionsWithAll}
              value={geofenceOptionsSelected}
              isDisabled={reportType !== "geofencesreport"}

              hideSelectedOptions={false}
              closeMenuOnSelect={false}
              closeMenuOnScroll={true}

              menuIsOpen={geoMenuOpen}
              // onFocus={() => setGeoMenuOpen(true)}

              onChange={(selected) => {
                const values = selected ? [...selected] : [];

                if (values.some(v => v.value === "all")) {
                  setGeofenceOptionsSelected(geofenceOptions);
                  setSelectedGeofences(geofenceOptions.map(i => i.value));
                } else {
                  const filtered = values.filter(v => v.value !== "all");
                  setGeofenceOptionsSelected(filtered);
                  setSelectedGeofences(filtered.map(i => i.value));
                }

                // Clear error when user selects something
                if (errors.geofences) {
                  setErrors((prev: any) => {
                    const updated = { ...prev };
                    delete updated.geofences;
                    return updated;
                  });
                }
              }}
              styles={{
                ...selectStyles,
                input: (base) => ({
                  ...base,
                  opacity: 0,        // 👈 hide completely
                  width: 0,          // 👈 remove space
                  margin: 0,
                  padding: 0,
                }),
                control: (base) => ({
                  ...base,
                  cursor: "pointer",
                }),
              }}
              components={{
                ValueContainer: CustomMultiValueContainer,
                Option: CustomOption,
                MultiValue: CustomMultiValue,
              }}
            />
          </div>
          {/* NEW: Geofence Error Message */}
          {errors.geofences && (
            <span style={{ color: "red", fontSize: "12px" }}>
              {errors.geofences}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>Date From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Date To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        <div className="form-group email-full">
          <label>Send To Email</label>
          <div className="input-icon">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="form-group email-full">
          <label>CC Email</label>
          <div className="input-icon">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Enter CC email"
              value={emailCc}
              onChange={(e) => setEmailCc(e.target.value)}
            />
          </div>
        </div>

        <div
          className="speed-stops"
          style={{
            display: "flex",
            gap: "10px",
            width: "100%",
            gridColumn: "1 / -1"   // 🔥 THIS IS THE REAL FIX
          }}
        >
          <div className="form-group" style={{ flex: 1 }}>
            <label>Speed Limit</label>
            <input
              type="number"
              value={speedLimit}
              onChange={(e) => setSpeedLimit(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label>Email Template</label>

            <Select
              options={templateOptions}
              value={selectedTemplate}
              onChange={(val) => {
                setSelectedTemplate(val);
              }}
              placeholder="Select Template"
              classNamePrefix="rs"
              isClearable

              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base: any) => ({
                  ...base,
                  zIndex: 99999,
                }),
              }}
            />
          </div>
        </div>

      </div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          width: "100%",
          marginTop: "10px",
        }}
      >
        {/* LEFT SIDE (50%) */}
        <div style={{ flex: 1 }}>
          <label>
            <input
              type="checkbox"
              checked={schedule.skip}
              onChange={() => toggle("skip")}
            />
            Skip Blank Results
          </label>

          <div
            ref={columnRef}
            onMouseDown={(e) => {
              if (!schedule.skip) return;
              e.preventDefault();
              setColumnMenuOpen((prev) => !prev);
            }}
          >
            <Select
              isMulti
              options={columnOptionsWithAll}
              classNamePrefix="rs"
              placeholder="Select Columns"
              value={skipColumnOptionsSelected}
              isDisabled={!schedule.skip}
              hideSelectedOptions={false}
              closeMenuOnSelect={false}
              closeMenuOnScroll={true}
              menuIsOpen={columnMenuOpen}
              // onFocus={() => setColumnMenuOpen(true)}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              menuPlacement="top"
              styles={{
                ...selectStyles,                    // Keep your global zIndex
                menuPortal: (base: any) => ({
                  ...base,
                  zIndex: 99999,
                }),
                input: (base: any) => ({
                  ...base,
                  opacity: 0,        // Hide blinking cursor
                  width: 0,
                  margin: 0,
                  padding: 0,
                }),
                control: (base: any) => ({
                  ...base,
                  cursor: "pointer", // Make it look clickable
                  minHeight: "40px", // Match other inputs
                }),
              }}
              onChange={(selected) => {
                const values = selected ? [...selected] : [];

                if (values.some((v) => v.value === "all")) {
                  setSkipColumnOptionsSelected(columnOptions);
                  setSkipColumns(columnOptions.map((i) => i.value));
                  return;
                }

                setSkipColumnOptionsSelected(values);
                setSkipColumns(values.map((i) => i.value));
              }}
              components={{
                ValueContainer: CustomMultiValueContainer,
                Option: CustomOption,
                MultiValue: () => null,
              }}
            />
          </div>
        </div>

        {/* RIGHT SIDE (50%) */}
        <div style={{ flex: 1 }} className="schedule-grid-2row">

          {/* DAILY */}
          <div >
            <label>
              <input
                type="checkbox"
                checked={schedule.daily}
                onChange={() => toggle("daily")}
              />
              Daily
            </label>

            <input
              type="time"
              value={dailyTime}
              onChange={(e) => setDailyTime(e.target.value)}
              disabled={!schedule.daily}
            />
          </div>

          {/* WEEKLY */}
          <div >
            <label>
              <input
                type="checkbox"
                checked={schedule.weekly}
                onChange={() => toggle("weekly")}
              />
              Weekly
            </label>

            <div className="flex-row">
              <select
                value={weeklyDay}
                onChange={(e) => setWeeklyDay(e.target.value)}
                disabled={!schedule.weekly}
                style={{ width: "80px" }}
              >
                <option value="mon">Mon</option>
                <option value="tue">Tue</option>
                <option value="wed">Wed</option>
                <option value="thu">Thu</option>
                <option value="fri">Fri</option>
                <option value="sat">Sat</option>
                <option value="sun">Sun</option>
              </select>

              <input
                type="time"
                value={weeklyTime}
                onChange={(e) => setWeeklyTime(e.target.value)}
                disabled={!schedule.weekly}
              />
            </div>
          </div>

          {/* MONTHLY */}
          <div>
            <label>
              <input
                type="checkbox"
                checked={schedule.monthly}
                onChange={() => toggle("monthly")}
              />
              Monthly
            </label>

            <div className="flex-row">
              <select
                value={monthlyDate}
                onChange={(e) =>
                  setMonthlyDate(String(parseInt(e.target.value)))
                }
                disabled={!schedule.monthly}
                style={{ width: "40px" }}
              >
                {Array.from({ length: 27 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={monthlyTime}
                onChange={(e) => setMonthlyTime(e.target.value)}
                disabled={!schedule.monthly}
              />
            </div>
          </div>
        </div>
      </div>



    </div>
  );
});

export default MainTab;
