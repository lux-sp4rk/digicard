const https = require('https');

const AIRTABLE_BASE_ID = 'appUqWFkWdtI4vxNC';
const AIRTABLE_TABLE_ID = 'tblpZMgRZq8MVJaGi'; // From Airtable URL
const AIRTABLE_API_KEY = process.env.AIRTABLE_ACCESS_TOKEN;

function makeAirtableRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${endpoint}`,
      method: method,
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          reject({
            statusCode: res.statusCode,
            message: data || 'Airtable request failed',
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function tallyToAirtable(event) {
  try {
    // Parse Tally webhook payload
    const payload = JSON.parse(event.body);

    if (!payload.data || !payload.data.fields) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid Tally payload' }),
      };
    }

    // Extract fields from Tally response
    // Tally sends an array of field objects with { key (UUID), label, value }
    const fields = payload.data.fields;
    const fieldMap = {};

    fields.forEach(field => {
      fieldMap[field.key] = field.value;
    });

    // UUID mapping from Tally form gD5QY1
    const uuidMap = {
      name: '94ee63aa-4c0b-4c60-8c7d-8473be13f3ec', // What's your name?
      email: 'd2e53990-8870-4db9-a07d-051f37cf3b61', // Contact email
      creativeRole: 'dd083cca-f13c-424a-a578-fe0f876958d4', // What's your creative role?
      bottleneck: '77ed5efe-3d05-4da1-b011-a4b061f79f4a', // Biggest creative bottleneck
      projectStatus: '1ea845a3-f9f1-45ab-a65c-e912876cbb03', // Current project status
      situation: 'c66151ae-1a81-440b-bc72-be3ea48f3374', // Tell us about your situation
      service: 'b70956ed-4b49-4f2d-a446-e3846d904719', // Which service interests you most?
      budget: '03c7ff03-cb06-40e9-80f2-d7ff8ac01483', // Budget range?
      wildcard: '5521e146-6d6b-4469-bf0d-d9bb4f90ffcc', // Anything else?
    };

    const airtableRecord = {
      fields: {
        Name: fieldMap[uuidMap.name] || '',
        Email: fieldMap[uuidMap.email] || '',
        'Creative Role': fieldMap[uuidMap.creativeRole] || '',
        Bottleneck: fieldMap[uuidMap.bottleneck] || '',
        'Project Status': fieldMap[uuidMap.projectStatus] || '',
        Situation: fieldMap[uuidMap.situation] || '',
        'Service Package': fieldMap[uuidMap.service] || '',
        'Budget Range': fieldMap[uuidMap.budget] || '',
        Notes: fieldMap[uuidMap.wildcard] || '',
        Source: 'Tally',
        Timestamp: new Date().toISOString(),
        'Form ID': 'gD5QY1',
      },
    };

    // Write to Airtable
    const response = await makeAirtableRequest(
      'POST',
      `${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
      airtableRecord
    );

    console.log('Airtable record created:', response.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        recordId: response.id,
        contact: {
          name: airtableRecord.fields['Name'],
          email: airtableRecord.fields['Email'],
          service: airtableRecord.fields['Service Package'],
          role: airtableRecord.fields['Creative Role'],
        },
      }),
    };
  } catch (error) {
    console.error('Error processing Tally submission:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process submission',
        details: error.message,
      }),
    };
  }
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  return tallyToAirtable(event);
};
