'use strict'
import dynamoose from 'dynamoose';

const GetHookModel = (tableName) => {
    const Hook = dynamoose.model(
        tableName, 
        {
            id: String, 
            function: String,
            url: String,
        });

    return Hook;
}

export default GetHookModel;