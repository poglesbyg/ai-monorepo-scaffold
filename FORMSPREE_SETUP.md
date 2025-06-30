# Formspree Setup for Sequencing Consultation

This application uses Formspree to handle consultation form submissions. Follow these steps to set it up:

## 1. Create a Formspree Account

1. Go to [Formspree.io](https://formspree.io)
2. Sign up for a free account
3. Verify your email address

## 2. Create a New Form

1. In your Formspree dashboard, click "New Form"
2. Name it "Sequencing Consultation" or similar
3. Copy the form endpoint URL (it looks like `https://formspree.io/f/YOUR_FORM_ID`)

## 3. Configure Environment Variable

Add the Formspree endpoint to your `.env` file:

```bash
PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
```

Replace `YOUR_FORM_ID` with your actual form ID from Formspree.

## 4. Configure Form Settings in Formspree

In your Formspree form settings:

1. **Email Notifications**: Set up email notifications to receive consultation submissions
2. **Custom Email Template**: You can create a custom email template named "consultation" for better formatting
3. **Allowed Domains**: Add your production domain to the allowed domains list
4. **Auto-Response**: Set up an auto-response email to confirm receipt of the consultation

## 5. Form Fields Reference

The consultation form sends the following fields to Formspree:

- `name` - Principal Investigator name
- `email` - Contact email
- `institution` - Institution/University
- `phone` - Phone number
- `department` - Department
- `projectTitle` - Project title
- `projectDescription` - Detailed project description
- `researchArea` - Research area/field
- `objectives` - Project objectives
- `sampleType` - Type of samples
- `organism` - Organism being studied
- `numberOfSamples` - Number of samples
- `tissueType` - Tissue type
- `treatmentGroups` - Treatment groups (comma-separated)
- `controlGroups` - Control groups (comma-separated)
- `timeline` - Project timeline
- `budgetRange` - Budget range
- `grantFundingStatus` - Grant funding status
- `recommendedServices` - AI-recommended services (semicolon-separated)

Special fields:
- `_subject` - Email subject line
- `_replyto` - Reply-to email address
- `_template` - Email template name (if configured)

## 6. Testing

1. Fill out the consultation form completely
2. Submit the form
3. Check your Formspree dashboard for the submission
4. Verify you received the email notification

## 7. Production Considerations

- Use environment variables to store the Formspree endpoint
- Consider upgrading to a paid Formspree plan for higher submission limits
- Set up webhook integrations if you need to process submissions programmatically
- Enable reCAPTCHA in Formspree settings to prevent spam

## Troubleshooting

- **403 Forbidden**: Make sure your domain is in the allowed domains list in Formspree
- **No submissions received**: Check that the form endpoint URL is correct
- **Missing fields**: Verify all field names match what's configured in the form 