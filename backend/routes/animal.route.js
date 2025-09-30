const express = require("express");
const {
    createAnimal,
    getAnimal,
    updateAnimal,
    deleteAnimal,
    getTotalCattlePopulation,
    getAnimalCategoryDistribution
} = require("../controllers/animal.controller");

const router = express.Router();

router.get("/", getAnimal);
router.get("/total", getTotalCattlePopulation);
router.get("/category-distribution", getAnimalCategoryDistribution);
router.post("/", createAnimal);
router.put("/:id", updateAnimal);
router.delete("/:id", deleteAnimal);

module.exports = router;
