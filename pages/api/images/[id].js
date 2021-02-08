import renderSocialImage from 'puppeteer-social-image'
import chrome from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'
import faker from 'faker'

import firestore from '../../../utils/firestore'

export default async (req, res) => {
  const snapshot = await firestore.collection('raid-stats').doc(req.query.id).get()
  if (!snapshot.exists) {
    return res.status(404).send({
      message: 'not found',
    })
  }

  const document = snapshot.data()

  const image = await renderSocialImage({
    template: 'basic',
    templateParams: {
      // imageUrl: 'https://images.unsplash.com/photo-1557958114-3d2440207108?w=1950&q=80',
      unsplashKeywords: 'raid',
      title: document.title,
      logo: 'https://avatars.githubusercontent.com/u/75751120?s=200&v=4',
      watermark: document.dungeon,
    },
    size: 'facebook',
    ...(process.env.NODE_ENV === 'production'
      ? {
          browser: await puppeteer.launch({
            defaultViewport: null,
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
          }),
        }
      : null),
  })

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate')
  res.send(image)
}
