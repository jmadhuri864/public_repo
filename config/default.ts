export default {
    origin: 'http://localhost:3000',
    accessTokenExpiresIn: 15,
    refreshTokenExpiresIn: 60,
    redisCacheExpiresIn: 60,
    emailFrom: 'contact@codevoweb.com',
  
  
    port: 'PORT',
    postgresConfig: {
      host: 'POSTGRES_HOST',
      port: 'POSTGRES_PORT',
      username: 'POSTGRES_USER',
      password: 'POSTGRES_PASSWORD',
      database: 'POSTGRES_DB',
    },
  
    accessTokenPrivateKey: 'JWT_ACCESS_TOKEN_PRIVATE_KEY',
    accessTokenPublicKey: 'JWT_ACCESS_TOKEN_PUBLIC_KEY',
    refreshTokenPrivateKey: 'JWT_REFRESH_TOKEN_PRIVATE_KEY',
    refreshTokenPublicKey: 'JWT_REFRESH_TOKEN_PUBLIC_KEY',
  
    
  };
  