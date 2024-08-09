export default () => {
  return {
    PORT: parseInt(process.env.PORT, 10) || 3001,
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
    JWT_EXPIRY: process.env.JWT_EXPIRY || "86400s",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    JWT_REFRESH_EXPIRY:
      process.env.JWT_REFRESH_EXPIRY || "90d",
    redis: {
      name: "redis",
      url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
      socket: {
        keepAlive: 1,
        tls: process.env.NODE_ENV === "production" ? true : false,
        rejectUnauthorized: false,
      },
    },
    FROM_EMAIL: process.env.FROM_EMAIL || "noreply@mail.com",
    INVITE_FROM_EMAIL: process.env.INVITE_FROM_EMAIL || "",

    // AWS
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    AWS_S3_REGION: process.env.AWS_S3_REGION || "",
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "",
    AWS_REGION: process.env.AWS_REGION || "",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
    TWILIO_SERVICE_SID: process.env.TWILIO_SERVICE_SID || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    FACEBOOK_ID: process.env.FACEBOOK_ID,
    FACEBOOK_SECRET: process.env.FACEBOOK_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
    SOCIAL_AUTH_REDIRECT_URL: process.env.SOCIAL_AUTH_REDIRECT_URL || "http://localhost:3001",
    APP_BASE_URL: process.env.APP_BASE_URL || "",
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || ""
  };
};
