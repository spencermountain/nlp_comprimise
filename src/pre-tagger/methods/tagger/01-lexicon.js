const setTag = function (term, tag) {
  term.tags = term.tags || new Set()
  if (typeof tag === 'string') {
    term.tags.add(tag)
  } else {
    tag.forEach(tg => term.tags.add(tg))
  }
}

// scan-ahead to match multiple-word terms - 'jack rabbit'
const checkMulti = function (terms, i, lexicon) {
  let max = i + 4 > terms.length ? terms.length - i : 4
  let str = terms[i].normal
  for (let skip = 1; skip < max; skip += 1) {
    str += ' ' + terms[i + skip].normal
    if (lexicon.hasOwnProperty(str) === true) {
      let tag = lexicon[str]
      terms.slice(i, i + skip + 1).forEach(term => setTag(term, tag))
      return skip
    }
  }
  return 0
}

// tag any words in our lexicon
const checkLexicon = function (terms, model) {
  const multi = model._multiCache
  const lexicon = model.lexicon
  // basic lexicon lookup
  for (let i = 0; i < terms.length; i += 1) {
    let t = terms[i]
    // multi-word lookup
    if (terms[i + 1] !== undefined && multi.has(t.normal) === true) {
      let skip = checkMulti(terms, i, lexicon)
      i += skip
      if (skip > 0) {
        continue
      }
    }
    // look at implied words in contractions
    if (t.implicit !== undefined) {
      if (lexicon[t.implicit] !== undefined && lexicon.hasOwnProperty(t.implicit)) {
        let tag = lexicon[t.implicit]
        setTag(t, tag)
        continue
      }
    }
    // normal lexicon lookup
    if (lexicon[t.normal] !== undefined && lexicon.hasOwnProperty(t.normal)) {
      let tag = lexicon[t.normal]
      setTag(t, tag)
      continue
    }
  }
}
export default checkLexicon