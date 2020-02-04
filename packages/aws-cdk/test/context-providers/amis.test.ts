import * as aws from 'aws-sdk';
import * as AWS from 'aws-sdk-mock';
import { ISDK } from '../../lib/api';
import { AmiContextProviderPlugin } from '../../lib/context-providers/ami';

AWS.setSDKInstance(aws);

afterEach(done => {
  AWS.restore();
  done();
});

const mockSDK: ISDK = {
  defaultAccount: () => Promise.resolve('123456789012'),
  defaultRegion: () => Promise.resolve('bermuda-triangle-1337'),
  cloudFormation: () => { throw new Error('Not Mocked'); },
  ec2: () => Promise.resolve(new aws.EC2()),
  ecr: () => { throw new Error('Not Mocked'); },
  route53: () => { throw new Error('Not Mocked'); },
  s3: () => { throw new Error('Not Mocked'); },
  ssm: () => { throw new Error('Not Mocked'); },
};

type AwsCallback<T> = (err: Error | null, val: T) => void;

test('calls DescribeImages on the request', async () => {
  // GIVEN
  let request: aws.EC2.DescribeImagesRequest;
  AWS.mock('EC2', 'describeImages', (params: aws.EC2.DescribeImagesRequest, cb: AwsCallback<aws.EC2.DescribeImagesResult>) => {
    request = params;
    return cb(null, { Images: [{ ImageId: 'ami-1234' }] });
  });

  // WHEN
  await new AmiContextProviderPlugin(mockSDK).getValue({
    account: '1234',
    region: 'asdf',
    owners: ['some-owner'],
    filters: {
      'some-filter': ['filtered']
    }
  });

  // THEN
  expect(request!).toEqual({
    Owners: ['some-owner'],
    Filters: [
      {
        Name: 'some-filter',
        Values: ['filtered'],
      }
    ]
  } as aws.EC2.DescribeImagesRequest);
});

test('returns the most recent AMI matching the criteria', async () => {
  // GIVEN
  AWS.mock('EC2', 'describeImages', (_: aws.EC2.DescribeImagesRequest, cb: AwsCallback<aws.EC2.DescribeImagesResult>) => cb(null, {
    Images: [
      {
        ImageId: 'ami-1234',
        CreationDate: '2016-06-22T08:39:59.000Z',
      },
      {
        ImageId: 'ami-5678',
        CreationDate: '2019-06-22T08:39:59.000Z',
      }
    ]
  }));

  // WHEN
  const result = await new AmiContextProviderPlugin(mockSDK).getValue({
    account: '1234',
    region: 'asdf',
    filters: {}
  });

  // THEN
  expect(result).toBe('ami-5678');
});