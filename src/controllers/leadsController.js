const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const { client_mysql, ConnectDBMySQL } = require('../configs/database.config.js');
const { getAvailableSalesperson, addHistoryLeads, generateRandomPassword } = require('../helpers/leadsHelpers.js');

// Insert lead function
exports.insertLead = async (req, res) => {
    const { name, phone, email, type } = req.body.leadData;

    try {
        // Get available salesperson
        const nextSalespersonId = await getAvailableSalesperson(type);

        // Insert the new lead into MySQL
        const [insertData] = await client_mysql.query(
            'INSERT INTO leads (name, phone, email, salesperson_id, type, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, phone, email, nextSalespersonId, type, 'Leads Baru']
        );

        // Extract the newly inserted lead's ID
        const leadId = insertData.insertId;

        // Prepare leads data for history
        const leadsData = {
            leadId: leadId,
            leadStatus: 'Leads Baru',
            leadComment: 'New Leads Created'
        };

        // Add lead history
        await addHistoryLeads(leadsData);

        res.status(201).json({ message: 'Lead created and assigned to salesperson', nextSalespersonId });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error creating lead: ' + error.message });
    }
};

exports.updateSalesperson = async (req, res) => {
    const leadId = req.params.leadId;  // Get lead ID from URL
    const { salespersonId } = req.body;  // Get new salesperson ID from request body
    try {
        // Leads Data
        const [lead_data] = await client_mysql.query('SELECT id FROM leads WHERE id = ?', [leadId]);

        if (lead_data.length === 0) {
            return res.status(404).json({ error: `lead with id: ${leadId} was not found` });
        }

        // Check if the new salesperson exists
        const [salespersonResult] = await client_mysql.query('SELECT id FROM users WHERE id = ? AND role = "Salesperson"', [salespersonId]);
        if (salespersonResult.length === 0) {
            return res.status(404).json({ error: 'Salesperson not found' });
        }

        // Update the lead with the new salesperson
        const updateQuery = 'UPDATE leads SET salesperson_id = ? WHERE id = ?';
        await client_mysql.query(updateQuery, [salespersonId, leadId]);

        res.status(200).json({ message: 'Salesperson updated successfully', leadId, salespersonId });
    } catch (error) {
        console.error('Error updating salesperson:', error);
        res.status(500).json({ error: 'Error updating salesperson: ' + error.message });
    }
};

// Function to update the lead status to "Follow Up"
exports.acceptLead = async (req, res) => {
    const { leadId } = req.params;
    const { comment, accept_lead } = req.body;

    try {
        if (accept_lead) {
            const array_status_can = ['Leads Baru', 'Survey Rejected by Operational']
            // Dapatkan status saat ini dari lead
            const [lead] = await client_mysql.query('SELECT status, name, email, phone FROM leads WHERE id = ?', [leadId]);

            if (!lead.length) {
                res.status(404).json({ error: `lead with id: ${leadId} was not found` });
            }

            const currentStatus = lead[0].status;

            // Jika status sama dengan status saat ini, tidak perlu update
            if (currentStatus === 'Follow Up') {
                throw new Error(`Lead sudah memiliki status Follow Up`);
            }

            // Cek apakah status baru ada di array_status_can
            if (!array_status_can.includes(currentStatus)) {
                throw new Error(`Status ${currentStatus} tidak diizinkan untuk diupdate.`);
            }

            // Update status ke Follow Up
            await client_mysql.query('UPDATE leads SET status = ? WHERE id = ?', ['Follow Up', leadId]);

            // Tambahkan ke riwayat
            await addHistoryLeads({ leadId: leadId, leadStatus: 'Follow Up', leadComment: comment || 'Follow Up dilakukan.' });

            res.status(200).json({ message: 'Follow Up successfully' });
        } else {
            // Dapatkan status saat ini dari lead
            const [lead] = await client_mysql.query('SELECT status, name, email, phone, salesperson_id, type FROM leads WHERE id = ?', [leadId]);

            if (!lead.length) {
                res.status(404).json({ error: `lead with id: ${leadId} was not found` });
            }
            // Get the current date
            const currentDate = new Date();

            // Calculate the punishment end date (7 days from current date)
            const endDate = new Date(currentDate);
            endDate.setDate(currentDate.getDate() + 7);

            // Update the users table with punishment start and end date
            await client_mysql.query(
                'UPDATE users SET punishment_start = ?, punishment_end = ? WHERE id = ?',
                [currentDate, endDate, lead[0].salesperson_id]  // Assuming salespersonId is available
            );

            // Change new salesperson for this lead
            const nextSalespersonId = await getAvailableSalesperson(lead[0].type);
            await client_mysql.query(
                'UPDATE leads SET salesperson_id = ? WHERE id = ?',
                [nextSalespersonId, leadId]  // Assuming salespersonId is available
            );

            res.status(200).json({
                message: `You have been penalized for 7 days because not accept this lead. Penalty starts now and will end on ${endDate.toISOString().split('T')[0]}.`
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to follow up lead: ' + error.message });
    }
};

exports.finalProposal = async (req, res) => {
    const { leadId } = req.params;
    const { proposalDetails, comment } = req.body;

    try {
        // Fetch the current lead and its status
        const [lead] = await client_mysql.query('SELECT status FROM leads WHERE id = ?', [leadId]);

        if (!lead.length) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const currentStatus = lead[0].status;

        // Only allow creating final proposal if the lead's status is 'Survey Completed'
        if (currentStatus !== 'Survey Completed') {
            return res.status(400).json({ error: `Cannot create final proposal, current status is ${currentStatus}, not 'Survey Completed'` });
        }

        // Insert the final proposal data into a new table (optional)
        const insertProposal = await client_mysql.query(
            'INSERT INTO final_proposals (lead_id, details) VALUES (?, ?)',
            [leadId, proposalDetails]
        );

        // Update lead status to 'Follow Up (Final Proposal)'
        await client_mysql.query('UPDATE leads SET status = ? WHERE id = ?', ['Follow Up (Final Proposal)', leadId]);

        // Add a comment to the lead history
        const leadsData = {
            leadId: leadId,
            leadStatus: 'Follow Up (Final Proposal)',
            leadComment: comment || 'Final proposal created and status updated to Follow Up (Final Proposal)'
        };
        await addHistoryLeads(leadsData);

        // Return success response
        res.status(201).json({ message: 'Final proposal created and lead status updated to Follow Up (Final Proposal)', proposalId: insertProposal.insertId });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error creating final proposal: ' + error.message });
    }
};

exports.dealFinalProposal = async (req, res) => {
    const { leadId } = req.params;
    const { clientResponse } = req.body;

    try {
        // Dapatkan status saat ini dari lead
        const [lead] = await client_mysql.query('SELECT status, name, email, phone FROM leads WHERE id = ?', [leadId]);

        if (!lead.length) {
            throw new Error('Lead not found');
        }

        const currentStatus = lead[0].status;

        // Jika status sama dengan status saat ini, tidak perlu update
        if (currentStatus === 'Deal') {
            throw new Error(`Lead sudah memiliki status Deal`);
        }

        // Proses jika status adalah Final Proposal dan ada respons klien (yes/no)
        if (currentStatus === 'Follow Up (Final Proposal)') {

            if (!clientResponse) {
                return res.status(400).json({ error: 'Please fill client response with value yes/no' });
            }

            if (clientResponse === 'yes') {
                newStatus = 'Deal'; // Jika klien setuju, ubah status menjadi Deal
                // Update status lead
                await client_mysql.query('UPDATE leads SET status = ? WHERE id = ?', [newStatus, leadId]);

                // Tambahkan ke riwayat
                await addHistoryLeads({ leadId, leadStatus: newStatus, leadComment: `Status updated to ${newStatus}` });
            } else if (clientResponse === 'no') {
                newStatus = 'Follow Up (Final Proposal)'; // Jika klien setuju, ubah status menjadi Deal
                await addHistoryLeads({ leadId, leadStatus: newStatus, leadComment: `Final proposal tidak disetujui oleh Client` });
                return res.status(200).json({ message: "Silahkan di follow up kembali final proposalnya" });
            } else {
                return res.status(400).json({ error: 'Invalid client response provided' });
            }
        }

        // Jika status baru adalah Deal, buat akun klien
        if (newStatus === 'Deal') {
            const saltRounds = 10;
            // Generate a random password
            const randomPassword = await generateRandomPassword(8); // 12-character password

            // Hash the password before storing it
            const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

            const clientData = {
                name: lead[0].name,
                email: lead[0].email,
            };
            const [insertClient] = await client_mysql.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [clientData.name, clientData.email, hashedPassword, 'Client']);

            // Prepare email content
            const emailHtml = `
                <h1>Welcome to Our Platform</h1>
                <p>Hello ${clientData.name},</p>
                <p>Your new account has been successfully created. Below are your login details:</p>
                <ul>
                    <li><strong>Email:</strong> ${clientData.email}</li>
                    <li><strong>Password:</strong> ${randomPassword}</li>
                </ul>
                <p>We recommend changing your password after logging in for the first time.</p>
                <p>Best regards,<br/>Support Team</p>
            `;

            // Configure nodemailer with your SMTP details
            const transporter = nodemailer.createTransport({
                host: `${process.env.SMTP_HOST}`,
                port: `${process.env.SMTP_PORT}`,
                secureConnection: false,
                auth: {
                    user: `${process.env.SMTP_USERNAME}`,
                    pass: `${process.env.SMTP_PASSWORD}`,
                },
                tls: {
                    ciphers: 'SSLv3'
                }
            });

            // Email options
            const mailOptions = {
                from: 'Support <support@mail.com>',
                to: lead[0].email,
                subject: 'New Account was successfully created',
                html: emailHtml,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.error(`Error sending email to ${lead[0].email}:`, error);
                }
                console.log(`Email sent to ${lead[0].email}:`, info.response);
            });

            // Tambahkan ke riwayat bahwa akun baru telah dibuat
            await addHistoryLeads({ leadId, leadStatus: 'Deal', leadComment: 'Client account created.' });

            return res.status(201).json({ message: "Client account successfully created", userId: insertClient.insertId });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Controller method to get the leads with surveys, history, and images
exports.getLeadsWithSurveyDetails = async (req, res) => {
    const { roleUser, userId } = req.user;
    const { leadId } = req.params;
    try {
        let whereId = ``;
        if (leadId) {
            whereId += `l.id = ${leadId} `;
        }

        let WHERE = ``;
        if (roleUser === 'Salesperson') {
            WHERE += `WHERE l.salesperson_id = ${userId} AND ${whereId}`;
        } else if (roleUser === 'Client') {
            WHERE += `WHERE l.client_id = ${userId} AND ${whereId}`;
        } else {
            WHERE += `WHERE ${whereId} `;
        }

        // First, fetch all leads
        const [leads] = await client_mysql.query(`
            SELECT 
                l.id, 
                l.name, 
                l.email, 
                l.phone, 
                l.status,
                (SELECT name FROM users WHERE id = l.salesperson_id) AS salesperson_name,
                (SELECT name FROM users WHERE id = l.client_id) AS client_name, 
                l.created_at
            FROM leads l
            ${WHERE}
            ORDER BY l.created_at DESC;
        `);

        // Initialize an array to hold the result
        const result = [];

        // Loop through each lead
        for (let lead of leads) {
            // Fetch lead history
            const [leadHistory] = await client_mysql.query(`
                SELECT id, comments, created_at
                FROM leads_history
                WHERE lead_id = ?
                ORDER BY created_at DESC;
            `, [lead.id]);

            // Fetch surveys related to this lead
            const [surveys] = await client_mysql.query(`
                SELECT
                    survey_requests.id AS survey_id,
                    survey_requests.client_name AS client_name,
                    survey_requests.status AS survey_status,
                    survey_requests.address AS survey_address,
                    survey_requests.survey_date AS survey_date,
                    survey_requests.notes AS survey_notes
                FROM survey_requests
                WHERE survey_requests.lead_id = ?
                ORDER BY survey_requests.survey_date DESC;
            `, [lead.id]);

            // Structure the surveys data
            const surveyData = [];
            for (let survey of surveys) {
                let surveyHistory = [];
                let surveyImages = [];
                // Fetch lead history
                surveyHistory = await client_mysql.query(`
                    SELECT id, comments, created_at
                    FROM survey_history
                    WHERE survey_id = ?
                    ORDER BY created_at DESC;
                `, [survey.survey_id]);

                surveyImages = await client_mysql.query(`
                    SELECT 
                        survey_image.id AS survey_image_id,
                        survey_image.images AS survey_image_data
                    FROM survey_image
                    WHERE survey_id = ?
                    ORDER BY created_at DESC;
                `, [survey.survey_id]);

                surveyData.push({
                    survey_id: survey.survey_id,
                    client_name: survey.client_name,
                    survey_status: survey.survey_status,
                    survey_address: survey.survey_address,
                    survey_date: survey.survey_date,
                    survey_notes: survey.survey_notes,
                    history: surveyHistory[0],
                    image: surveyImages[0]
                });
            }

            // Add the lead and its associated surveys and lead history to the result
            result.push({
                lead_id: lead.id,
                lead_name: lead.name,
                lead_email: lead.email,
                lead_phone: lead.phone,
                lead_status: lead.status,
                lead_created_at: lead.created_at,
                lead_history: leadHistory, // Add lead history data
                survey: surveyData // Add survey data to lead
            });
        }

        // Return the final structured result
        res.status(200).json({ data: result });

    } catch (error) {
        console.error('Error fetching leads with surveys, history, and images:', error);
        res.status(500).json({ error: 'Error fetching leads with associated data' });
    }
};