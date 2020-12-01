const parseDate = require('./parseDate/parse')
const Unit = require('./parseDate/units/Unit')

const punt = function (unit, context) {
  unit = unit.applyShift(context.punt)
  return unit
}

//
const parseRange = function (doc, context) {
  // two explicit dates - 'between 9am and 10am on friday'

  // two explicit dates - 'between friday and sunday'
  let m = doc.match('between [<start>*] and [<end>*]')
  if (m.found) {
    let start = m.groups('start')
    start = parseDate(start, context)
    let end = m.groups('end')
    end = parseDate(end, context)
    if (start && end) {
      return {
        start: start,
        end: end.end(),
      }
    }
  }

  // two months, no year - 'june 5 to june 7'
  m = doc.match('[<from>#Month #Value] (to|through|thru) [<to>#Month #Value] [<year>#Year?]')
  if (m.found) {
    let res = m.groups()
    let start = res.from
    if (res.year) {
      start = start.concat(res.year)
    }
    start = parseDate(start, context)
    if (start) {
      let end = res.to
      if (res.year) {
        end = end.concat(res.year)
      }
      end = parseDate(end, context)
      // reverse the order?
      if (start.d.isAfter(end.d)) {
        let tmp = start
        start = end
        end = tmp
      }
      return {
        start: start,
        end: end.end(),
      }
    }
  }

  // one month, one year, first form - 'january 5 to 7 1998'
  m = doc.match('[<month>#Month] [<from>#Value] (to|through|thru) [<to>#Value] of? [<year>#Year]')
  if (m.found) {
    let { month, from, to, year } = m.groups()
    let year2 = year.clone()
    let start = from.prepend(month.text()).append(year.text())
    start = parseDate(start, context)
    if (start) {
      let end = to.prepend(month.text()).append(year2)
      end = parseDate(end, context)
      return {
        start: start,
        end: end.end(),
      }
    }
  }

  // one month, one year, second form - '5 to 7 of january 1998'
  m = doc.match('[<from>#Value] (to|through|thru) [<to>#Value of? #Month of? #Year]')
  if (m.found) {
    let to = m.groups('to')
    to = parseDate(to, context)
    if (to) {
      let fromDate = m.groups('to')
      let from = to.clone()
      from.d = from.d.date(fromDate.text('normal'))
      return {
        start: from,
        end: to.end(),
      }
    }
  }
  // one month, no year - '5 to 7 of january'
  m = doc.match('[<from>#Value] (to|through|thru) [<to>#Value of? #Month]')
  if (m.found) {
    let to = m.groups('to')
    to = parseDate(to, context)
    if (to) {
      let fromDate = m.groups('from')
      let from = to.clone()
      from.d = from.d.date(fromDate.text('normal'))
      return {
        start: from,
        end: to.end(),
      }
    }
  }
  // one month, no year - 'january 5 to 7'
  m = doc.match('[<from>#Month #Value] (to|through|thru) [<to>#Value]')
  if (m.found) {
    let from = m.groups('from')
    from = parseDate(from, context)
    if (from) {
      let toDate = m.groups('to')
      let to = from.clone()
      to.d = to.d.date(toDate.text('normal'))
      return {
        start: from,
        end: to.end(),
      }
    }
  }
  // 'from A to B'
  m = doc.match('from? [<from>*] (to|until|upto|through|thru) [<to>*]')
  if (m.found) {
    let from = m.groups('from')
    let to = m.groups('to')
    from = parseDate(from, context)
    to = parseDate(to, context)
    if (from && to) {
      return {
        start: from,
        end: to.end(),
      }
    }
  }

  // 'before june'
  m = doc.match('^due? (by|before) [*]', 0)
  if (m.found) {
    let unit = parseDate(m, context)
    if (unit) {
      let start = new Unit(context.today, null, context)
      if (start.d.isAfter(unit.d)) {
        start = unit.clone().applyShift({ weeks: -2 })
      }
      // end the night before
      let end = unit.clone().applyShift({ day: -1 })
      return {
        start: start,
        end: end.end(),
      }
    }
  }

  // 'in june'
  m = doc.match('^(on|in|at|@) [*]', 0)
  if (m.found) {
    let unit = parseDate(m, context)
    if (unit) {
      return { start: unit, end: unit.clone().end() }
    }
  }

  // 'after june'
  m = doc.match('^(after|following) [*]', 0)
  if (m.found) {
    let unit = parseDate(m, context)
    if (unit) {
      unit = unit.after()
      return {
        start: unit.clone(),
        end: punt(unit.clone(), context),
      }
    }
  }

  // 'in june'
  m = doc.match('^(on|during|in) [*]', 0)
  if (m.found) {
    let unit = parseDate(m, context)
    if (unit) {
      return {
        start: unit,
        end: unit.clone().end(),
      }
    }
  }
  //else, try whole thing
  let unit = parseDate(doc, context)
  if (unit) {
    return {
      start: unit,
      end: unit.clone().end(),
    }
  }
  return {
    start: null,
    end: null,
  }
}
module.exports = parseRange
