'use strict'
import dynamoose from 'dynamoose';

const GetVersionModel = (tableName) => {
    const Version = dynamoose.model(
        tableName, 
        {
            id: String, 
            platform: String, 
            version: String
        });

    return Version;
}

export default GetVersionModel;