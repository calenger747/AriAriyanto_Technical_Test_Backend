const express = require('express');
const router = express.Router();
const leadsRoutes = require('./leads');
const authRoutes = require('./auth');
const surveyController = require('../controllers/surveyController');
// Import the middleware
const { authorize } = require('../middleware/authorizeUser');

// Use routes
router.use('/auth', authRoutes);
router.use('/leads', leadsRoutes);

// Survey
router.post('/survey-request', authorize(['Salesperson', 'Super Admin']), surveyController.insertSurveyRequest);
router.put('/survey/:surveyId/status', authorize(['Operational', 'Super Admin']), surveyController.updateSurveyStatus)

router.get("/test", (req, res, next) => {
    res.json({
        status: "success",
    });
});

module.exports = router;