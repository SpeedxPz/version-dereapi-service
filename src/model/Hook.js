'use strict'
const dynamoose = require('dynamoose');


let workingTable = "";

const Model = (tableName) => {
    workingTable = tableName;
    return true;
}

const GetModel = (tableName) => {
    const model = dynamoose.model(
        tableName, 
        {
            id: String, 
            function: String,
            url: String,
        });
    
    return model;
}

const GetAll = () => {
    return new Promise((resolve, reject) => {
        const model = GetModel(workingTable);
        model.scan().exec((err, data) => {
            if(err) return reject(err);
            resolve(data);
        });
    });
}

module.exports = Model;
Model.GetAll = GetAll;
