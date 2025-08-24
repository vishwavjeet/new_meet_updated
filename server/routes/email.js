const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Send email endpoint
router.post('/send', async (req, res) => {
  try {
    const { provider, senderEmail, senderPass, toEmail, subject, bodyText, link } = req.body;

    // Configure transporter based on provider
    let transporterConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
    };

    if (provider === 'Gmail') {
      transporterConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
      };
    } else if (provider === 'Outlook') {
      transporterConfig = {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
      };
    } else if (provider === 'Yahoo') {
      transporterConfig = {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      ...transporterConfig,
      auth: {
        user: senderEmail,
        pass: senderPass,
      },
    });

    // HTML email template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            color: #1a1a1a; 
            margin: 0; 
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 40px; 
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content { 
            padding: 40px; 
            line-height: 1.6;
          }
          .cta { 
            display: inline-block; 
            padding: 16px 32px; 
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: #fff !important; 
            text-decoration: none; 
            border-radius: 50px; 
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Meeting Invitation</h1>
          </div>
          <div class="content">
            <p>${bodyText.replace(/\n/g, '<br>')}</p>
            ${link ? `<div style='text-align: center;'><a class='cta' href='${link}' target='_blank'>Join Meeting</a></div>` : ''}
          </div>
          <div class="footer">
            Sent from Meeting Inviter App
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: senderEmail,
      to: toEmail,
      subject: subject,
      text: bodyText + (link ? `\n\nJoin link: ${link}` : ''),
      html: htmlTemplate,
    });

    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Process contacts from file
router.post('/process-contacts', (req, res) => {
  try {
    const { filename } = req.body;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    let contacts = [];
    const ext = path.extname(filePath);
    
    if (ext === '.csv') {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const contact = {};
        
        headers.forEach((header, index) => {
          contact[header] = values[index] || '';
        });
        
        contacts.push(contact);
      }
    } else if (ext === '.xlsx' || ext === '.xls') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      contacts = xlsx.utils.sheet_to_json(worksheet);
    }
    
    // Clean up the file after processing
    fs.unlinkSync(filePath);
    
    res.json({ success: true, contacts });
  } catch (error) {
    console.error('Process contacts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;