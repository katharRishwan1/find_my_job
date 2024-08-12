const envConfigs = {
    port: process.env.PORT,
    enviroment: process.env.NODE_ENV,
    DB_URL: process.env.DB_URL,
    redis_options: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
    },
    smsApiKey: process.env.SMS_API_KEY,
    senderId: process.env.SENDER_ID,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRE_TIME,
    merchantId: process.env.PAYMENT_PHONE_PE_MERCHANT_ID,
    redirectUrl: process.env.PAYMENT_PHONE_PE_REDIRECT_URL,
    callbackUrl: process.env.PAYMENT_PHONE_PE_CALLBACK_URL,
    hitUrl: process.env.PAYMENT_PHONE_PE_HIT_URL,
    saltKey: process.env.PAYMENT_PHONE_PE_SALT_KEY,
    installmentUrl: process.env.PAYMENT_INSTALLMENT_URL,
    joinChitUrl: process.env.JOIN_CHIT_URL,
    roleNames: {
        ad: 'ADMIN',
        jb: 'JOBSEEKER',
        own: 'OWNER'
    },
    awsBucketName: process.env.AWS_BUCKET_NAME,
    awsAccessKey: process.env.AWS_ACCESS_KEY,
    awsSecretKey: process.env.AWS_SECRET_KEY,
    emailHost: process.env.MAIL_HOST,
    emailPort: process.env.MAIL_PORT,
    emailAuthUsername: process.env.MAIL_AUTH_USERNAME,
    emailAuthPassword: process.env.MAIL_AUTH_PASSWORD,
    awsRegion: process.env.AWS_BUCKET_REGION,
    teleApiId: process.env.TELE_API_ID,
    teleSecret: process.env.TELE_SECRET,
    teleCmiSecretKey: process.env.TELE_CMI_SECRET_KEY,

};
console.log('datadase key----', process.env.MONGODB_DEV_URI);
module.exports = { ...envConfigs }