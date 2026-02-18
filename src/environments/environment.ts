// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` creates `environment.js` from this file.

export const environment = {
    production: false,
    // notificationServiceUrl: 'http://localhost:8003',
    notificationServiceUrl: 'http://localhost:8000/api/v1/notifications',
    // notificationServiceUrl: 'https://lifrica.com/api-gateway/api/v1/notifications',
    lifricaApiGatewayUrl: 'http://localhost:8000',
    // userServiceUrl: 'http://localhost:8001',
    userServiceUrl: 'http://localhost:8000/api/v1',
    userserviceLiveUrl: "http://localhost:8000/api/v1/"
};
