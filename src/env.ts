// Provided automagically by AWS
export const awsRegion = process.env.AWS_REGION as string;

// Provided by Terraform
export const websiteContentBucket = process.env.WEBSITE_CONTENT_BUCKET as string;


import AWSUnconfigured from 'aws-sdk';
export const AWS = AWSUnconfigured;
AWS.config.update({region: awsRegion});

export default { 
    AWS, awsRegion
};