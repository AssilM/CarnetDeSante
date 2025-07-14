import { getAllSpecialites } from "./specialite.service.js";

const getAllSpecialitesController = async (req, res, next) => {
  try {
    const specialites = await getAllSpecialites();
    res.status(200).json(specialites);
  } catch (error) {
    next(error);
  }
};

export { getAllSpecialitesController };
