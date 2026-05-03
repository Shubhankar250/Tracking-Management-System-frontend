// Auto-load all marker icons from folder
const icons = import.meta.glob(
  "../assets/images/marker_icon/*.{png,svg,jpg,jpeg}",
  { eager: true }
);

export const markerIcons = Object.entries(icons).map(([path, mod]: any) => ({
  name: path.split("/").pop(), // filename only
  src: mod.default,            // resolved image URL
}));
