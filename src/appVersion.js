import checker from './lib/envVarsChecker';
import VersionModel from './model/Version';

export const handler = async event => {

    const dynamoTable = process.env.DYNAMODB_TABLE;
    const missing = checker(process.env);

    if (missing.length) {
        const vars = missing.join(', ');
        return createResponse(500 ,{message: `Missing required environment variables: ${vars}`});
    }

    const Versions = await GetAppVersions(dynamoTable);
    
    return createResponse(200 ,{ versions: Versions});
};


const GetAppVersions = (dynamoTable) => {
    return new Promise((resolve, reject) => {
        const Version = VersionModel(dynamoTable);
        Version.scan().exec((err, data) => {
            if(err) return reject(err);
            resolve(data);
        });
    });
}

const createResponse = async (code, body) => {
    return {
        statusCode: code,
        body: JSON.stringify(body),
    };
};