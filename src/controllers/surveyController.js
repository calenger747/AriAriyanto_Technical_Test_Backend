const { client_mysql, ConnectDBMySQL } = require('../configs/database.config.js');
const { addHistoryLeads, updateLeadStatusHelper, addHistorySurvey } = require('../helpers/leadsHelpers.js');

// Insert lead function
exports.insertSurveyRequest = async (req, res) => {
    const { leadId, address, clientName, surveyDate } = req.body;

    try {
        const array_status_can = ['Follow Up']

        // Dapatkan status saat ini dari lead
        const [lead] = await client_mysql.query('SELECT status, name, email, phone FROM leads WHERE id = ?', [leadId]);

        if (!lead.length) {
            res.status(404).json({ error: `lead with id: ${leadId} was not found` });
        }

        const currentStatus = lead[0].status;

        // check status based on array_status_can
        if (!array_status_can.includes(currentStatus)) {
            throw new Error(`Status ${currentStatus} tidak diizinkan untuk diupdate.`);
        }

        // Check if there is already a survey request with status "Survey Requested"
        const [existingSurvey] = await client_mysql.query(
            'SELECT * FROM survey_requests WHERE lead_id = ? AND status = ?',
            [leadId, 'Survey Requested']
        );

        if (existingSurvey.length > 0) {
            return res.status(400).json({ error: 'Survey request already exists for this lead.' });
        }

        // Insert survey request into database
        const [insertSurveyRequest] = await client_mysql.query(
            'INSERT INTO survey_requests (lead_id, address, client_name, survey_date, status) VALUES (?, ?, ?, ?, ?)',
            [leadId, address, clientName, surveyDate, 'Survey Requested']
        );

        await addHistorySurvey({ surveyId: insertSurveyRequest.insertId, surveyStatus: 'Survey Requested', surveyComment: 'Survey created' })

        await updateLeadStatusHelper(leadId, 'Survey Request')

        // Prepare leads data for history
        const leadsData = {
            leadId: leadId,
            leadStatus: 'Survey Request',
            leadComment: 'Survey Request created'
        };

        // Add lead history
        await addHistoryLeads(leadsData);

        res.status(201).json({ message: 'Survey Request created successfully', surveyId: insertSurveyRequest.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error creating Survey Request: ' + error.message });
    }
};

exports.updateSurveyStatus = async (req, res) => {
    const { surveyId } = req.params;
    const { status, comment, images, notes } = req.body;

    try {
        // Validasi status survey yang diizinkan
        if (status !== 'Survey Approved' && status !== 'Survey Rejected' && status !== 'Survey Completed') {
            return res.status(400).json({ error: 'Invalid status provided' });
        }

        // Ambil lead_id terkait survey tersebut
        const [surveyResult] = await client_mysql.query('SELECT lead_id, status FROM survey_requests WHERE id = ?', [surveyId]);
        if (surveyResult.length === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }

        const currentStatusSurvey = surveyResult[0].status;

        // Jika status sama dengan status saat ini, tidak perlu update
        if (currentStatusSurvey === status) {
            throw new Error(`Survey has status ${currentStatusSurvey}, cannot update same status`);
        }

        // Rules based on current status:
        if (currentStatusSurvey === 'Survey Rejected' && (status === 'Survey Approved' || status === 'Survey Completed' || status === 'Survey Request')) {
            return res.status(400).json({ error: 'Cannot update from Rejected to Approved, Completed, or Request.' });
        }

        if (currentStatusSurvey === 'Survey Approved' && status !== 'Survey Completed') {
            return res.status(400).json({ error: 'Approved surveys can only be updated to Completed.' });
        }

        if (currentStatusSurvey === 'Survey Request' && status === 'Survey Completed') {
            return res.status(400).json({ error: 'Cannot update from Request to Completed.' });
        }

        const leadId = surveyResult[0].lead_id;

        // Update status leads sesuai dengan status survey
        let leadStatus = '';
        if (status === 'Survey Approved') {
            leadStatus = 'Survey Approved by Operational';
        } else if (status === 'Survey Rejected') {
            leadStatus = 'Survey Rejected by Operational';
        } else if (status === 'Survey Completed') {
            leadStatus = 'Survey Completed';

            if (images.length < 1 || !notes) {
                return res.status(404).json({ error: 'Please input notes and upload image' });
            }
            // Handle saving multiple images if survey is approved
            if (images && images.length > 0) {
                for (const image of images) {
                    // Insert each image into the survey_images table
                    await client_mysql.query(
                        'INSERT INTO survey_image (survey_id, images) VALUES (?, ?)',
                        [surveyId, image] // Assuming images are base64-encoded
                    );
                }
            }

            // Optionally update notes for the survey
            if (notes) {
                await client_mysql.query('UPDATE survey_requests SET notes = ? WHERE id = ?', [notes, surveyId]);
            }
        }

        // Update status survey
        await client_mysql.query('UPDATE survey_requests SET status = ? WHERE id = ?', [status, surveyId]);

        // Update status di tabel leads
        await updateLeadStatusHelper(leadId, leadStatus);

        // Tambahkan riwayat status survey di survey_history
        await addHistorySurvey({ surveyId: surveyId, surveyStatus: status, surveyComment: comment || 'No comments' })


        res.status(200).json({ message: `Survey status updated to ${status}, and lead status updated to ${leadStatus}` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error updating Survey Request: ' + error.message });
    }
};