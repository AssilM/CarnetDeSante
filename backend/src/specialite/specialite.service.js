import { findAllSpecialites } from "./specialite.repository.js";

const getAllSpecialites = async () => {
  return await findAllSpecialites();
};

export { getAllSpecialites };
