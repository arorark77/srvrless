'use strict';

const AWS = require("aws-sdk");

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.tableName

module.exports.peersls = async (event, context, callback) => {
    let response = {
        "statusCode": 200,
        "isBase64Encoded": false
        }

    if (event.httpMethod === "GET" && event.queryStringParameters) {
        let account_id = event.queryStringParameters.sub_id
        let params = { 
            TableName: tableName,
            FilterExpression: "sub_id = :sub_id",
            ExpressionAttributeValues: {
                // ":sub_id": event.sub_id
                ":sub_id": event.queryStringParameters.sub_id
            }            
        };
        let scanResults = [];
        let scandata;
        do {
            scandata = await docClient.scan(params).promise();
            scandata.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = scandata.LastEvaluatedKey;
        } while (typeof scandata.LastEvaluatedKey != "undefined"); 
         response.body = JSON.stringify(scanResults);
    
        callback(null, response);
    }
};
