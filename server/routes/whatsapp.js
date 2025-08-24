const express = require('express');
const router = express.Router();
const axios = require('axios');

// Send WhatsApp message
router.post('/send', async (req, res) => {
  try {
    const { accessToken, phoneNumberId, toNumber, textBody } = req.body;
    
    console.log('WhatsApp request received:', {
      phoneNumberId,
      toNumber: toNumber.substring(0, 6) + '...', // Log partial number for privacy
      textBodyLength: textBody.length
    });

    // Validate required fields
    if (!accessToken || !phoneNumberId || !toNumber || !textBody) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: accessToken, phoneNumberId, toNumber, or textBody'
      });
    }

    // Clean and validate phone number
    const cleanNumber = toNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    // Format phone number with country code (assuming international format)
    const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;
    
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };
    
    const payload = {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": formattedNumber,
      "type": "text",
      "text": { 
        "preview_url": false,
        "body": textBody 
      }
    };

    console.log('Sending WhatsApp request to:', url);
    
    const response = await axios.post(url, payload, { 
      headers, 
      timeout: 30000 
    });
    
    if (response.status === 200) {
      console.log('WhatsApp message sent successfully:', response.data);
      res.json({ 
        success: true, 
        message: 'WhatsApp message sent successfully',
        data: response.data 
      });
    } else {
      console.log('WhatsApp API returned non-200 status:', response.status);
      res.status(response.status).json({
        success: false,
        error: `API returned status ${response.status}`,
        data: response.data
      });
    }
  } catch (error) {
    console.error('WhatsApp error details:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('WhatsApp API error response:', error.response.data);
      res.status(error.response.status).json({
        success: false,
        error: error.response.data.error?.message || 'WhatsApp API error',
        details: error.response.data,
        statusCode: error.response.status
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from WhatsApp API:', error.request);
      res.status(503).json({
        success: false,
        error: 'No response received from WhatsApp API. Check your internet connection and API endpoint.',
        details: error.message
      });
    } else {
      // Something happened in setting up the request
      console.error('WhatsApp setup error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// WhatsApp webhook verification (optional but recommended)
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Your verify token (set this in WhatsApp Business API settings)
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// WhatsApp webhook for receiving messages (optional)
router.post('/webhook', (req, res) => {
  console.log('WhatsApp webhook received:', req.body);
  res.status(200).send('EVENT_RECEIVED');
});

module.exports = router;
