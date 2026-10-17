import { useEffect } from 'react'

export default function usePageMeta(title, description) {
  useEffect(() => {
    // Title
    document.title = title
      ? `${title} | Stuumo`
      : 'Stuumo — Find Verified Tutors Worldwide'

    // Description
    const desc = description || 'Stuumo connects verified, certificate-checked teachers with parents and learners worldwide for private tutoring and live online sessions.'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = desc

    // OG tags
    const og = { 'og:title': document.title, 'og:description': desc, 'og:type': 'website', 'og:site_name': 'Stuumo' }
    Object.entries(og).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.content = content
    })

    return () => { document.title = 'Stuumo — Find Verified Tutors Worldwide' }
  }, [title, description])
}