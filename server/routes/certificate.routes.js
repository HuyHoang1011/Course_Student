const express = require('express');
const router = express.Router();
const Certificate = require('../models/certificate.model');
const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');
const { 
  getMyCertificates, 
  issueCertificate, 
  issueCertificateForCompletedCourse, 
  getCertificateById,
  getAllCertificates 
} = require('../controllers/certificate.controller');

router.get('/', verifyToken, authorizeRole('student'), getMyCertificates);
router.get('/all', verifyToken, authorizeRole('admin'), getAllCertificates);
router.post('/issue', verifyToken, authorizeRole('instructor', 'admin'), issueCertificate);
router.post('/issue-completed', verifyToken, authorizeRole('instructor', 'admin'), issueCertificateForCompletedCourse);
router.delete('/:id', verifyToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByIdAndDelete(id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json({ message: 'Certificate revoked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});
router.get('/:id', verifyToken, authorizeRole('student'), getCertificateById);

module.exports = router;


