const express = require('express');
const router = express.Router();
const axios = require('axios');

// Send WhatsApp message
router.post('/send', async (req, res) => {
  try {
    const { accessToken, phoneNumberId, toNumber, textBody } = req.body;
    
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };
    
    const payload = {
      "messaging_product": "whatsapp",
      "to": toNumber,
      "type": "text",
      "text": { "body": textBody }
    };
    
    const response = await axios.post(url, payload, { headers, timeout: 30000 });
    
    if (response.status === 200) {
      res.json({ 
        success: true, 
        message: 'WhatsApp message sent successfully',
        data: response.data 
      });
    } else {
      res.status(response.status).json({
        success: false,
        error: `API returned status ${response.status}`,
        data: response.data
      });
    }
  } catch (error) {
    console.error('WhatsApp error:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.response.data.error?.message || 'WhatsApp API error',
        details: error.response.data
      });
    } else if (error.request) {
      res.status(500).json({
        success: false,
        error: 'No response received from WhatsApp API'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

module.exports = router;