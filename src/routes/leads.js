const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leadsController');
// Import the middleware
const { authorize } = require('../middleware/authorizeUser');

// Route to insert new lead
router.post('/insert-lead', authorize(['Customer Service', 'Super Admin']), leadsController.insertLead);
// Route to update the salesperson of a lead
router.put('/:leadId/updateSalesperson', authorize(['Salesperson', 'Super Admin']), leadsController.updateSalesperson);
// Route to follow up lead
router.put('/:leadId/accept-lead', authorize(['Salesperson', 'Super Admin']), leadsController.acceptLead);
// Route to create final proposal
router.post('/:leadId/final-proposal', authorize(['Salesperson', 'Super Admin']), leadsController.finalProposal);
// Route to deal proposal with client
router.post('/:leadId/deal', authorize(['Salesperson', 'Super Admin']), leadsController.dealFinalProposal);

// Get All Leads
router.get('/list', authorize(['Salesperson', 'Super Admin', 'Client']), leadsController.getLeadsWithSurveyDetails);
router.get('/view/:leadId', authorize(['Salesperson', 'Super Admin', 'Client']), leadsController.getLeadsWithSurveyDetails);

module.exports = router;