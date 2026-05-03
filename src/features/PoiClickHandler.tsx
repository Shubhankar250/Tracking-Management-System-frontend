import { useMapEvents } from "react-leaflet";

interface Props {
  enabled: boolean;
  onClick: (lat: number, lng: number) => void;
}

const PoiClickHandler: React.FC<Props> = ({ enabled, onClick }) => {

  useMapEvents({
    click(e) {
      if (!enabled) return;

      console.log("🔥 Map click captured");

      onClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

export default PoiClickHandler;
