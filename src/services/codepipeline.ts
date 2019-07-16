import { addAwsPromiseRetries } from '../common';
import { AWS } from '../env';

const codepipeline = new AWS.CodePipeline();

function promiseCompleteJob(jobId:string) {
    let maxRetries = 5;
    let params = {
        jobId : jobId
    }
    return addAwsPromiseRetries(() => codepipeline.putJobSuccessResult(params).promise(), maxRetries);
}

function promiseFailJob(jobId:string, err:any) {
    let maxRetries = 5;
    let params = {
        jobId : jobId,
        failureDetails : {
            type : 'JobFailed',
            message : JSON.stringify(err)
        }
    }
    return addAwsPromiseRetries(() => codepipeline.putJobFailureResult(params).promise(), maxRetries);
}

export default {
    completeJob: promiseCompleteJob,
    failJob : promiseFailJob
}