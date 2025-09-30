// Mock data for the Veterinary Surgeon UI
// Area statistics
export const areaStats = {
  activeFarms: 87,
  totalCattle: 1340,
  avgProduction: 18.5,
  // liters per day
  ldiCount: 4,
  activeProjects: 3
};
// Animals data
export const animals = [{
  id: "A001",
  name: "Bella",
  species: "Dairy Cow",
  breed: "Holstein",
  age: 3,
  farm: "Green Pastures Farm",
  owner: "John Smith",
  status: "Healthy",
  photo: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGFpcnklMjBjb3d8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
}, {
  id: "A002",
  name: "Max",
  species: "Dairy Cow",
  breed: "Jersey",
  age: 4,
  farm: "Sunny Meadows",
  owner: "Sarah Johnson",
  status: "Under Treatment",
  photo: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGFpcnklMjBjb3d8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
}, {
  id: "A003",
  name: "Daisy",
  species: "Dairy Cow",
  breed: "Holstein",
  age: 5,
  farm: "Green Pastures Farm",
  owner: "John Smith",
  status: "Healthy",
  photo: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGFpcnklMjBjb3d8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
}, {
  id: "A004",
  name: "Charlie",
  species: "Buffalo",
  breed: "Water Buffalo",
  age: 6,
  farm: "Valley View Ranch",
  owner: "Michael Brown",
  status: "Healthy",
  photo: "https://images.unsplash.com/photo-1583953578277-5bbfe5c47aac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2F0ZXIlMjBidWZmYWxvfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
}, {
  id: "A005",
  name: "Luna",
  species: "Dairy Cow",
  breed: "Ayrshire",
  age: 2,
  farm: "Sunny Meadows",
  owner: "Sarah Johnson",
  status: "Under Treatment",
  photo: "https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZGFpcnklMjBjb3d8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
}];
// Detailed animal data
export const animalDetails = {
  "A001": {
    id: "A001",
    name: "Bella",
    species: "Dairy Cow",
    breed: "Holstein",
    age: 3,
    farm: "Green Pastures Farm",
    owner: "John Smith",
    contact: "+94 77 123 4567",
    status: "Healthy",
    photo: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGFpcnklMjBjb3d8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    vitals: {
      weight: "550 kg",
      temperature: "38.5°C",
      heartRate: "65 bpm"
    },
    medicalHistory: [{
      date: "2023-10-15",
      procedure: "Routine Check-up",
      notes: "All vitals normal"
    }, {
      date: "2023-08-20",
      procedure: "Vaccination",
      notes: "FMD vaccination completed"
    }, {
      date: "2023-05-10",
      procedure: "Treatment",
      notes: "Treated for minor skin infection"
    }],
    prescriptions: [{
      medication: "Vitamin B Complex",
      dosage: "10ml",
      frequency: "Once daily",
      startDate: "2023-10-15",
      endDate: "2023-10-25"
    }],
    labReports: [{
      name: "Blood Test",
      date: "2023-10-15",
      status: "Approved"
    }, {
      name: "Milk Analysis",
      date: "2023-10-10",
      status: "Approved"
    }, {
      name: "Parasite Screening",
      date: "2023-10-05",
      status: "Pending"
    }]
  },
  "A002": {
    id: "A002",
    name: "Max",
    species: "Dairy Cow",
    breed: "Jersey",
    age: 4,
    farm: "Sunny Meadows",
    owner: "Sarah Johnson",
    contact: "+94 77 987 6543",
    status: "Under Treatment",
    photo: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGFpcnklMjBjb3d8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
    vitals: {
      weight: "480 kg",
      temperature: "39.2°C",
      heartRate: "72 bpm"
    },
    medicalHistory: [{
      date: "2023-10-18",
      procedure: "Emergency Visit",
      notes: "Suspected mastitis"
    }, {
      date: "2023-09-05",
      procedure: "Routine Check-up",
      notes: "All vitals normal"
    }, {
      date: "2023-07-22",
      procedure: "Vaccination",
      notes: "HS vaccination completed"
    }],
    prescriptions: [{
      medication: "Antibiotics",
      dosage: "15ml",
      frequency: "Twice daily",
      startDate: "2023-10-18",
      endDate: "2023-10-28"
    }, {
      medication: "Anti-inflammatory",
      dosage: "10ml",
      frequency: "Once daily",
      startDate: "2023-10-18",
      endDate: "2023-10-23"
    }],
    labReports: [{
      name: "Milk Culture",
      date: "2023-10-18",
      status: "Pending"
    }, {
      name: "Blood Test",
      date: "2023-10-18",
      status: "Pending"
    }, {
      name: "General Health Screening",
      date: "2023-09-05",
      status: "Approved"
    }]
  }
};
// Appointments
export const appointments = [{
  id: 1,
  time: "09:00",
  animalId: "A001",
  animalName: "Bella",
  farm: "Green Pastures Farm",
  procedure: "Routine Check-up",
  status: "Scheduled",
  date: "2023-10-30"
}, {
  id: 2,
  time: "10:30",
  animalId: "A002",
  animalName: "Max",
  farm: "Sunny Meadows",
  procedure: "Follow-up Treatment",
  status: "Scheduled",
  date: "2023-10-30"
}, {
  id: 3,
  time: "13:00",
  animalId: "A003",
  animalName: "Daisy",
  farm: "Green Pastures Farm",
  procedure: "Vaccination",
  status: "Scheduled",
  date: "2023-10-30"
}, {
  id: 4,
  time: "15:00",
  animalId: "A005",
  animalName: "Luna",
  farm: "Sunny Meadows",
  procedure: "Follow-up Treatment",
  status: "Scheduled",
  date: "2023-10-31"
}, {
  id: 5,
  time: "09:30",
  animalId: "A004",
  animalName: "Charlie",
  farm: "Valley View Ranch",
  procedure: "Routine Check-up",
  status: "Scheduled",
  date: "2023-11-01"
}];
// Pending validations
export const pendingValidations = [{
  id: 1,
  type: "Lab Result",
  animalId: "A002",
  animalName: "Max",
  date: "2023-10-18"
}, {
  id: 2,
  type: "Vaccine Approval",
  animalId: "A003",
  animalName: "Daisy",
  date: "2023-10-25"
}, {
  id: 3,
  type: "Lab Result",
  animalId: "A005",
  animalName: "Luna",
  date: "2023-10-20"
}];
// User profile
export const userProfile = {
  name: "Dr. Sarah Smith",
  email: "sarah.smith@daphvet.lk",
  contact: "+94 77 123 4567",
  designation: "Veterinary Surgeon",
  area: "Central Province",
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    appointmentReminders: true,
    criticalAlerts: true
  }
};

export const affectedAnimals = [
  { id: 'aff1', animalName: 'Lucky', animalId: 'C-005', farm: 'Riverbend Ranch', condition: 'Foot-and-mouth disease', status: 'Critical', dateReported: '2025-07-10' },
  { id: 'aff2', animalName: 'Ginger', animalId: 'C-006', farm: 'Willow Creek Dairy', condition: 'Mastitis', status: 'Stable', dateReported: '2025-07-12' },
  { id: 'aff3', animalName: 'Rusty', animalId: 'S-011', farm: 'Maple Hill Farm', condition: 'Swine Flu', status: 'Critical', dateReported: '2025-07-14' },
];

export const recoveringAnimals = [
  { id: 'rec1', animalName: 'Fluffy', animalId: 'C-007', farm: 'Green Valley Farm', condition: 'Pneumonia', recoveryStage: 'Mid-recovery', dateStarted: '2025-07-01' },
  { id: 'rec2', animalName: 'Shadow', animalId: 'D-006', farm: 'Sunny Meadows', condition: 'Fractured Leg', recoveryStage: 'Rehabilitation', dateStarted: '2025-06-20' },
];