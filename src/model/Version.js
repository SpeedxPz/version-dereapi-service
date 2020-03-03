'use strict'
import dynamoose from 'dynamoose';

const GetVersionModel = (tableName) => {
    const Version = dynamoose.model(
        tableName, 
        {
            id: String, 
            appId: String,
            platform: String, 
            version: String,
            appInfo: {
                name: String,
                image: String,
                author: String,
            }
        });

    return Version;
}

export default GetVersionModel;