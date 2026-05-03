import React, { useState, useEffect, useCallback } from "react";
import anotherAxiosClient from "../../api/anotherAxiosClient";
import Datatable, { type Column } from "./DatatableNew";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchLiveDataByDeviceId } from "../../slices/liveDataByDeviceIdSlice";


interface Props {
  deviceId: string;
}

interface DownloadRow {
  id: number;
  sim: number;
  deviceName?: string;
  channel: number;
  streamType: number;
  status: string;
  completedAt: string;
    fileSize?: number; 
}

const VideoDownload: React.FC<Props> = ({ deviceId }) => {
  /////////////////////////////////////////////////////////
  // ✅ Default dates (today)
  /////////////////////////////////////////////////////////

  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);

  const [data, setData] = useState<DownloadRow[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
const dispatch = useAppDispatch();
useEffect(() => {
  if (!deviceId) return;

  dispatch(fetchLiveDataByDeviceId(Number(deviceId)));
}, [deviceId, dispatch]);

const { data: deviceData } = useAppSelector(
  (state) => state.liveDataByDeviceId
);
  const columns: Column<DownloadRow>[] = [
    { key: "sim", label: "Unique ID" },
      {
    key: "deviceName",
    label: "Device Name",
    render: () => deviceData?.device_name || "-",
  },
    { key: "channel", label: "Channel" },
    { key: "streamType", label: "Stream Type" },
   {
    key: "fileSize",
    label: "File Size",
    render: (row) =>
      row.fileSize ? `${Number(row.fileSize).toFixed(2)} MB` : "-",
  },
    /////////////////////////////////////////////////////////
    // ✅ STATUS BADGE COLUMN (SUCCESS / FAILED / SENT)
    /////////////////////////////////////////////////////////
    {
      key: "status",
      label: "Status",
      render: (row) => {
        let bg = "#757575";
        let text = row.status;

        switch (row.status) {
          case "SUCCESS":
            bg = "#2e7d32"; // green
            text = "Success";
            break;

          case "FAILED":
            bg = "#d32f2f"; // red
            text = "Failed";
            break;

          case "SENT":
            bg = "#f9a825"; // amber
            text = "Processing";
            break;

          default:
            bg = "#9e9e9e";
            text = row.status || "Unknown";
        }

        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#fff",
              background: bg,
            }}
          >
            {text}
          </span>
        );
      },
    },

    /////////////////////////////////////////////////////////
    // ✅ COMPLETED AT
    /////////////////////////////////////////////////////////
    {
      key: "completedAt",
      label: "Completed At",
      render: (row) =>
        row.completedAt ? new Date(row.completedAt).toLocaleString() : "-",
    },

    /////////////////////////////////////////////////////////
    // ✅ ACTION COLUMN BASED ON STATUS
    /////////////////////////////////////////////////////////
    {
      key: "action",
      label: "Action",
      render: (row) => {
        /////////////////////////////////////////////////////
        // SUCCESS → Download button (disabled for now)
        /////////////////////////////////////////////////////
        if (row.status === "SUCCESS") {
  return (
    <button
      onClick={() => downloadVideo(row.id)}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "18px",
      }}
    >
      ⬇️
    </button>
  );
}

        /////////////////////////////////////////////////////
        // FAILED → Failed badge
        /////////////////////////////////////////////////////
        if (row.status === "FAILED") {
          return (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 600,
                background: "#ffcdd2",
                color: "#b71c1c",
              }}
            >
              Failed
            </span>
          );
        }
         // CANCELLED → Disabled buttons
    if (row.status === "CANCELLED") {
      return (
        <>
          <button disabled style={{ opacity: 0.4 }}>⏸</button>
          <button disabled style={{ opacity: 0.4 }}>▶</button>
          <button disabled style={{ opacity: 0.4 }}>❌</button>
        </>
      );
    }

        /////////////////////////////////////////////////////
        // SENT → Processing badge
        /////////////////////////////////////////////////////
if (row.status === "SENT") {
  return (
    <>
      <button title="Pause Upload" onClick={() => pauseUpload(row.id)}>⏸</button>
      <button title="Cancel Upload" onClick={() => cancelUpload(row.id)}>❌</button>
    </>
  );
}

if (row.status === "PAUSED") {
  return (
    <>
      <button title="Resume Upload" onClick={() => resumeUpload(row.id)}>▶</button>
      <button title="Cancel Upload" onClick={() => cancelUpload(row.id)}>❌</button>
    </>
  );
}

        return "-";
      },
    },
  ];

  const fetchData = useCallback(async () => {
    if (!deviceId) return;

    try {
      setLoading(true);

      const res = await anotherAxiosClient.post(
        "/live/download",
        null, // no body
        {
          headers: {
            startDate,
            endDate,
            deviceId,
            search,
          },
          params: {
            page: page - 1,
            size: pageSize,
          },
        },
      );

      setData(res.data?.content || []);
      setTotal(res.data?.totalElements || 0);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, startDate, endDate, deviceId, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(1);
  };
  const pauseUpload = async (id:number)=>{
 await anotherAxiosClient.post("/live/file-upload-control",null,{
   params:{ taskId:id, action:0 }
 })
}

const resumeUpload = async (id:number)=>{
 await anotherAxiosClient.post("/live/file-upload-control",null,{
   params:{ taskId:id, action:1 }
 })
}

const cancelUpload = async (id:number)=>{
 await anotherAxiosClient.post("/live/file-upload-control",null,{
   params:{ taskId:id, action:2 }
 })
}
const downloadVideo = async (id: number) => {
  try {
    const response = await anotherAxiosClient.get(
      `/live/download-video/${id}`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const disposition = response.headers["content-disposition"];
    const fileName = disposition?.split("filename=")[1] || `video_${id}.avi`;

    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
  }
};

  return (
    <div style={styles.container}>
      {/* ================= Filter Bar ================= */}

      <div style={styles.filterBar}>
        <div style={styles.field}>
          <label style={styles.label}>From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.input}
          />
        </div>

        <button onClick={handleSearch} style={styles.button}>
          Search
        </button>
      </div>

      {/* ================= Table ================= */}

      <Datatable<DownloadRow>
        columns={columns}
        data={data}
        totalRecords={total}
        page={page}
        pageSize={pageSize}
        search={search}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPage(1);
          setPageSize(size);
        }}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
      />
    </div>
  );
};

export default VideoDownload;

const styles = {
  container: {
    padding: "24px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },

  title: {
    marginBottom: "18px",
    fontSize: "20px",
    fontWeight: 600,
    color: "#222",
  },

 filterBar: {
  display: "flex",
  alignItems: "flex-end",
  gap: "16px",
  marginBottom: "20px",
  paddingBottom: "14px",   // 👈 space above border
  marginTop: "10px",       // 👈 little top spacing
  flexWrap: "wrap" as const,
  borderBottom: "1px solid #ddd",
 marginLeft: "-24px",   // 👈 cancel container padding
  marginRight: "-24px",  // 👈 cancel container padding
  paddingLeft: "24px",   // 👈 keep content aligned
  paddingRight: "24px",  // 👈 keep content aligned
},
  field: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },

  label: {
    fontSize: "13px",
    color: "#666",
    fontWeight: 500,
  },

  input: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #d0d7de",
    fontSize: "14px",
    outline: "none",
    minWidth: "280px",
  },

  button: {
    padding: "9px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    height: "38px",
    transition: "all 0.2s ease",
    width: "280px",
  },
};
