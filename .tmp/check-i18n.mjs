import es from "../messages/es.json" with { type: "json" }
import en from "../messages/en.json" with { type: "json" }

function flat(o, p = "") {
  return Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? flat(v, p + k + ".") : [p + k]
  )
}

const a = new Set(flat(es))
const b = new Set(flat(en))
console.log("es=" + a.size + " en=" + b.size)
console.log("only-es:", [...a].filter((k) => !b.has(k)))
console.log("only-en:", [...b].filter((k) => !a.has(k)))
