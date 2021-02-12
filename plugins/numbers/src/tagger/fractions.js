const multiples =
  '(hundred|thousand|million|billion|trillion|quadrillion|quintillion|sextillion|septillion)'
const here = 'fraction-tagger'

// plural-ordinals like 'hundredths' are already tagged as Fraction by compromise
const tagFractions = function (doc) {
  doc.match('(half|quarter)').tag('Fraction', 'millionth')

  // a fifth
  doc.match('a (#Ordinal|#Fraction)').tag('Fraction', 'a-quarter')
  // seven fifths
  doc.match('#Value+ (#Ordinal|half|quarter|#Fraction)').tag('Fraction', '4-fifths')
  // 12 and seven fifths
  doc.match('#Value+ and #Value+ (#Ordinal|half|quarter|#Fraction)').tag('Fraction', 'val-and-ord')

  // fixups
  doc.match('#Cardinal+? (second|seconds)').unTag('Fraction', '3 seconds')
  doc.match('#Ordinal (half|quarter)').unTag('Fraction', '2nd quarter')
  doc.match('#Ordinal #Ordinal+').unTag('Fraction')
  doc.match('[#Cardinal+? (second|seconds)] of (a|an)', 0).tag('Fraction', here)
  doc.match(multiples).tag('#Multiple', here)

  //  '3 out of 5'
  doc.match('#Cardinal+ out of every? #Cardinal').tag('Fraction', here)
  // one and a half
  doc.match('#Cardinal and a (#Fraction && #Value)').tag('Fraction', here)
  // fraction - 'a third of a slice'
  // TODO:fixme
  // m = doc.match(`[(#Cardinal|a) ${ordinals}] of (a|an|the)`, 0).tag('Fraction', 'ord-of')
  // tag 'thirds' as a ordinal
  // m.match('.$').tag('Ordinal', 'plural-ordinal')
  return doc
}
module.exports = tagFractions