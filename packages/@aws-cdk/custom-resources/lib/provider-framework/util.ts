import * as sfn from '@aws-cdk/aws-stepfunctions';
import { Duration } from '@aws-cdk/core';

const DEFAULT_TIMEOUT = Duration.minutes(30);
const DEFAULT_INTERVAL = Duration.seconds(5);

export function calculateRetryPolicy(props: { totalTimeout?: Duration, queryInterval?: Duration } = { }): sfn.RetryProps {
  const totalTimeout = props.totalTimeout || DEFAULT_TIMEOUT;
  const interval = props.queryInterval || DEFAULT_INTERVAL;
  const maxAttempts = totalTimeout.toSeconds() / interval.toSeconds();

  if (Math.round(maxAttempts) !== maxAttempts) {
    // eslint-disable-next-line max-len
    throw new Error(`Cannot determine retry count since totalTimeout=${totalTimeout.toSeconds()}s is not integrally dividable by queryInterval=${interval.toSeconds()}s`);
  }

  return {
    maxAttempts,
    interval,
    backoffRate: 1
  };
}
