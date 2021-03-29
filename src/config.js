module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    //DATABASE_URL:process.env.DATABASE_URL || 'postgresql://lsikora@localhost/rfinder-api',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL|| 'postgresql://lsikora@localhost/rfinder-api-test',
    DATABASE_URL: (process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL),
    JWT_SECRET: process.env.JWT_SECRET || 'finds',
    CLIENT_ORIGIN: 'https://rfinder-app.vercel.app/'
}
