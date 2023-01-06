import Head from 'next/head';
import { ReactNode } from 'react';
import GNB from './GNB';

interface Props {
  title: string;
  children: ReactNode;
}
const ServiceLayout = function ({ title = 'blahx2', children }: Props) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <GNB />
      {children}
    </div>
  );
};

export default ServiceLayout;
