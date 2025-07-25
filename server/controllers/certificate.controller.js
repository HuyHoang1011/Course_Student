const Certificate = require('../models/certificate.model');

exports.getMyCertificates = async (req, res) => {
  const certs = await Certificate.find({ studentId: req.user.id }).populate('courseId', 'title');
  res.json(certs);
};

exports.issueCertificate = async (req, res) => {
  const { courseId, studentId } = req.body;

  const exists = await Certificate.findOne({ studentId, courseId });
  if (exists) return res.status(400).json({ message: 'Đã cấp chứng chỉ' });

  const cert = await Certificate.create({ studentId, courseId });
  res.status(201).json(cert);
};
