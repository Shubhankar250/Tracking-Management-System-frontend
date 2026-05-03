import axiosClient from "./axiosClient";

/* ================= TYPES ================= */
export interface PassengerAssignmentDTO {
  id?: number;
  passengerId?: number;
  passengerName?: string;
  passengerType?: string;
  routeId?: number;
  pickupStopId?: number;
  pickupStopName?: string;
  dropStopId?: number;
  dropStopName?: string;
  guardianName?: string;
  guardianMobile?: string;
  autoLoginEnabled?: boolean;
  username?: string;
  tempPassword?: string;
  passwordChanged?: boolean;
  active?: boolean;
}
export interface StopDTO {
  id?: number;
  sequenceNo?: number;
  stopName?: string;
  latitude?: number;
  longitude?: number;
  stopType?: string;
  geofenceRadius?: number;
  autoDetected?: boolean;
  approved?: boolean;
  passengerCount?: number;
  clientStopId?: number;
  announcementFile?: File | null;
}

export interface RoutePlannerRequest {
  routeId?: number;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  activeDays?: string[];
  holidayDates?: string[];

  routeName?: string;
  routeType?: string;
  defaultVehicleId?: number;
  sourceType?: string;
  routeGeoJson?: string;

  stops?: StopDTO[];
  passengers?: PassengerAssignmentDTO[];
}

export interface RoutePlannerResponse {
  routeId?: number;
  shiftId?: number;
  routeName?: string;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  routeType?: string;
  defaultVehicleId?: number;
  sourceType?: string;
  routeGeoJson?: string;
  activeDays?: string[];
  holidayDates?: string[];
  stops?: StopDTO[];
  defaultVehicleName?: string;
  passengers?: PassengerAssignmentDTO[];
}

export interface RouteImportResponse {
  stops: StopDTO[];
  routeGeoJson: string;
}

/* ================= API CALLS ================= */

// POST: /transport/planner/import-kml-text
export const importKmlText = (kml: string) => {
  return axiosClient.post<RouteImportResponse>(
    "/transport/planner/import-kml-text",
    { kml },
  );
};

// POST: /transport/planner/import-kml-file
export const importKmlFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file); // MUST match @RequestParam("file")

  return axiosClient.post<RouteImportResponse>(
    "/transport/planner/import-kml-file",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

// POST: /transport/planner/import-gps-file
export const importGpsFile = (
  file: File,
  idleMinutes = 5,
  stopRadiusMeters = 50,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("idleMinutes", idleMinutes.toString());
  formData.append("stopRadiusMeters", stopRadiusMeters.toString());

  return axiosClient.post<RouteImportResponse>(
    "/transport/planner/import-gps-file",
    formData,
  );
};

// POST: /transport/planner/import-gps-text
export const importGpsText = (data: {
  csv: string;
  idleMinutes?: number;
  stopRadiusMeters?: number;
}) => {
  return axiosClient.post<RouteImportResponse>(
    "/transport/planner/import-gps-text",
    data,
  );
};

// POST: /transport/planner/save
export const saveRouteWithFiles = (data: RoutePlannerRequest) => {
  const formData = new FormData();
  const cleanedStops = data.stops?.map((s) => ({
    ...s,
    announcementFile:
      typeof s.announcementFile === "string" ? s.announcementFile : null,
  }));

  formData.append(
    "route",
    JSON.stringify({
      ...data,
      stops: cleanedStops,
    }),
  );

  data.stops?.forEach((stop) => {
    if (stop.announcementFile instanceof File) {
      formData.append("files", stop.announcementFile);
    } else {
      formData.append("files", new Blob([]), "empty.txt");
    }
  });

  return axiosClient.post("/transport/planner/save", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// PUT: /transport/planner/{routeId}
export const updateRouteWithFiles = (
  routeId: number,
  data: RoutePlannerRequest,
) => {
  const formData = new FormData();

  const cleanedStops = data.stops?.map((s) => ({
    ...s,
    announcementFile:
      typeof s.announcementFile === "string" ? s.announcementFile : null,
  }));

  formData.append(
    "route",
    JSON.stringify({
      ...data,
      stops: cleanedStops,
    }),
  );

  data.stops?.forEach((stop) => {
    if (stop.announcementFile instanceof File) {
      formData.append("files", stop.announcementFile);
    } else {
      formData.append("files", new Blob([]), "empty.txt");
    }
  });

  return axiosClient.put(`/transport/planner/${routeId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
// GET: /transport/planner/{routeId}
export const getRouteById = (routeId: number) => {
  return axiosClient.get<RoutePlannerResponse>(`/transport/planner/${routeId}`);
};
export const getRoutes = (
  {
    page = 0,
    size = 25,
    search,
    routeType,
  }: {
    page?: number;
    size?: number;
    search?: string;
    routeType?: string;
  },
  signal?: AbortSignal,
) => {
  const params: any = { page, size };

  if (search?.trim()) params.search = search.trim();
  if (routeType?.trim()) params.routeType = routeType.trim();

  return axiosClient.get<{
    content: RoutePlannerResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }>("/transport/planner/list", {
    params,
    signal, // 🔥 KEY ADDITION
  });
};
