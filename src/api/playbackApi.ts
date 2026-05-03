import axiosClient from "./axiosClient";

export interface PlaybackRequest {
  deviceId: number;
  start_time: string;   // yyyy-MM-dd HH:mm:ss
  end_time: string;     // yyyy-MM-dd HH:mm:ss
  time_interval: number;
  type: "IDLING" | "WORKING";
}

export async function getPlaybackData(
  params: PlaybackRequest
): Promise<any> {

  const response = await axiosClient.get("/devices/PlaybackData", {
    params: {
      deviceId: params.deviceId,
      start_time: params.start_time,
      end_time: params.end_time,
      time_interval: params.time_interval,
      type: params.type
    }
  });

  return response.data;
}