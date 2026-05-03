import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const LayerRadioSwitcher = ({ baseLayer, setBaseLayer }: { baseLayer: string; setBaseLayer: (layer: string) => void }) => {
  const map = useMap();

  useEffect(() => {
    const Control = L.Control.extend({
      options: { position: "topright" },
      onAdd: function () {
        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        container.style.background = "#fff";
        container.style.padding = "6px";
        container.style.borderRadius = "6px";
        container.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "4px";

        const layers = [
          { id: "GOOGLE_ROADMAP", label: "Google Roadmap" },
          { id: "GOOGLE_SATELLITE", label: "Google Satellite" },
          { id: "GOOGLE_HYBRID", label: "Google Hybrid" },
          { id: "GOOGLE_TERRAIN", label: "Google Terrain" },
          { id: "MAPBOX_STREETS", label: "MapBox Streets" },
          { id: "MAPBOX_SATELLITE", label: "MapBox Satellite" },
        ];

        layers.forEach(({ id, label }) => {
          const div = L.DomUtil.create("div", "", container);

          const input = L.DomUtil.create("input", "", div) as HTMLInputElement;
          input.type = "radio";
          input.name = "baseLayer";
          input.value = id;
          input.checked = baseLayer === id;
          input.style.marginRight = "6px";
          input.onchange = () => setBaseLayer(id);

          const span = L.DomUtil.create("span", "", div);
          span.innerText = label;

          // Prevent map drag when clicking
          L.DomEvent.disableClickPropagation(div);
        });

        return container;
      },
    });

    const ctrl = new Control();
    map.addControl(ctrl);

    return () => {
      map.removeControl(ctrl);
    };
  }, [map, baseLayer, setBaseLayer]);

  return null;
};

export default LayerRadioSwitcher;