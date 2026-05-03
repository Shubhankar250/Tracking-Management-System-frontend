import axiosClient from "./axiosClient";

/* ================= DEVICES ================= */

/* GET devices */
export const getDevices = async (): Promise<Record<string, string>> => {
  const response = await axiosClient.get<Record<string, string>>(
    "/devices/list"
  );
  return response.data;
};
/* GET devices which is not assign */
export const getNotAssignDevices = async (): Promise<Record<string, string>> => {
  const response = await axiosClient.get<Record<string, string>>(
    "/devices/list/notAssignAnyDriver"
  );
  return response.data;
};
/* POST create device */
export interface DeviceSettingDto {
  name?: string;
  uniqueid?: string;
  vehicleStatus?: "ACTIVE" | "INACTIVE"; // 👈

  simCardNumber?: string;
  simActivationDate?: string;
  simExpirationDate?: string;
  vin?: string;
  deviceModel?: string;
  installationDate?: string;
  plateNumber?: string;
  registrationNumber?: string;
  owner?: string;
  fuelMeasureName?: string;
  fuelMeasurement?: number;
  fuelCost?: number;
  iconType?: string;
  movingIconColor?: string;
  stoppedIconColor?: string;
  offlineIconColor?: string;
  engineIdleColor?: string;
  status?: string;
  sensors?: string;
  tailColor?: string;
  tailLength?: number;
  imgIconName?: string;
  imgIconType?: string;
  odometer?: number;

  maxSpeed?: string;
  minMovingSpeed?: string;
  minFuelFillings?: string;
  minFuelTheft?: string;
  fuelChangeAfterStop?: string;
  objectIcon?: string;
  deviceTimezone?: string;
  groupId?: number;
  userId?: number;
}
export interface DevicesDetailsDto {
  deviceData: DevicesUpdateDto;
  liveData: LiveDataBean;

  groupNames: Record<number, string>;
  userMap: Record<number, string>;

  deviceModels: string[];
  sensorData: SensorListDTO[];
  maintenanceData: MaintenanceServiceDto[];
}
export interface DevicesUpdateDto {
  deviceId: number;
  deviceTimezone: string;
  deviceName: string;
  deviceModel: string;
  objectIcon: string;
  deviceImei: string;
  odometer: number;
  vehicleStatus: string;
  imgIconName:string;
  groupId: number;
  groupName: string;
  rcPath?: string;
  insurancePath?: string;

  username: string;
  userId: number;
  accountName: string;

  simCardNumber: string;
  simActivationDate: string;   // LocalDateTime
  simExpirationDate: string;   // LocalDateTime

  vin: string;
  installationDate: string;    // LocalDateTime
  plateNumber: string;
  registrationNumber: string;
  owner: string;

  fuelMeasureName: string;
  fuelMeasurement: number;     // BigDecimal → number
  fuelCost: number;            // BigDecimal → number

  iconType: string;
  movingIconColor: string;
  stoppedIconColor: string;
  offlineIconColor: string;
  engineIdleColor: string;

  tailColor: string;
  tailLength: number;


  maxSpeed: string;
  minMovingSpeed: string;
  minFuelFillings: string;
  minFuelTheft: string;
  fuelChangeAfterStop: string;
}
export interface DeviceSettingCustomBean {
  icon_type: string;
  moving_icon_color: string;
  stopped_icon_color: string;
  offline_icon_color: string;
  engine_idle_color: string;
  img_icon_name: string;
  img_icon_type: string;
}
export interface LiveDataBean {
  device_id: number;
  device_name: string;
  gps_status: string;

  group_id: number;
  group_name: string;

  devicetime: string;   // LocalDateTime
  servertime: string;   // LocalDateTime

  lastmovementtime: string;
  lastidletime: string;

  latitude: number;
  longitude: number;
  altitude: number;

  speed: number;
  course: number;

  address: string;
  attributes: string;

  ignition: boolean;
  motion: boolean;
  power: number;
  battery: number;
  distance: number;

  status: string; // MOVING / IDLE / STOPPED / NODATA

  deviceSetting: DeviceSettingCustomBean;
  resultantSensorBean: any;
}
export interface SensorListDTO {
  id: number;
  name: string;
  sensor_type_name: string;
  parameter: string;
}
export interface MaintenanceServiceDto {
  id: number;
  deviceId: number;
  deviceName: string;
  serviceName: string;

  odometerIntervalKmVal: number;
  odometerLeftKmVal: number;

  engineHourIntervalVal: number;
  engineHoursLeftVal: number;

  daysIntervalVal: number;
  daysLeftVal: number;

  eventTrigger: boolean;
}
export interface DGMDTO {
  group_name: string;
  deviceIds: number[];
  group_id?: number;
  device_name?: string;
  group_names?: string[];
  deletedIds?: number[];
}

export interface DeviceGroupDataDto {
  device_id: number;
  device_name: string;
  group_id: number;
  group_name: string;
}
export const createDevice = async (formData: FormData) => {
  const response = await axiosClient.post("/devices", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
/* PUT update device */
export const updateDevice = async (deviceId: number, payload: any) => {
  const formData = new FormData();

  Object.keys(payload).forEach((key) => {
    const value = payload[key];

    if (
      value !== undefined &&
      value !== null &&
      !(value instanceof File)
    ) {
      formData.append(key, value);
    }
  });

  if (payload.rcFile)
    formData.append("rcFile", payload.rcFile);

  if (payload.insuranceFile)
    formData.append("insuranceFile", payload.insuranceFile);

  const response = await axiosClient.put(
    `/devices/${deviceId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};



/* GET device by id (for update) */
export const getDeviceByIdForUpdate = async (
  deviceId: number
): Promise<DevicesDetailsDto> => {
  const response = await axiosClient.get<DevicesDetailsDto>(
    `/devices/${deviceId}`
  );
  return response.data;
};

/* ================= GROUPS ================= */

/* GET groups */
export const getGroups = async (): Promise<Record<string, string>> => {
  const response = await axiosClient.get<Record<string, string>>(
    "/devices/groups"
  );
  return response.data;
};
export const addDeviceGroup = async (payload: DGMDTO) => {
  const response = await axiosClient.post("/devices/DeviceGroupData", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* Update an existing device group */
export const updateDeviceGroup = async (payload: DGMDTO) => {
  const response = await axiosClient.put("/devices/updateDeviceGroupData", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

/* Fetch device group data for update (used to prefill modal) */
export const getDeviceGroupDataForUpdate = async (
  group_name: string,
  deviceIds: string
): Promise<DeviceGroupDataDto[]> => {
  const response = await axiosClient.get<DeviceGroupDataDto[]>(
    `/devices/getDeviceGroupDataForUpdate`,
    {
      params: { group_name, deviceIds },
    }
  );
  return response.data;
};
/* ================= USERS ================= */

/* GET users */
export const getUsers = async (): Promise<Record<string, string>> => {
  const response = await axiosClient.get<Record<string, string>>(
    "/devices/users"
  );
  return response.data;
};


/* ================= GET ALL OBJECT (DATATABLE) ================= */

export const getAllObject = async (
  draw: number,
  start: number,
  length: number,
  search: string  
) => {
  const response = await axiosClient.post(
    "/devices/getallobject",
    { draw, start, length, search },  
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
/* ================= TODAY ACTIVITY ================= */

export interface TodayActivityDTO {
  totalRunningTime: string;
  totalIdleTime: string;
  totalStopTime: string;
  workingHours: string;
  workStartTime: string;
  workEndTime: string;
  totalDistance:number
}

export const getTodayActivity = async (
  deviceId: number,
  date?: string
): Promise<TodayActivityDTO> => {
  const response = await axiosClient.get<TodayActivityDTO>(
    "/devices/todayactivity",
    {
      params: {
        deviceId,
        date: date || "",
      },
    }
  );

  return response.data;
};