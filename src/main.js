import './style.css'

const WHATSAPP_NUMBER = '919577002424'

const nav = document.querySelector('.nav')
const toggle = document.querySelector('.nav__toggle')

// Solid nav background once the user scrolls past the hero top
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40)
onScroll()
window.addEventListener('scroll', onScroll, { passive: true })

// Mobile menu
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open')
  toggle.setAttribute('aria-expanded', String(open))
})
document.querySelectorAll('.nav__links a').forEach((link) =>
  link.addEventListener('click', () => {
    nav.classList.remove('open')
    toggle.setAttribute('aria-expanded', 'false')
  })
)

// Fade cards in as they scroll into view
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.15 }
)
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

// Enquiry form opens WhatsApp with the details pre-filled
document.getElementById('enquiry').addEventListener('submit', (e) => {
  e.preventDefault()
  const data = Object.fromEntries(new FormData(e.target))
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

document.getElementById('year').textContent = new Date().getFullYear()
