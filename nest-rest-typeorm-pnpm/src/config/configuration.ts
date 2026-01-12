import { join } from "path";
export default () => {
  let database: any;

  if (process.env.NODE_ENV === "production") {
    database = {
      type: process.env.DATABASE_TYPE || "postgres",
      url: process.env.DATABASE_URL,
      migrationsRun: true,
      autoLoadEntities: true,
      logging: true,
      migrations: [join(__dirname, "../migrations", "*{ts,js}")],
      entities: [join(__dirname, "**", "*.entity.{ts,js}")],
      seeds: [join(__dirname, "../seeders", "*.seeder.{ts,js}")],
      ssl: { rejectUnauthorized: false }
    };
  } else {
    database = {
      host: process.env.DATABASE_HOST || "localhost",
      port: parseInt(process.env.DATABASE_PORT!, 10) || 5432,
      type: process.env.DATABASE_TYPE || "postgres",
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      migrationsRun: false,
      autoLoadEntities: true,
      logging: true,
      migrations: [join(__dirname, "../migrations", "*{ts,js}")],
      entities: [join(__dirname, "**", "*.entity.{ts,js}")],
      seeds: [join(__dirname, "../seeders", "*.seeder.{ts,js}")],
    };
  }

  return {
    PORT: parseInt(process.env.PORT!, 10) || 3001,
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
    JWT_EXPIRY: process.env.JWT_EXPIRY || "86400s",
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
    database,
    // AWS
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    AWS_S3_REGION: process.env.AWS_S3_REGION || "",
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || "",
    AWS_REGION: process.env.AWS_REGION || "",
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    VERIFY_EMAIL_TEMPLATE_ID: process.env.VERIFY_EMAIL_TEMPLATE_ID || "",
    NEW_SIGNUP_TEMPLATE_ID: process.env.NEW_SIGNUP_TEMPLATE_ID || "",
    FORGET_PASSWORD_TEMPLATE_ID: process.env.FORGET_PASSWORD_TEMPLATE_ID || "",
    RESET_PASSWORD_TEMPLATE_ID: process.env.RESET_PASSWORD_TEMPLATE_ID || "",
    SET_PASSWORD_TEMPLATE_ID: process.env.SET_PASSWORD_TEMPLATE_ID || "",
    PORTAL_APP_BASE_URL: process.env.PORTAL_APP_BASE_URL || "",
    FIGMA_CLIENT_ID: process.env.FIGMA_CLIENT_ID,
    FIGMA_REDIRECT_URI: process.env.FIGMA_REDIRECT_URI,
    FIGMA_CLIENT_SECRET: process.env.FIGMA_CLIENT_SECRET,
    JIRA_CLIENT_ID: process.env.JIRA_CLIENT_ID,
    JIRA_CLIENT_SECRET: process.env.JIRA_CLIENT_SECRET,
    JIRA_REDIRECT_URI: process.env.JIRA_REDIRECT_URI,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  };
};
