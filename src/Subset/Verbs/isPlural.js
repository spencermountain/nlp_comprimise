// spencer walks -> singular
// we walk -> plural

// the most-recent noun-phrase, before this verb.
const findNoun = function (vb) {
  let noun = vb.lookBehind('#Noun+').last()
  return noun
}

//sometimes you can tell if a verb is plural/singular, just by the verb
// i am / we were
// othertimes you need its subject 'we walk' vs 'i walk'
const isPlural = function (parsed) {
  let vb = parsed.verb
  if (vb.has('(are|were|does)') || parsed.auxiliary.has('(are|were|does)')) {
    return true
  }

  //consider its prior noun
  let noun = findNoun(vb)
  if (noun.has('(he|she|many|both)')) {
    return false
  }
  if (noun.has('(we|they|you|i)')) {
    return true
  }
  if (noun.has('#Person')) {
    return false
  }
  if (noun.has('#Plural')) {
    return true
  }
  if (noun.has('#Singular')) {
    return false
  }
  if (vb.has('(is|am|do|was)')) {
    return false
  }
  if (parsed.auxiliary.has('(is|am|do|was)') && !parsed.negative.found) {
    return false
  }
  return null
}
module.exports = isPlural
