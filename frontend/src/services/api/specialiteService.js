import httpService from "../http/httpService";

export const getAllSpecialites = async () => {
  const response = await httpService.get("/specialites");
  return response.data;
};
