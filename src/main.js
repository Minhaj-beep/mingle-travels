import './style.css'

const WHATSAPP_NUMBER = '919577002424'
const root = document.documentElement
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const introDelay = root.classList.contains('seen') || reduceMotion ? 150 : 1900

const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]

/* ---------- Nav: active page, scrolled state, hide on scroll down, mobile menu ---------- */
const nav = $('.nav')
const toggle = $('.nav__toggle')
const page = location.pathname.replace(/\/$/, '/index.html').split('/').pop() || 'index.html'
$$('.nav__links a').forEach((a) => {
  const href = a.getAttribute('href').replace(/^\/$/, '/index.html').split('/').pop()
  if (href === page) a.setAttribute('aria-current', 'page')
})

let lastY = window.scrollY
const progress = $('.progress')
const onScroll = () => {
  const y = window.scrollY
  nav.classList.toggle('scrolled', y > 40)
  nav.classList.toggle('hidden', y > 500 && y > lastY && !nav.classList.contains('open'))
  lastY = y
  const max = root.scrollHeight - window.innerHeight
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`
}
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

const setMenu = (open) => {
  nav.classList.toggle('open', open)
  toggle.setAttribute('aria-expanded', String(open))
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
  document.body.style.overflow = open ? 'hidden' : ''
}
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')))
$$('.nav__links a').forEach((a) => a.addEventListener('click', () => setMenu(false)))
document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false))

/* ---------- Split headline words for the rising-text effect ---------- */
$$('[data-split]').forEach((el) => {
  let i = 0
  const wrap = (node) => {
    ;[...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment()
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) return frag.append(' ')
          const word = document.createElement('span')
          word.className = 'word'
          word.innerHTML = `<span style="--i:${i++}"></span>`
          word.firstChild.textContent = part
          frag.append(word)
        })
        child.replaceWith(frag)
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        wrap(child)
      }
    })
  }
  wrap(el)
  el.classList.add('split')
  el.style.setProperty('--base', `${el.closest('.hero, .page-hero') ? introDelay : 0}ms`)
})

/* ---------- Reveal on scroll ---------- */
const revealer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('in')
      revealer.unobserve(entry.target)
    }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
)
$$('[data-reveal], .split, .collage figure').forEach((el) => revealer.observe(el))

// Stagger children marked with data-stagger
$$('[data-stagger]').forEach((group) =>
  [...group.children].forEach((child, i) => {
    child.setAttribute('data-reveal', child.getAttribute('data-reveal') || '')
    child.style.setProperty('--d', `${i * 0.09}s`)
    revealer.observe(child)
  })
)

/* ---------- Animated counters ---------- */
const counter = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const el = entry.target
      const end = parseFloat(el.dataset.count)
      const decimals = (el.dataset.count.split('.')[1] || '').length
      const suffix = el.dataset.suffix || ''
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min((now - start) / 1800, 1)
        const eased = 1 - Math.pow(1 - t, 4)
        el.textContent = (end * eased).toFixed(decimals) + suffix
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      counter.unobserve(el)
    }),
  { threshold: 0.6 }
)
$$('[data-count]').forEach((el) => counter.observe(el))

/* ---------- Parallax ---------- */
const parallaxEls = $$('[data-parallax], .page-hero > img, .band > img')
if (parallaxEls.length && !reduceMotion) {
  let ticking = false
  const update = () => {
    const vh = window.innerHeight
    parallaxEls.forEach((el) => {
      const box = el.parentElement.getBoundingClientRect()
      if (box.bottom < 0 || box.top > vh) return
      const speed = parseFloat(el.dataset.parallax || 0.25)
      const offset = (box.top + box.height / 2 - vh / 2) * speed
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
    })
    ticking = false
  }
  update()
  window.addEventListener('scroll', () => {
    if (!ticking) requestAnimationFrame(update)
    ticking = true
  }, { passive: true })
}

/* ---------- Magnetic buttons (pointer devices only) ---------- */
if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
  $$('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) * 0.25
      const y = (e.clientY - r.top - r.height / 2) * 0.35
      btn.style.transform = `translate(${x}px, ${y}px)`
    })
    btn.addEventListener('pointerleave', () => (btn.style.transform = ''))
  })
}

/* ---------- Home hero slideshow ---------- */
const hero = $('.hero')
if (hero) {
  const slides = $$('.hero__slide', hero)
  const dots = $$('.hero__dots button', hero)
  const place = $('.hero__place', hero)
  let current = 0
  let timer
  const show = (n) => {
    slides[current].classList.remove('active')
    dots[current]?.classList.remove('active')
    current = (n + slides.length) % slides.length
    slides[current].classList.add('active')
    // Restart the dot fill animation
    const dot = dots[current]
    if (dot) {
      dot.classList.remove('active')
      void dot.offsetWidth
      dot.classList.add('active')
    }
    place.textContent = slides[current].dataset.place
    clearTimeout(timer)
    timer = setTimeout(() => show(current + 1), 7000)
  }
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)))
  setTimeout(() => show(0), introDelay - 150)
}

/* ---------- Draggable horizontal scroller ---------- */
$$('[data-scroller]').forEach((wrap) => {
  const track = $('.scroller', wrap)
  const step = () => track.querySelector('.tcard').offsetWidth + 24
  $('[data-prev]', wrap)?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }))
  $('[data-next]', wrap)?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }))

  let startX = 0
  let startScroll = 0
  let down = false
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return
    down = true
    startX = e.clientX
    startScroll = track.scrollLeft
  })
  window.addEventListener('pointermove', (e) => {
    if (!down) return
    const dx = e.clientX - startX
    if (Math.abs(dx) > 5) track.classList.add('dragging')
    track.scrollLeft = startScroll - dx
  })
  window.addEventListener('pointerup', () => {
    down = false
    // Let the click on a card be swallowed if we were dragging
    setTimeout(() => track.classList.remove('dragging'), 0)
  })
})

/* ---------- Rotating testimonials ---------- */
$$('[data-quotes]').forEach((wrap) => {
  const quotes = $$('.quote', wrap)
  const dotsWrap = $('.quote-dots', wrap.parentElement)
  let i = 0
  let timer
  const dots = quotes.map((_, n) => {
    const b = document.createElement('button')
    b.setAttribute('aria-label', `Show review ${n + 1}`)
    b.addEventListener('click', () => go(n))
    dotsWrap.append(b)
    return b
  })
  const go = (n) => {
    quotes[i].classList.remove('active')
    dots[i].classList.remove('active')
    i = n % quotes.length
    quotes[i].classList.add('active')
    dots[i].classList.add('active')
    clearTimeout(timer)
    timer = setTimeout(() => go(i + 1), 6000)
  }
  go(0)
})

/* ---------- Tour filters ---------- */
const chips = $$('.chip')
if (chips.length) {
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.toggle('active', c === chip))
      const region = chip.dataset.filter
      $$('.tour').forEach((tour) => {
        const match = region === 'all' || tour.dataset.region === region
        tour.classList.toggle('is-hidden', !match)
        if (match) {
          tour.classList.remove('in')
          requestAnimationFrame(() => requestAnimationFrame(() => tour.classList.add('in')))
        }
      })
    })
  )
}

/* ---------- Gallery lightbox ---------- */
const items = $$('[data-lightbox]')
if (items.length) {
  const box = document.createElement('div')
  box.className = 'lightbox'
  box.setAttribute('role', 'dialog')
  box.setAttribute('aria-modal', 'true')
  box.innerHTML = `
    <figure><img alt="" /><figcaption></figcaption></figure>
    <button class="lb-close" aria-label="Close">✕</button>
    <button class="lb-prev" aria-label="Previous photo">←</button>
    <button class="lb-next" aria-label="Next photo">→</button>`
  document.body.append(box)
  const img = $('img', box)
  const cap = $('figcaption', box)
  let idx = 0
  const open = (n) => {
    idx = (n + items.length) % items.length
    const src = items[idx].querySelector('img')
    img.src = src.src
    img.alt = src.alt
    cap.textContent = items[idx].dataset.lightbox
    box.classList.add('open')
    document.body.style.overflow = 'hidden'
  }
  const close = () => {
    box.classList.remove('open')
    document.body.style.overflow = ''
    items[idx].focus()
  }
  items.forEach((item, n) => item.addEventListener('click', () => open(n)))
  $('.lb-close', box).addEventListener('click', close)
  $('.lb-prev', box).addEventListener('click', () => open(idx - 1))
  $('.lb-next', box).addEventListener('click', () => open(idx + 1))
  box.addEventListener('click', (e) => e.target === box && close())
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowLeft') open(idx - 1)
    if (e.key === 'ArrowRight') open(idx + 1)
  })
}

/* ---------- Enquiry form → WhatsApp ---------- */
const form = $('#enquiry')
if (form) {
  const tour = new URLSearchParams(location.search).get('tour')
  if (tour) {
    form.service.value = 'Tour package'
    form.message.value = `I'm interested in the "${tour}" tour.`
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form))
    const lines = [
      'Hello Mingle Travels, I would like to make an enquiry.',
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Interested in: ${data.service}`,
      data.date && `Travel date: ${data.date}`,
      data.people && `Travellers: ${data.people}`,
      data.message && `Details: ${data.message}`,
    ].filter(Boolean)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener')
  })
}

$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))
