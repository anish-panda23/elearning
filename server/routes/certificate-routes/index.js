const express = require("express");
const {
  generateCertificate,
  getUserCertificates,
  verifyCertificate,
  getCourseCertificate,
} = require("../../controllers/certificate-controller/index");

const router = express.Router();

router.post("/generate", generateCertificate);
router.get("/user/:userId", getUserCertificates);
router.get("/verify/:certificateId", verifyCertificate);
router.get("/course/:userId/:courseId", getCourseCertificate);

module.exports = router;
