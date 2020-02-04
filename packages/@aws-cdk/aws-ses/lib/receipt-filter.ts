import { Construct, Resource } from '@aws-cdk/core';
import { CfnReceiptFilter } from './ses.generated';

/**
 * The policy for the receipt filter.
 */
export enum ReceiptFilterPolicy {
  /**
   * Allow the ip address or range.
   */
  ALLOW = 'Allow',

  /**
   * Block the ip address or range.
   */
  BLOCK = 'Block'
}

/**
 * Construction properties for a ReceiptFilter.
 */
export interface ReceiptFilterProps {
  /**
   * The name for the receipt filter.
   *
   * @default a CloudFormation generated name
   */
  readonly receiptFilterName?: string;

  /**
   * The ip address or range to filter.
   *
   * @default 0.0.0.0/0
   */
  readonly ip?: string;

  /**
   * The policy for the filter.
   *
   * @default Block
   */
  readonly policy?: ReceiptFilterPolicy;
}

/**
 * A receipt filter. When instantiated without props, it creates a
 * block all receipt filter.
 */
export class ReceiptFilter extends Resource {
  public constructor(scope: Construct, id: string, props: ReceiptFilterProps = {}) {
    super(scope, id, {
      physicalName: props.receiptFilterName,
    });

    new CfnReceiptFilter(this, 'Resource', {
      filter: {
        ipFilter: {
          cidr: props.ip || '0.0.0.0/0',
          policy: props.policy || ReceiptFilterPolicy.BLOCK,
        },
        name: this.physicalName,
      }
    });
  }
}

/**
 * Construction properties for a WhiteListReceiptFilter.
 */
export interface WhiteListReceiptFilterProps {
  /**
   * A list of ip addresses or ranges to white list.
   */
  readonly ips: string[];
}

/**
 * A white list receipt filter.
 */
export class WhiteListReceiptFilter extends Construct {
  public constructor(scope: Construct, id: string, props: WhiteListReceiptFilterProps) {
    super(scope, id);

    new ReceiptFilter(this, 'BlockAll');

    props.ips.forEach(ip => {
      new ReceiptFilter(this, `Allow${ip.replace(/[^\d]/g, '')}`, {
        ip,
        policy: ReceiptFilterPolicy.ALLOW
      });
    });
  }
}
