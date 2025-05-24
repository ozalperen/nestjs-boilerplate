# Mail Service Configuration

This project has been updated to use nodemailer with flexible SMTP configuration options.

## Current Setup

The application uses a custom `MailerService` that wraps nodemailer for sending emails. The service is already configured and ready to work with any SMTP provider.

## Development Setup

### Option 1: MailHog (Recommended for Development)

MailHog is now configured in `docker-compose.yaml` as the default mail service for development:

```bash
# Start the services
docker-compose up -d

# Access MailHog web interface
# Visit: http://localhost:8025
```

MailHog captures all emails sent by your application and displays them in a web interface, perfect for development and testing.

### Option 2: Real SMTP Service

For production or if you want to test with real email delivery, update your `.env` file with one of these configurations:

#### Gmail SMTP
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_IGNORE_TLS=false
MAIL_SECURE=false
MAIL_REQUIRE_TLS=true
```

#### SendGrid SMTP
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_IGNORE_TLS=false
MAIL_SECURE=false
MAIL_REQUIRE_TLS=true
```

#### Mailgun SMTP
```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USER=your-mailgun-username
MAIL_PASSWORD=your-mailgun-password
MAIL_IGNORE_TLS=false
MAIL_SECURE=false
MAIL_REQUIRE_TLS=true
```

## Migration from Maildev

The previous `maildev` service has been replaced with `mailhog` for better performance and features. The key changes:

1. **Web Interface Port**: Changed from `1080` to `8025`
2. **Better UI**: MailHog provides a more modern interface
3. **Better Performance**: More stable and faster than maildev

## Testing Email Functionality

1. Start your application
2. Trigger any email-sending functionality (user registration, password reset, etc.)
3. Check the MailHog interface at `http://localhost:8025` to see the captured emails

## Production Deployment

For production deployment:

1. Comment out the `mailhog` service in `docker-compose.yaml`
2. Configure your environment variables with a real SMTP service
3. Ensure your SMTP credentials are secure and not committed to version control

## Files Modified

- `docker-compose.yaml`: Replaced maildev with mailhog and added SMTP relay option
- `env-example-relational`: Updated with comprehensive SMTP configuration examples
- The `MailerService` remains unchanged and continues to use nodemailer
