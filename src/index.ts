'use strict';
import jobs from './jobs';
import { CodePipelineEvent } from './lambda-event-types';

exports.handler = async (event:CodePipelineEvent) => {
    console.log("request: " + JSON.stringify(event));

    // CodePipeline Event
    if ('CodePipeline.job' in event) {
        let pipelineEvent = event['CodePipeline.job'];
        return jobs.postPipelineBuild(pipelineEvent);
    }

    console.log("Doing Nothing for unrecognized event");
    return {};
};