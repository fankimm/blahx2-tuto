// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Chromium from 'chrome-aws-lambda';
import { NextApiRequest, NextApiResponse } from 'next';
import playWrite from 'playwright-core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const localChromePath = process.env.NODE_ENV !== 'development' ? '' : process.env.LOCAL_CHROME_PATH ?? '';
  if (process.env.NODE_ENV !== 'development') {
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    await Chromium.font(`${baseUrl}/Pretendard-Regular.ttf`);
  }
  const browser = await playWrite.chromium.launch({
    args: Chromium.args,
    executablePath: process.env.NODE_ENV !== 'development' ? await Chromium.executablePath : localChromePath,
    headless: process.env.NODE_ENV !== 'development' ? Chromium.headless : true,
  });
  const page = await browser.newPage({
    viewport: {
      width: 1200,
      height: 675,
    },
  });
  const url = req.query.url as string;
  console.log(req.query);
  await page.goto(url);
  const data = await page.screenshot({
    type: 'jpeg',
  });
  await browser.close();
  res.setHeader('Cache-Control', 's-maxage=315360000 ,public');
  res.setHeader('Content-Type', 'image/jpeg');
  res.end(data);
}
