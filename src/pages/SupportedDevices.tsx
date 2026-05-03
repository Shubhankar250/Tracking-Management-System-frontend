import { useState, useEffect, useRef } from "react";
import { TbSearch, TbHeadset, TbDeviceDesktop } from "react-icons/tb";
import api from "../api/axiosClient";
import "../assets/css/SupportedDevices.css";
import { getAllCompanyNames, getDevicesByCompanyName, searchDeviceModal } from "../api/deviceModalService";
interface SearchResult {
  id: number;
  modalName: string;
  image: string;
}

interface DeviceModalDTO {
  id?: number;
  companyName?: string;
  modalName?: string;
  modalType?: string;
  image?: string;
  protocolName?: string;
  noOfChannel?: number;
  connectedIP?: string;
  connectedPort?: string;
}

const SupportedDevices = () => {
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceModalDTO[]>([]);

  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [deviceDetail, setDeviceDetail] = useState<DeviceModalDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const deviceCardRef = useRef<HTMLDivElement | null>(null);

  const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

  // Fetch company names
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await getAllCompanyNames();
        setCompanies(res.data);
      } catch (err) {
        console.error("Error fetching companies", err);
      }
    };
    fetchCompanies();
  }, []);

  // Load all devices by company
  const handleCompanySelect = async (company: string) => {
  setSelectedCompany(company);

  setKeyword("");
  setSearchResults([]);
  setDeviceDetail(null);
  setLoading(true);

  try {
    // if "ALL" selected, send undefined to backend
    const apiParam = company === "ALL" ? undefined : company;
    const res = await getDevicesByCompanyName(apiParam);
    setDevices(res.data);
  } catch (err) {
    console.error(err);
    setDevices([]);
  } finally {
    setLoading(false);
  }
};
  // Search devices by keyword
 useEffect(() => {
  if (!keyword) {
    setSearchResults([]);
    return;
  }

  // Reset company filter
  setSelectedCompany(null);
  setDevices([]);

  const timer = setTimeout(async () => {
    try {
      const res = await searchDeviceModal(keyword);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  }, 400);

  return () => clearTimeout(timer);
}, [keyword]);

  // Load device details
  const loadDeviceDetail = async (id: number) => {
    try {
      const res = await api.get(`/devicemodal/${id}`);
      setDeviceDetail(res.data);
      setDevices([]);
      setSearchResults([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="sd-page">
      <div className="sd-container">
        {/* HEADER */}
        <div className="sd-header">
          <div className="tp-chip mb-3">
            <TbDeviceDesktop style={{ marginRight: 6 }} />
            Device Compatibility
          </div>
          <h1>Supported GPS Devices</h1>
          <p>Works with popular trackers and protocols.</p>
        </div>

        {/* DROPDOWN + SEARCH INLINE */}
        <div className="sd-card sd-accent sd-search-bar">
          <div className="sd-search-bar-row">
            {/* Company Dropdown */}
            <div className="sd-dropdown-wrapper">
             <select
  value={selectedCompany ?? ""} 
  onChange={(e) => handleCompanySelect(e.target.value)}
>
  {/* Placeholder */}
  <option value="" disabled>
    Select Manufacturer
  </option>

  {/* ALL option */}
  <option value="ALL">ALL</option>

  {/* Company options */}
  {companies.map((c) => (
    <option key={c} value={c}>
      {c}
    </option>
  ))}
</select>
            </div>

            {/* Search Input */}
            <div className="sd-search-wrapper">
              <div className="sd-search sd-search-inline">
                <TbSearch />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search device..."
                />
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="sd-search-results">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="sd-search-item"
                      onClick={() => loadDeviceDetail(item.id)}
                    >
                      <img
                        src={`${BASE_URL}/${item.image}`}
                        alt={item.modalName}
                        width={35}
                        height={35}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                      />
                      <span>{item.modalName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && <div className="sd-no-results">Loading devices...</div>}

        {/* DEVICES CARDS FROM COMPANY */}
        <div className="sd-grid">
          {devices.map((device) => (
            <div key={device.id} className="sd-card sd-accent sd-device-card">
  <div className="sd-device-image">
    {device.image && (
      <img src={`${BASE_URL}/${device.image}`} alt={device.modalName} />
    )}
  </div>

  <div className="sd-device-content" style={{ textAlign: "center", marginTop: "10px" }}>
    <h4 style={{ fontWeight: 600 }}>{device.modalName}</h4>
    {device.connectedPort && (
      <p style={{ color: "#2563eb", margin: "4px 0", fontSize: "13px" }}>
        Port: {device.connectedPort}
      </p>
    )}
    {device.protocolName && (
      <p style={{ color: "#2563eb", margin: "2px 0", fontSize: "12px" }}>
        Protocol: {device.protocolName}
      </p>
    )}
  </div>
</div>
          ))}
        </div>

        {/* DEVICE DETAIL CARD (FROM SEARCH) */}
      {deviceDetail && (
  <div ref={deviceCardRef} className="sd-device-wrapper open">
    <div className="sd-card sd-accent sd-device-card">
      {/* Device image */}
      {deviceDetail.image && (
        <div className="sd-device-image">
          <img
            src={`${BASE_URL}/${deviceDetail.image}`}
            alt={deviceDetail.modalName}
          />
        </div>
      )}

      {/* Device content */}
      <div className="sd-device-content" style={{ textAlign: "center", marginTop: "10px" }}>
        <h4 style={{ fontWeight: 600 }}>{deviceDetail.modalName}</h4>
        {deviceDetail.connectedPort && (
          <p style={{ color: "#2563eb", margin: "4px 0", fontSize: "13px" }}>
            Port: {deviceDetail.connectedPort}
          </p>
        )}
        {deviceDetail.protocolName && (
          <p style={{ color: "#2563eb", margin: "2px 0", fontSize: "12px" }}>
            Protocol: {deviceDetail.protocolName}
          </p>
        )}
      </div>
    </div>
  </div>
)}

        {/* SUPPORT CARD */}
       {/* SAMPLE SUPPORTED MODELS */}
<div className="sd-card sd-accent">
  <h3>Sample supported models</h3>
  <div className="sd-model">Teltonika — FMB920</div>
  <div className="sd-model">Concox — GT06N</div>
  <div className="sd-model">Meitrack — T333</div>

  <button className="sd-btn-primary sd-full">
    <TbHeadset style={{ marginRight: 6 }} />
    Ask for Compatibility Check
  </button>
</div>
      </div>
    </div>
  );
};

export default SupportedDevices;