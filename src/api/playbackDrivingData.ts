import axiosClient from "./axiosClient";

export async function getPlaybackDrivingData(params: {
  deviceId: number;
  start_time: string;
  end_time: string;
}): Promise<any> {

  const response = await axiosClient.get("/devices/PlaybackDataForDriving", {
    params: {
      deviceId: params.deviceId,
      start_time: params.start_time,
      end_time: params.end_time,
    }
  });

  return response.data;
}