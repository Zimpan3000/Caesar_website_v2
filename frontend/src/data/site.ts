import { sitePath } from '../paths'
export const links = {
  about: sitePath('#om-oss'),
  projects: sitePath('#projekt'),
  phobos: sitePath('projects/phobos/'),
  partners: sitePath('partners/'),
  contact: sitePath('contact/'),
  support: sitePath('support-us/'),
  sponsor: sitePath('become-a-sponsor/'),
  membership: sitePath('join-us/'),
  membershipForm: 'https://docs.google.com/forms/d/e/1FAIpQLSdZzDBdB8EormUAFFqb0uo5A7eiATA3PdrNRqqTz4NTmlUpwg/viewform?usp=sharing&ouid=100570194524514082116',
  projectApplication: 'https://docs.google.com/forms/d/e/1FAIpQLScY5NCPJWGgnuTHLv7N0lP4GwflK1K7PGJ-pj0nRN8RgS94RA/viewform?usp=dialog',
  newsletter: 'https://docs.google.com/forms/d/e/1FAIpQLSd6ocacj7HyvzFbxhIZ5NOHFRRDqZ0kNCV2mNcdos4TwZ0gcg/viewform',
}

export const partners = [
  { name: 'Chalmers tekniska högskola', image: sitePath('assets/chalmers.png'), url: 'https://www.chalmers.se/' },
  { name: 'Astronomisk Ungdom', image: sitePath('assets/astronomisk-ungdom.png'), url: 'https://www.astronomiskungdom.se/' },
  { name: 'Tranemo Workwear', image: sitePath('assets/tranemo.png'), url: 'https://www.tranemoworkwear.se/' },
  { name: 'Axjo', image: sitePath('assets/axjo.svg'), url: 'https://www.axjo.com/' },
]

export const socials = [
  { name: 'Instagram', url: 'https://www.instagram.com/caesarchalmers/' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/caesar-chalmers' },
  { name: 'Facebook', url: 'https://www.facebook.com/ChalmersCAESAR' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@caesarchalmers' },
]
