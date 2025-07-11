const express = require('express');
const mongoose = require('mongoose');
const PatientRecord = require('./models/MedicalRecord'); // Replace with your actual model path
const router = express.Router();

// Fetch records for a specific patient based on their ID
// In your backend routes
router.get('/api/medical-records/patient/:patientId', async (req, res) => {
    try {
      const { patientId } = req.params;
      const records = await MedicalRecord.find({ userId: patientId });
      res.json(records);
    } catch (error) {
      console.error('Error fetching patient records:', error);
      res.status(500).json({ error: 'Failed to fetch records' });
    }
  });

module.exports = router;
