import { CodePipelineJob } from './lambda-event-types';
import { websiteContentBucket } from './env';
import services from './services';
const { s3, codepipeline } = services;

// View a sample JSON event from a CodePipeline here:
//
// https://docs.aws.amazon.com/codepipeline/latest/userguide/actions-invoke-lambda-function.html#actions-invoke-lambda-function-json-event-example
//
// Below function is called by index, it receives the event["CodePipeline.job"] field.

async function postPipelineBuildJob({ id }:CodePipelineJob) {
  console.log("Performing post-deploy tasks");

  try {
    await s3.makeObjectNoCache(websiteContentBucket, 'index.html');
    console.log("Successfully completed all CodePipeline post-deploy steps!");
    return await codepipeline.completeJob(id);
  } catch (err) {
    console.log("Error completing post-deploy steps: ", err);
    await codepipeline.failJob(id, err);
  }
}

export default {
  postPipelineBuild : postPipelineBuildJob
}