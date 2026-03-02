const https = require('https');

const AIRTABLE_BASE_ID = 'appUqWFkWdtI4vxNC';
const AIRTABLE_TABLE_NAME = 'Contacts'; // Use table name, not ID
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
    // Tally sends an array of field objects with { key (UUID/groupUuid), label, value }
    const fields = payload.data.fields;
    const fieldMap = {};

    fields.forEach(field => {
      fieldMap[field.key] = field.value;
    });

    // UUID mapping from Tally form ODAodA (Consulting)
    const uuidMap = {
      name: 'db865fe4-c876-4888-a74e-46844149cd85', // What is your name? (INPUT_TEXT)
      email: '5527fdb4-f063-4df2-9283-896ba46c6f6a', // Contact Email (INPUT_EMAIL)
      creativeRole: 'edf8e9bd-5d62-48ff-88a9-2d98054623cb', // What is your creative role? (DROPDOWN)
      bottleneck: '90c97c61-9a40-4ec2-add7-84c33d08e016', // What's your biggest creative bottleneck? (DROPDOWN)
      projectStatus: 'b3f25a92-e853-4b67-a61b-c2ec3323aedb', // Current project status? (DROPDOWN)
      situation: 'c31704ed-820b-4bd4-92bc-cee28a805b38', // What's the biggest friction point? (TEXTAREA)
      service: '44ad2b9e-1dc7-4966-9eed-8cb49dfd9e1a', // Which service interests you most? (DROPDOWN)
      budget: '0dd30ff5-a7f5-4121-912a-970f68dfdd5f', // Budget range? (DROPDOWN)
      notes: '5b06bc26-a4e1-400b-b3aa-941d0cab592f', // Anything else? (TEXTAREA)
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
      },
    };

    // Write to Airtable
    const response = await makeAirtableRequest(
      'POST',
      `${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        records: [airtableRecord],
      }
    );

    const recordId = response.records[0].id;
    console.log('Airtable record created:', recordId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        recordId,
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
