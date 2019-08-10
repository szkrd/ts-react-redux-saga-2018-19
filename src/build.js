const fs = require('fs')
const {promisify} = require('util')
const path = require('path')
const hljs = require('highlight.js')
const marked = promisify(require('marked'))
const ejs = require('ejs')

const fsCopyFile = promisify(fs.copyFile)
const fsReadDir = promisify(fs.readdir)
const fsStat = promisify(fs.stat)
const fsMkDir = promisify(fs.mkdir)
const fsWriteFile = promisify(fs.writeFile)

marked.setOptions({
  highlight: function(code, lang) {
    return lang === 'text' ? code : hljs.highlight(lang, code).value
  }
})

// ---

function escapeRex (s = '') {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

async function walkDir (dir, fileList = []) {
  const files = await fsReadDir(dir)
  for (const file of files) {
    const stat = await fsStat(path.join(dir, file))
    if (stat.isDirectory()) fileList = await walkDir(path.join(dir, file), fileList)
    else fileList.push(path.join(dir, file))
  }
  return fileList
}

// ---------------------------------------------------------------------------------------------------------------------

async function main () {
  const packageJson = JSON.parse(fs.readFileSync('./package.json'))
  const { buildVersion } = packageJson
  const list = await walkDir('./book')
  for (let i = 0; i < list.length; i++) {
    const source = list[i]
    const baseName = path.basename(source)
    const extName = path.extname(baseName).replace(/^\./, '')

    // create target directories (book -> docs)
    let target = source.replace(/^book/, 'docs')
    const depth = target.split(path.sep).length - 1
    const relativeRoot = new Array(depth).join('../')
    const targetPathOnly = target.replace(new RegExp(escapeRex(baseName) + '$'), '')
    await fsMkDir(targetPathOnly, { recursive: true })

    // prep the ejs renderer, fix paths
    let ejsSource = fs.readFileSync('./overlay/index.ejs', 'utf-8')
    const ejsTemplate = ejs.compile(ejsSource, {
      fileName: 'index.ejs'
    })

    // convert md files to html
    if (baseName.endsWith('.md')) {
      target = target.replace(/\.md$/, '.html')
      if (baseName === 'README.md') {
        target = target.replace(/README\.html$/, 'index.html')
      }
      const contents = fs.readFileSync(source, 'utf-8')
      let md = await marked(contents)
      md = md.replace(/<pre>/g, '<pre class="hljs">') // such custom renderer, very lazy
      await fsWriteFile(target, ejsTemplate({ md, v: buildVersion, root: relativeRoot }))
    }

    // copy binaries
    const copyOperation = []
    if (['png', 'jpg'].includes(extName)) {
      copyOperation.push(fsCopyFile(source, target))
    }
    await Promise.all(copyOperation)

    //console.log(i, target)
  }

  // copy overlay files
  const hljsTheme = 'darcula' // 'github-gist'
  await Promise.all([
    fsCopyFile('./overlay/reset.css', './docs/reset.css'),
    fsCopyFile('./overlay/main.css', './docs/main.css'),
    fsCopyFile('./overlay/markdown.css', './docs/markdown.css'),
    fsCopyFile(`./node_modules/highlight.js/styles/${hljsTheme}.css`, './docs/hljs-theme.css')
  ])
}

main().catch((error) => {
  console.error(error)
})
