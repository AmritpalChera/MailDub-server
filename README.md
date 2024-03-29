# MailDub Server
This is the backend for MailDub, which is a chrome extention to turn any real estate email into marketing content for social media.

## Main Endpoints
The server uses Next.JS API routes to implement the endpoints.

### Image
Used to generate an image for the generated marketing content. It leverages data from Lexica.art by default. If there is an error it uses Leap API. This is because Lexica provides pre-generated images which avoids the generation time needed to generate an image for custom content.

This endpoint uses `emailSummary` to generate the image content. A userId is required for an authenticated user to access this endpoint.

### Social
This endpoints generates content for different social media. It uses prompt engineering to tailor the output specific to the norms of each platform. It takes in 3 parameters.

The `emailContent` string with the content from the email.

A string `social` identifying the platform to generate the content for.

### Stripe
An enpoint used to generate a stripe link for users to subscribe to the premium plan.



