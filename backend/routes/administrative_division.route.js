const express = require("express");
const {
  createAdministrativeDivision,
  getAdministrativeDivisions,
  getAdministrativeDivisionById,
  updateAdministrativeDivision,
  deleteAdministrativeDivision,
  getFilteredAdministrativeDivisions,
  getDivisionsByType
} = require("../controllers/administrative_division.controller");

const router = express.Router();

router.get("/filter", getFilteredAdministrativeDivisions);
router.get("/by-type", getDivisionsByType);
router.get("/", getAdministrativeDivisions);
router.get("/:id", getAdministrativeDivisionById);

router.post("/", createAdministrativeDivision);
router.put("/:id", updateAdministrativeDivision);
router.delete("/:id", deleteAdministrativeDivision);

module.exports = router;
