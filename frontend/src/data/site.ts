import { sitePath } from '../paths'
export const links = {
  about: 'https://caesar.se/vilka-vi-ar/',
  board: 'https://caesar.se/styrelse-26-27/',
  documents: 'https://caesar.se/styrdokument/',
  projects: sitePath('#projekt'),
  phobos: sitePath('projekt/phobos/'),
  latest: 'https://caesar.se/senaste/',
  partners: 'https://caesar.se/sponsorer/',
  support: sitePath('stod-oss/'),
  sponsor: sitePath('bli-sponsor/'),
  membership: sitePath('ga-med-i-caesar/'),
  membershipForm: 'https://docs.google.com/forms/d/e/1FAIpQLSdZzDBdB8EormUAFFqb0uo5A7eiATA3PdrNRqqTz4NTmlUpwg/viewform?usp=sharing&ouid=100570194524514082116',
  projectApplication: 'https://docs.google.com/forms/d/e/1FAIpQLScY5NCPJWGgnuTHLv7N0lP4GwflK1K7PGJ-pj0nRN8RgS94RA/viewform?usp=dialog',
  english: 'https://caesar.se/en/',
  newsletter: 'https://docs.google.com/forms/d/e/1FAIpQLSd6ocacj7HyvzFbxhIZ5NOHFRRDqZ0kNCV2mNcdos4TwZ0gcg/viewform',
}

// Published Swedish posts from caesar.se, retrieved 2026-09-16.
// Source posts have no featured images; CAESAR imagery is used as illustration.
export const news = [
  {
    title: 'Introductory Meeting and Rocket Building', date: '2025-08-20', category: 'Society News',
    image: sitePath('assets/team.jpeg'), alt: 'The CAESAR team together at Chalmers',
    description: 'Want to join our journey towards space? Come to our introduction evening to find out how to get involved in CAESAR.',
    url: 'https://caesar.se/2025/08/20/intromote-med-raketbygge/',
  },
  {
    title: 'Introduction Meeting', date: '2025-01-27', category: 'Society News',
    image: sitePath('assets/phobos.png'), alt: 'Illustration of CAESAR’s Phobos rocket',
    description: 'We are looking for rocket enthusiasts who want to help take Chalmers to space!',
    url: 'https://caesar.se/2025/01/27/introduktionsmote/',
  },
  {
    title: 'Follow-up Information Meeting', date: '2024-09-21', category: 'Society News',
    image: sitePath('assets/launch.png'), alt: 'Earth’s blue horizon seen from space',
    description: 'Thank you to everyone who attended the information meeting. We will share more about the design team and our plans for the future.',
    url: 'https://caesar.se/2024/09/21/uppfoljande-informationsmote/',
  },
]

export const partners = [
  { name: 'Chalmers tekniska högskola', image: sitePath('assets/chalmers.png'), url: 'https://www.chalmers.se/' },
  { name: 'Astronomisk Ungdom', image: sitePath('assets/astronomisk-ungdom.png'), url: 'https://www.astronomiskungdom.se/' },
  { name: 'Tranemo Workwear', image: sitePath('assets/tranemo.png'), url: 'https://www.tranemoworkwear.se/' },
]

export const socials = [
  { name: 'Instagram', url: 'https://www.instagram.com/caesarchalmers/' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/caesar-chalmers' },
  { name: 'Facebook', url: 'https://www.facebook.com/ChalmersCAESAR' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@caesarchalmers' },
]
