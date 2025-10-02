const Appointment = require('../../models/Appointments');
const User = require('../../models/users');
const Farm = require('../../models/farms');
const Animal = require('../../models/animals');
const Farmer = require('../../models/farmers');
const AdministrativeDivision = require('../../models/administrative_divisions');
const UserRole = require('../../models/user_roles');

const getAuthenticatedVeterinaryId = (req) => {
    if (req.user && req.user._id) {
        console.log('DEBUG: Authenticated VS ID from req.user:', req.user._id);
        return req.user._id;
    }
    console.warn('WARNING: req.user._id not found. Ensure authentication middleware is set up correctly.');
    return null;
};

const getAuthenticatedUserId = (req) => {
    return req.user ? req.user.id : null;
};

exports.getAppointments = async (req, res) => {
    console.log('DEBUG: Entering getAppointments controller.');
    try {
        const veterinaryId = getAuthenticatedVeterinaryId(req);
        if (!veterinaryId) {
            console.error('ERROR: No veterinary ID found for getAppointments.');
            return res.status(401).json({ message: 'Unauthorized: Veterinary ID missing.' });
        }

        console.log(`DEBUG: Fetching appointments for VS ID: ${veterinaryId}`);
        const appointments = await Appointment.find({ veterinary_id: veterinaryId })
            .populate('farmer_id', 'full_name')
            .populate('farm_id', 'farm_name')
            .lean();

        console.log(`DEBUG: Found ${appointments.length} appointments.`);

        const appointmentsWithDetails = await Promise.all(appointments.map(async (appointment) => {
            let animalName = appointment.animal_tag;
            let animalTagId = null;
            let animalType = null;

            const match = appointment.animal_tag?.match(/^(.+?)\s+\((.+)\)$/);
            if (match) {
                animalType = match[1];
                animalTagId = match[2];
                console.log("Parsed Type:", animalType);
                console.log("Parsed Tag ID:", animalTagId);
            } else {
                console.log("Format not matched, using raw animal_tag");
                animalTagId = appointment.animal_tag;
            }

            let finalAnimalName = appointment.animal_tag;
            if (appointment.farm_id && animalTagId) {
                const animal = await Animal.findOne({
                    animal_tag: animalTagId,
                    farm_id: appointment.farm_id._id
                });
                if (animal) {
                    finalAnimalName = `${animal.animal_type} (${animal.animal_tag})`;
                    console.log(`DEBUG: Animal found for tag ${animalTagId}: ${finalAnimalName}`);
                } else {
                    console.log(`DEBUG: Animal with tag ${animalTagId} not found in farm ${appointment.farm_id._id}.`);
                    finalAnimalName = appointment.animal_tag;
                }
            }

            const farmerName = appointment.farmer_id ? appointment.farmer_id.full_name : 'Unknown Farmer';
            const farmName = appointment.farm_id ? appointment.farm_id.farm_name : 'Unknown Farm';
            const time = `${String(appointment.hour).padStart(2, '0')}:${String(appointment.minute).padStart(2, '0')}`;

            console.log(`DEBUG: Processing appointment ${appointment._id} - Farmer: ${farmerName}, Farm: ${farmName}, Animal: ${finalAnimalName}`);

            return {
                ...appointment,
                animalName: finalAnimalName,
                farmerName: farmerName,
                farmName: farmName,
                time: time,
                status_flag: appointment.status_flag || appointment.status,
                farmer_id: appointment.farmer_id,
                farm_id: appointment.farm_id
            };
        }));

        res.status(200).json(appointmentsWithDetails);
        console.log('DEBUG: getAppointments controller finished successfully.');
    } catch (error) {
        console.error('ERROR in getAppointments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.createAppointment = async (req, res) => {
    console.log('DEBUG: Entering createAppointment controller.');
    const { animal_tag, farmer_id, farm_id, date, hour, minute, procedure, notes, status_flag } = req.body;
    const veterinaryId = getAuthenticatedVeterinaryId(req);

    console.log('DEBUG: Received appointment data:', { animal_tag, farmer_id, farm_id, date, hour, minute, procedure, notes, status_flag: req.body.status_flag });
    console.log('DEBUG: Authenticated VS ID for creation:', veterinaryId);

    if (!animal_tag || !farmer_id || !farm_id || !date || hour === undefined || minute === undefined || !procedure || !veterinaryId || !status_flag) {
        console.error('ERROR: Missing required fields for appointment creation.');
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    try {
        const farmerExists = await User.findById(farmer_id);
        console.log(`DEBUG: Farmer (ID: ${farmer_id}) exists: ${!!farmerExists}`);
        const farmExists = await Farm.findById(farm_id);
        console.log(`DEBUG: Farm (ID: ${farm_id}) exists: ${!!farmExists}`);

        const match = animal_tag.match(/^(.+?)\s+\((.+)\)$/);
        let animalType = null;
        let animalId = null;
        if (match) {
            animalType = match[1];
            animalId = match[2];
            console.log("Type:", animalType);
            console.log("Tag ID:", animalId);
        } else {
            console.log("Format not matched");
        }

        const animalExists = await Animal.findOne({ animal_tag: animalId, farm_id: farm_id });
        console.log(`DEBUG: Animal (Tag: ${animal_tag}, Farm: ${farm_id}) exists: ${!!animalExists}`);

        if (!farmerExists || !farmExists || !animalExists) {
            let notFoundMessage = [];
            if (!farmerExists) notFoundMessage.push('Farmer');
            if (!farmExists) notFoundMessage.push('Farm');
            if (!animalExists) notFoundMessage.push('Animal');
            console.error(`ERROR: ${notFoundMessage.join(', ')} not found.`);
            return res.status(404).json({ message: `${notFoundMessage.join(', ')} not found.` });
        }

        const veterinaryUser = await User.findById(veterinaryId).select('division_id').lean();
        const farmerUser = await User.findById(farmer_id).select('division_id').lean();

        console.log(`DEBUG: VS Division ID: ${veterinaryUser?.division_id}, Farmer Division ID: ${farmerUser?.division_id}`);

        if (veterinaryUser && farmerUser && veterinaryUser.division_id && farmerUser.division_id) {
            const farmerGNDivision = await AdministrativeDivision.findById(farmerUser.division_id);
            console.log(`DEBUG: Farmer GN Division: ${farmerGNDivision?.division_name}, Type: ${farmerGNDivision?.division_type}`);

            const veterinaryDivision = await AdministrativeDivision.findById(veterinaryUser.division_id);
            console.log(`DEBUG: VS Division: ${veterinaryDivision?.division_name}, Type: ${veterinaryDivision?.division_type}`);

            if (veterinaryDivision && farmerGNDivision && veterinaryDivision.division_type === 'VS' && farmerGNDivision.parent_division_id.toString() !== veterinaryUser.division_id.toString()) {
                console.warn('WARNING: Farmer is outside the VS\'s direct administrative division (LDI).');
            } else if (veterinaryDivision && farmerGNDivision && veterinaryDivision.division_type !== 'VS') {
                console.warn('WARNING: VS division type is not "VS", skipping direct division check.');
            }
        } else {
            console.warn('WARNING: Could not perform division check due to missing user or division IDs.');
        }

        const newAppointment = new Appointment({
            animal_tag,
            farmer_id,
            farm_id,
            date: new Date(date),
            hour,
            minute,
            procedure,
            notes,
            status_flag,
            veterinary_id: veterinaryId
        });
        console.log('DEBUG: New appointment object created:', newAppointment);

        const savedAppointment = await newAppointment.save();
        console.log('DEBUG: Appointment saved successfully. ID:', savedAppointment._id);

        const populatedAppointment = await Appointment.findById(savedAppointment._id)
            .populate('farmer_id', 'full_name')
            .populate('farm_id', 'farm_name')
            .lean();
        console.log('DEBUG: Populated appointment:', populatedAppointment);

        let animalName = populatedAppointment.animal_tag;

        const animalForDisplay = await Animal.findOne({ animal_tag: populatedAppointment.animal_tag, farm_id: populatedAppointment.farm_id._id });
        if (animalForDisplay) {
            animalName = `${animalForDisplay.animal_type} (${animalForDisplay.animal_tag})`;
        }

        const responsePayload = {
            ...populatedAppointment,
            animalName: animalName,
            farmerName: populatedAppointment.farmer_id.full_name,
            farmName: populatedAppointment.farm_id.farm_name,
            time: `${String(populatedAppointment.hour).padStart(2, '0')}:${String(populatedAppointment.minute).padStart(2, '0')}`
        };
        console.log('DEBUG: Sending successful createAppointment response:', responsePayload);
        res.status(201).json(responsePayload);

    } catch (error) {
        console.error('ERROR in createAppointment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    console.log('DEBUG: Entering updateAppointmentStatus controller.');
    const { id } = req.params;
    const { status } = req.body;
    const veterinaryId = getAuthenticatedVeterinaryId(req);

    console.log(`DEBUG: Updating appointment ID: ${id} to status: ${status} by VS ID: ${veterinaryId}`);

    try {
        const appointment = await Appointment.findOne({ _id: id, veterinary_id: veterinaryId });

        if (!appointment) {
            console.error(`ERROR: Appointment ID ${id} not found or not authorized for VS ID ${veterinaryId}.`);
            return res.status(404).json({ message: 'Appointment not found or you are not authorized to update it.' });
        }

        appointment.status_flag = status;
        await appointment.save();
        console.log(`DEBUG: Appointment ID ${id} status updated to ${status}.`);

        res.status(200).json({ message: 'Appointment status updated successfully', appointment });
        console.log('DEBUG: updateAppointmentStatus controller finished successfully.');
    } catch (error) {
        console.error('ERROR in updateAppointmentStatus:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateAppointment = async (req, res) => {
    console.log('DEBUG: Entering updateAppointment controller.');
    const { id } = req.params;
    const { animal_tag, farmer_id, farm_id, date, hour, minute, procedure, notes, status_flag } = req.body;
    const veterinaryId = getAuthenticatedVeterinaryId(req);

    console.log('DEBUG: Received update data:', { animal_tag, farmer_id, farm_id, date, hour, minute, procedure, notes, status_flag });
    console.log('DEBUG: Authenticated VS ID for update:', veterinaryId);

    if (!animal_tag || !farmer_id || !farm_id || !date || hour === undefined || minute === undefined || !procedure || !veterinaryId || !status_flag) {
        console.error('ERROR: Missing required fields for appointment update.');
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    try {
        const appointment = await Appointment.findOne({ _id: id, veterinary_id: veterinaryId });

        if (!appointment) {
            console.error(`ERROR: Appointment ID ${id} not found or not authorized for VS ID ${veterinaryId}.`);
            return res.status(404).json({ message: 'Appointment not found or you are not authorized to update it.' });
        }

        const farmerExists = await User.findById(farmer_id);
        const farmExists = await Farm.findById(farm_id);

        const match = animal_tag.match(/^(.+?)\s+\((.+)\)$/);
        let animalType = null;
        let animalId = null;
        if (match) {
            animalType = match[1];
            animalId = match[2];
        }

        const animalExists = await Animal.findOne({ animal_tag: animalId, farm_id: farm_id });

        if (!farmerExists || !farmExists || !animalExists) {
            let notFoundMessage = [];
            if (!farmerExists) notFoundMessage.push('Farmer');
            if (!farmExists) notFoundMessage.push('Farm');
            if (!animalExists) notFoundMessage.push('Animal');
            console.error(`ERROR: ${notFoundMessage.join(', ')} not found.`);
            return res.status(404).json({ message: `${notFoundMessage.join(', ')} not found.` });
        }

        appointment.animal_tag = animal_tag;
        appointment.farmer_id = farmer_id;
        appointment.farm_id = farm_id;
        appointment.date = new Date(date);
        appointment.hour = hour;
        appointment.minute = minute;
        appointment.procedure = procedure;
        appointment.notes = notes;
        appointment.status_flag = status_flag;

        await appointment.save();
        console.log(`DEBUG: Appointment ID ${id} updated successfully.`);

        const populatedAppointment = await Appointment.findById(id)
            .populate('farmer_id', 'full_name')
            .populate('farm_id', 'farm_name')
            .lean();

        let animalName = populatedAppointment.animal_tag;

        const animalForDisplay = await Animal.findOne({ animal_tag: populatedAppointment.animal_tag, farm_id: populatedAppointment.farm_id._id });
        if (animalForDisplay) {
            animalName = `${animalForDisplay.animal_type} (${animalForDisplay.animal_tag})`;
        }

        const responsePayload = {
            ...populatedAppointment,
            animalName: animalName,
            farmerName: populatedAppointment.farmer_id.full_name,
            farmName: populatedAppointment.farm_id.farm_name,
            time: `${String(populatedAppointment.hour).padStart(2, '0')}:${String(populatedAppointment.minute).padStart(2, '0')}`
        };

        res.status(200).json(responsePayload);

    } catch (error) {
        console.error('ERROR in updateAppointment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAppointment = async (req, res) => {
    console.log('DEBUG: Entering deleteAppointment controller.');
    const { id } = req.params;
    const veterinaryId = getAuthenticatedVeterinaryId(req);

    console.log('Deleting appointment with ID:', id);

    try {
        console.log(`DEBUG: Authenticated VS ID for deletion: ${veterinaryId}`);
        console.log(`DEBUG: Attempting to find appointment with ID: ${id} for VS ID: ${veterinaryId}`);

        const appointment = await Appointment.findOne({ _id: id, veterinary_id: veterinaryId });

        if (!appointment) {
            console.error(`ERROR: Appointment ID ${id} not found or not authorized for VS ID ${veterinaryId}.`);
            return res.status(404).json({ message: 'Appointment not found or you are not authorized to delete it.' });
        }

        try {
            await Appointment.deleteOne({ _id: id, veterinary_id: veterinaryId });
            console.log(`DEBUG: Appointment ID ${id} deleted successfully.`);
        } catch (removeError) {
            console.error(`ERROR removing appointment ID ${id}:`, removeError);
            console.error('Stack trace:', removeError.stack);
            return res.status(500).json({ message: 'Error deleting appointment', error: removeError.message, stack: removeError.stack });
        }

        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('ERROR in deleteAppointment:', error);
        res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
};

exports.getFarmersAndFarmsForAppointment = async (req, res) => {
    console.log('DEBUG: Entering getFarmersAndFarmsForAppointment controller.');
    try {
        const authenticatedUserId = getAuthenticatedVeterinaryId(req);
        if (!authenticatedUserId) {
            console.error('ERROR: No authenticated user ID found for getFarmersAndFarmsForAppointment.');
            return res.status(401).json({ message: "Unauthorized: User not authenticated or ID missing." });
        }
        console.log(`DEBUG: Authenticated VS ID: ${authenticatedUserId}`);

        const veterinaryUser = await User.findById(authenticatedUserId).select('division_id role_id').populate('role_id', 'role_name').lean();
        if (!veterinaryUser || !veterinaryUser.division_id || veterinaryUser.role_id?.role_name !== 'Veterinary Surgeon') {
            console.error('ERROR: Unauthorized or not a veterinary user trying to get farmers and farms.');
            return res.status(403).json({ message: 'Unauthorized or not a veterinary user.' });
        }
        console.log(`DEBUG: VS role: ${veterinaryUser.role_id.role_name}, Division ID: ${veterinaryUser.division_id}`);

        const farmerRole = await UserRole.findOne({ role_name: 'Farmer' });
        if (!farmerRole) {
            console.error('ERROR: Farmer role not found in the system.');
            return res.status(500).json({ message: 'Farmer role not found in the system.' });
        }
        const farmerRoleId = farmerRole._id;
        console.log(`DEBUG: Farmer Role ID: ${farmerRoleId}`);

        const vsAdministrativeDivision = await AdministrativeDivision.findById(veterinaryUser.division_id).lean();
        if (!vsAdministrativeDivision) {
            console.error('ERROR: VS administrative division not found.');
            return res.status(500).json({ message: 'VS administrative division not found.' });
        }
        console.log(`DEBUG: VS Administrative Division Type: ${vsAdministrativeDivision.division_type}`);


        let farmerDivisionIds = [];
        if (vsAdministrativeDivision.division_type === 'VS') {
            // First get LDI divisions under VS
            const ldiDivisions = await AdministrativeDivision.find({
                parent_division_id: veterinaryUser.division_id,
                division_type: { $in: ['LDI', 'ldi_officer'] }
            }).select('_id').lean();

            const ldiDivisionIds = ldiDivisions.map(div => div._id);

            // Then get GN divisions under those LDI divisions
            const childGNDivisions = await AdministrativeDivision.find({
                parent_division_id: { $in: ldiDivisionIds },
                division_type: 'GN'
            }).select('_id').lean();
            farmerDivisionIds = childGNDivisions.map(div => div._id);
            console.log(`DEBUG: Found ${farmerDivisionIds.length} GN divisions under LDI divisions for VS.`);
        } else if (vsAdministrativeDivision.division_type === 'GN') {
            farmerDivisionIds = [vsAdministrativeDivision._id];
            console.log(`DEBUG: VS is directly in a GN division. Using its own GN division ID.`);
        } else {
            console.warn('WARNING: VS division type is not "VS" or "GN". Cannot determine relevant farmer divisions.');
            return res.status(200).json([]);
        }


        if (farmerDivisionIds.length === 0) {
            console.log('DEBUG: No relevant GN divisions found for this VS. Returning empty farmer list.');
            return res.status(200).json([]);
        }

        const farmers = await User.find({
            role_id: farmerRoleId,
            division_id: { $in: farmerDivisionIds }
        }).select('_id full_name').lean();
        console.log(`DEBUG: Found ${farmers.length} farmers in relevant divisions.`);

        const farmersWithFarms = await Promise.all(farmers.map(async (farmer) => {
            const farms = await Farm.find({ registered_by: farmer._id })
                .select('_id farm_name')
                .lean();
            console.log(`DEBUG: Farmer ${farmer.full_name} (ID: ${farmer._id}) has ${farms.length} farms.`);
            return {
                _id: farmer._id,
                full_name: farmer.full_name,
                farms: farms
            };
        }));

        res.status(200).json(farmersWithFarms);
        console.log('DEBUG: getFarmersAndFarmsForAppointment controller finished successfully.');
    } catch (error) {
        console.error('ERROR in getFarmersAndFarmsForAppointment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get animals by Farm ID
exports.getAnimalsByFarmId = async (req, res) => {
    try {
        const { farmId } = req.params;
        console.log('getAnimalsByFarmId called with farmId:', farmId);

        if (!farmId) {
            console.log('No farmId provided');
            return res.status(400).json({ message: 'Farm ID is required' });
        }

        const animals = await Animal.find({ farm_id: farmId })
            .populate('animal_type', 'type_name')
            .populate('farm_id', 'farm_name')
            .lean();

        console.log(`Animals found for farm ${farmId}:`, animals.length);
        res.status(200).json(animals);
    } catch (error) {
        console.error('ERROR in getAnimalsByFarmId:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getFarmersByVeterinaryDivision = async (req, res) => {
    console.log('DEBUG: Entering getFarmersByVeterinaryDivision controller.');
    try {
        const veterinaryId = getAuthenticatedVeterinaryId(req);
        if (!veterinaryId) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated or ID missing." });
        }
        console.log(`DEBUG: Fetching farmers for VS ID: ${veterinaryId}'s division.`);

        const veterinaryUser = await User.findById(veterinaryId).select('role_id division_id').populate('role_id', 'role_name').lean();

        if (!veterinaryUser || veterinaryUser.role_id?.role_name !== 'veterinarian') {
            console.error('ERROR: Unauthorized or not a veterinary user trying to get farmers by division.');
            return res.status(403).json({ message: 'Unauthorized or not a veterinary user.' });
        }
        console.log(`DEBUG: VS role: ${veterinaryUser.role_id.role_name}, Division ID: ${veterinaryUser.division_id}`);

        const farmerRole = await UserRole.findOne({ role_name: 'Farmer' });
        if (!farmerRole) {
            console.error('ERROR: Farmer role not found.');
            return res.status(500).json({ message: 'Farmer role not found in the system.' });
        }
        const farmerRoleId = farmerRole._id;

        const vsAdministrativeDivision = await AdministrativeDivision.findById(veterinaryUser.division_id).lean();
        if (!vsAdministrativeDivision) {
            console.error('ERROR: VS administrative division not found.');
            return res.status(500).json({ message: 'VS administrative division not found.' });
        }

        let farmerDivisionIds = [];

        if (vsAdministrativeDivision.division_type === 'VS') {
            // First get LDI divisions under VS
            const ldiDivisions = await AdministrativeDivision.find({
                parent_division_id: veterinaryUser.division_id,
                division_type: { $in: ['LDI', 'ldi_officer'] }
            }).select('_id').lean();

            const ldiDivisionIds = ldiDivisions.map(div => div._id);

            // Then get GN divisions under those LDI divisions
            const childGNDivisions = await AdministrativeDivision.find({
                parent_division_id: { $in: ldiDivisionIds },
                division_type: 'GN'
            }).select('_id').lean();
            farmerDivisionIds = childGNDivisions.map(div => div._id);
        } else if (vsAdministrativeDivision.division_type === 'GN') {
            farmerDivisionIds = [vsAdministrativeDivision._id];
        } else {
            console.warn('WARNING: VS division type is not "VS" or "GN". Returning empty farmer list.');
            return res.status(200).json([]);
        }

        const farmers = await User.find({
            role_id: farmerRoleId,
            division_id: { $in: farmerDivisionIds }
        }).select('_id full_name email').lean();
        console.log(`DEBUG: Found ${farmers.length} farmers in VS's child GN divisions.`);
        res.status(200).json(farmers);
        console.log('DEBUG: getFarmersByVeterinaryDivision controller finished successfully.');
    } catch (error) {
        console.error('ERROR in getFarmersByVeterinaryDivision:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get farms by Farmer ID
exports.getFarmsByFarmerId = async (req, res) => {
    try {
        const userId = req.params.farmerId; // This is user_id, not farmer._id
        console.log('getFarmsByFarmerId called with userId:', userId);

        if (!userId) {
            console.log('No farmer userId provided');
            return res.status(400).json({ message: 'Farmer user ID is required' });
        }

        // Find farmer document by user_id
        const farmer = await Farmer.findOne({ user_id: userId }).select('_id').lean();
        if (!farmer) {
            console.log(`No farmer found for user_id: ${userId}`);
            return res.status(404).json({ message: 'Farmer not found for given user ID' });
        }

        // Query farms by farmer._id
        const farms = await Farm.find({ farmer_id: farmer._id }, '_id farm_name location_address').lean();
        console.log(`Farms found for farmer._id ${farmer._id}:`, farms);

        res.status(200).json(farms);
        console.log('DEBUG: getFarmsByFarmerId controller finished successfully.');
    } catch (error) {
        console.error('ERROR in getFarmsByFarmerId:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
