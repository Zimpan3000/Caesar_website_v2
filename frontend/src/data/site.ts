import { sitePath } from '../paths'
export const links = {
  about: 'https://caesar.se/vilka-vi-ar/',
  board: 'https://caesar.se/styrelse-26-27/',
  documents: 'https://caesar.se/styrdokument/',
  projects: 'https://caesar.se/projekt/',
  phobos: 'https://caesar.se/projekt/phobos/',
  latest: 'https://caesar.se/senaste/',
  partners: 'https://caesar.se/sponsorer/',
  support: 'https://caesar.se/stod-oss/',
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
    title: 'Intromöte med raketbygge', date: '2025-08-20', category: 'Föreningen',
    image: sitePath('assets/team.jpeg'), alt: 'CAESARs team samlat på Chalmers',
    description: 'Vill du vara med på vår resa mot rymden? Kom på vår introkväll och hör mer om hur du kan engagera dig i CAESAR.',
    url: 'https://caesar.se/2025/08/20/intromote-med-raketbygge/',
  },
  {
    title: 'Introduktionsmöte', date: '2025-01-27', category: 'Föreningen',
    image: sitePath('assets/phobos.png'), alt: 'Illustration av CAESARs raket Phobos',
    description: 'Vi söker raketintresserade som vill vara med och ta Chalmers till rymden!',
    url: 'https://caesar.se/2025/01/27/introduktionsmote/',
  },
  {
    title: 'Uppföljande informationsmöte', date: '2024-09-21', category: 'Föreningen',
    image: sitePath('assets/launch.png'), alt: 'Jordens blå horisont sedd från rymden',
    description: 'Tack till alla som kom på informationsmötet! Vi kommer gå igenom mer information om designteamet och planerna framöver.',
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
