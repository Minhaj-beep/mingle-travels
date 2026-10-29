import credits from './credits.json'

const LICENSES = {
  'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
}

// Several files reuse the same source photo at different sizes; list each source once
const seen = new Set()
const list = document.getElementById('credits')
credits
  .filter((c) => !seen.has(c.url) && seen.add(c.url))
  .forEach((c) => {
    const li = document.createElement('li')
    li.innerHTML = `<img alt="" loading="lazy" /><div><a target="_blank" rel="noopener"></a><span></span><span><a target="_blank" rel="noopener license"></a></span></div>`
    const [img] = li.getElementsByTagName('img')
    const [title, license] = li.getElementsByTagName('a')
    const [author] = li.getElementsByTagName('span')
    img.src = `/images/${c.file}`
    title.href = c.url
    title.textContent = c.title
    author.textContent = `by ${c.author}`
    license.href = LICENSES[c.license]
    license.textContent = c.license
    list.append(li)
  })
