import { useEffect } from 'react'
import Arrow from '../components/Arrow'
import { sitePath } from '../paths'
import '../support.css'

const swishURL = 'https://app.swish.nu/1/p/sw/?sw=1231145127&msg=G%C3%A5va'

export default function Support() {
  useEffect(() => {
    const previousTitle = document.title
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = description?.content
    document.title = 'Support Us | CAESAR'
    if (description) description.content = 'Support CAESAR with a donation via Swish. Scan the QR code or open Swish on your phone. Swish number: 123 114 51 27.'
    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) description.content = previousDescription
    }
  }, [])

  return <section className="support-page" aria-labelledby="support-title">
    <div className="container">
      <a className="text-link support-back" href={sitePath()}><span aria-hidden="true">←</span> Back to home</a>
      <div className="support-grid">
        <div className="support-story">
          <p className="eyebrow"><span className="status-dot" /> Support Us / CAESAR</p>
          <h1 id="support-title">Your gift.<br /><span>Our next <br />discovery.</span></h1>
          <p className="support-lead">Be part of our journey towards space. Your donation helps CAESAR keep building, testing and exploring together.</p>
          <div className="support-instructions"><span className="eyebrow">Donate via Swish</span><p>Scan the QR code with Swish to support CAESAR. Choose the amount you would like to give.</p><p className="support-mobile-help">On your phone, tap <strong>Open Swish</strong> to go straight to the payment.</p></div>
          <p className="support-thanks">Thank you for making our journey possible.</p>
        </div>
        <div className="support-payment" aria-labelledby="support-payment-title">
          <div className="support-payment-heading"><span className="eyebrow">Help us take the next step</span><h2 id="support-payment-title">Support CAESAR with Swish</h2></div>
          <figure className="support-qr"><img src={sitePath('assets/swish-qr.png')} alt="Scan the Swish QR code to donate to CAESAR" width="500" height="500" /></figure>
          <div className="support-number"><span>Swish number</span><strong>123 114 51 27</strong><span>Payment purpose: Donation</span></div>
          <a className="button button-primary support-open-swish" href={swishURL}>Open Swish <Arrow diagonal /></a>
          <p className="support-payment-note">Any amount. Every contribution matters.</p>
        </div>
      </div>
    </div>
  </section>
}
