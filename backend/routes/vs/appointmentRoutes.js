const express = require('express');
const router = express.Router();
const appointmentController = require('../../controllers/vs/appointmentController');
const { protect } = require('../../middleware/authMiddleware');


router.get('/', protect, appointmentController.getAppointments);
router.post('/', protect, appointmentController.createAppointment);
router.put('/:id/status', protect, appointmentController.updateAppointmentStatus);
router.put('/:id', protect, appointmentController.updateAppointment);
router.delete('/:id', protect, appointmentController.deleteAppointment);
router.get('/farmers-and-farms-for-appointment', protect, appointmentController.getFarmersAndFarmsForAppointment);
router.get('/animals-by-farm/:farmId', protect, appointmentController.getAnimalsByFarmId);
router.get('/farmers-by-division', protect, appointmentController.getFarmersByVeterinaryDivision);
router.get('/farms-by-farmer/:farmerId', protect, appointmentController.getFarmsByFarmerId);

module.exports = router;