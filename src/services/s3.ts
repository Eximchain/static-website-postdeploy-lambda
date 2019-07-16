// @ts-ignore Alas, there are no published bindings for node-zip.
import zip from 'node-zip';
import { addAwsPromiseRetries } from '../common';
import { AWS } from '../env';
import { S3ArtifactLocation, Credentials } from '../lambda-event-types';
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

function promiseEnableS3BucketCORS(bucketName:string, dappDNS:string) {
    let maxRetries = 5;
    let params = {
        Bucket : bucketName,
        CORSConfiguration : {
            CORSRules : [
                {
                    "AllowedHeaders": ["Authorization"],
                    "AllowedOrigins": [`https://${dappDNS}`],
                    "AllowedMethods": ["GET"],
                    MaxAgeSeconds   : 3000
                }
            ]
        }
    }
    return addAwsPromiseRetries(() => s3.putBucketCors(params).promise(), maxRetries);
}

async function promiseMakeObjectNoCache(bucketName:string, objectKey:string) {
    let maxRetries = 5;
    const indexObject = await promiseGetS3Object(bucketName, objectKey);
    const putParams = {
        Bucket : bucketName,
        ACL : 'public-read',
        ContentType: indexObject.ContentType,
        Key : objectKey,
        Body : indexObject.Body,
        CacheControl: 'max-age=0,no-cache,no-store,must-revalidate'
    }
    return addAwsPromiseRetries(() => s3.putObject(putParams).promise(), maxRetries);
}

function promiseGetS3Object(bucketName:string, objectKey:string) {
    let maxRetries = 5;
    const params = {
        Bucket : bucketName,
        Key : objectKey
    }
    return addAwsPromiseRetries(() => s3.getObject(params).promise(), maxRetries);
}

function promiseGetS3ObjectWithCredentials(bucketName:string, objectKey:string, credentials:Credentials) {
    let maxRetries = 5;
    const params = {
        Bucket : bucketName,
        Key : objectKey
    }

    let credentialClient = new AWS.S3({apiVersion: '2006-03-01', credentials: credentials});

    return addAwsPromiseRetries(() => credentialClient.getObject(params).promise(), maxRetries);
}

async function downloadArtifact(artifactLocation:S3ArtifactLocation, artifactCredentials:Credentials) {
    let getObjectResult = await promiseGetS3ObjectWithCredentials(artifactLocation.bucketName, artifactLocation.objectKey, artifactCredentials);
    console.log("Successfully retrieved artifact: ", getObjectResult);

    let zipArtifact = zip(getObjectResult.Body, {base64: false, checkCRC32: true});
    console.log("Loaded Zip Artifact");

    return zipArtifact;
}

export default {
    getObject : promiseGetS3Object,
    makeObjectNoCache : promiseMakeObjectNoCache,
    enableBucketCors : promiseEnableS3BucketCORS,
    downloadArtifact : downloadArtifact
}