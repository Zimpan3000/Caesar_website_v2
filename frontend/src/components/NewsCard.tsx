import { news } from '../data/site'
import Arrow from './Arrow'

export default function NewsCard({ item }: { item: typeof news[number] }) {
  const date = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(item.date))
  return <article className="news-card" data-reveal><a className="news-link" href={item.url}><div className="news-image"><img src={item.image} alt={item.alt} width="1024" height="640" loading="lazy" /><span className="news-image-arrow"><Arrow diagonal /></span></div><div className="news-meta"><span>{item.category}</span><time dateTime={item.date}>{date}</time></div><h3>{item.title}</h3><p>{item.description}</p><span className="news-read">Läs mer <Arrow /></span></a></article>
}
