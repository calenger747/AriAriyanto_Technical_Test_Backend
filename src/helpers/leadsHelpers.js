const { client_mysql, ConnectDBMySQL } = require('../configs/database.config.js');

async function getAvailableSalesperson(type) {
    // Fetch available salespersons for the lead type (Residential or Commercial)
    const [availableSalespersons] = await client_mysql.query(
        `SELECT id 
         FROM users 
         WHERE role = "Salesperson" 
           AND ?? = 1 
           AND (punishment_start IS NULL OR punishment_end < NOW()) `,
        [type === 'Residential' ? 'residential_sales' : 'commercial_sales']
    );

    if (availableSalespersons.length === 0) {
        return null;
    }

    // Get currentSalespersonIndex for round-robin assignment
    const indexKey = type === 'Residential' ? 'currentResidentialSalespersonIndex' : 'currentCommercialSalespersonIndex';
    const [indexResult] = await client_mysql.query('SELECT key_value FROM settings WHERE key_name = ?', [indexKey]);
    const currentIndex = indexResult.length ? indexResult[0].key_value : 0;

    // Assign the next available salesperson
    const salespersonId = availableSalespersons[currentIndex % availableSalespersons.length].id;

    // Move to the next salesperson for future assignments
    const nextIndex = (currentIndex + 1) % availableSalespersons.length;

    // Update the round-robin index
    await client_mysql.query('UPDATE settings SET key_value = ? WHERE key_name = ?', [nextIndex, indexKey]);

    // Update the index for the next lead assignment
    await client_mysql.query('UPDATE settings SET key_value = ? WHERE key_name = ?',
        [nextIndex, indexKey]
    );

    return salespersonId;

}

async function addHistoryLeads(data) {
    const { leadId, leadStatus, leadComment } = data;

    await client_mysql.query(
        'INSERT INTO leads_history (lead_id, lead_status, comments) VALUES (?, ?, ?)',
        [leadId, leadStatus, leadComment]
    );

    return true;
}

// Helper function to update lead status
const updateLeadStatusHelper = async (leadId, newStatus, clientResponse = null, image = null, notes = null) => {
    try {
        // Dapatkan status saat ini dari lead
        const [lead] = await client_mysql.query('SELECT status, name, email, phone FROM leads WHERE id = ?', [leadId]);

        if (!lead.length) {
            throw new Error('Lead not found');
        }

        const currentStatus = lead[0].status;

        // Jika status sama dengan status saat ini, tidak perlu update
        if (currentStatus === newStatus) {
            throw new Error(`Lead sudah memiliki status ${newStatus}`);
        }

        // Update status lead
        await client_mysql.query('UPDATE leads SET status = ? WHERE id = ?', [newStatus, leadId]);

        // Tambahkan ke riwayat
        await addHistoryLeads({ leadId, leadStatus: newStatus, leadComment: `Status updated to ${newStatus}` });

        return { success: true, message: `Lead status updated to ${newStatus}` };
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Failed to update lead status: ' + error.message);
    }
};

async function addHistorySurvey(data) {
    const { surveyId, surveyStatus, surveyComment } = data;

    await client_mysql.query(
        'INSERT INTO survey_history (survey_id, status, comments) VALUES (?, ?, ?)',
        [surveyId, surveyStatus, surveyComment]
    );

    return true;
}

async function generateRandomPassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
}

module.exports = { getAvailableSalesperson, addHistoryLeads, updateLeadStatusHelper, addHistorySurvey, generateRandomPassword };