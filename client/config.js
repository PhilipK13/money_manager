const live = process.env.NODE_ENV === "production";
export const WEBSITE_URL = live ? "https://youtube.com" : "http://localhost:3000";

const config = {
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_vAMT7XaEX",
    userPoolWebClientId: "8rhrojpcl1rsq9ekmh34oqhcu",
    oauth: {
      domain: "moneymanager.auth.us-east-1.amazoncognito.com",
      scope: ["email", "openid", "profile", "phone"],
      redirectSignIn: WEBSITE_URL,
      redirectSignOut: WEBSITE_URL,
      responseType: "code",
    },
  },
};

export default config;