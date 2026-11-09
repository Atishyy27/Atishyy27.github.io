/* Self-contained board page. Rows come from the sheet, so they are rendered
   with textContent only, never innerHTML. No backticks or template
   placeholders inside the page script, since it lives in a template literal. */
export const BOARD_SCRIPT = `
const out=document.getElementById("out");
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function pick(row,names){for(const k of Object.keys(row)){if(names.includes(k.toLowerCase())&&row[k]!=="")return row[k]}return ""}
function card(row){
  const c=el("div","card");
  const tag=pick(row,["tag"]);
  c.append(el("div","t",(tag?tag+"  ":"")+(pick(row,["task","title","name"])||"")));
  const f=function(k,l){const v=pick(row,[k]);return v&&(l+v)};
  const meta=[f("owner",""),f("priority","priority "),f("date",""),f("time",""),f("minutes","")&&(pick(row,["minutes"])+" min")].filter(Boolean).join("  |  ");
  if(meta)c.append(el("div","m",meta));
  const notes=pick(row,["note","notes"]);
  if(notes)c.append(el("div","n",notes));
  return c;
}
fetch("/api/tasks",{credentials:"same-origin"}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).then(function(d){
  out.textContent="";
  if(!d.rows.length){out.textContent="No tasks.";return}
  const key=d.headers.find(function(h){return h.toLowerCase()==="status"});
  if(!key){d.rows.forEach(function(r){out.append(card(r))});return}
  const groups=new Map();
  d.rows.forEach(function(r){const g=r[key]||"No status";if(!groups.has(g))groups.set(g,[]);groups.get(g).push(r)});
  groups.forEach(function(rows,g){out.append(el("h2","",g+" ("+rows.length+")"));rows.forEach(function(r){out.append(card(r))})});
}).catch(function(e){out.textContent="Could not load tasks ("+e.message+")"});
`;

export const BOARD_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Board</title>
<style>
:root{--bg:#fff;--fg:#1a1a1a;--mut:#6b6b6b;--card:#f6f6f6;--line:#e2e2e2}
@media (prefers-color-scheme:dark){:root{--bg:#111;--fg:#ececec;--mut:#9a9a9a;--card:#1b1b1b;--line:#2a2a2a}}
body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:760px;margin:0 auto}
h1{font-size:20px;margin:0 0 20px}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:24px 0 8px}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 12px;margin-bottom:8px}
.t{font-weight:600}.m{color:var(--mut);font-size:13px;margin-top:2px}.n{margin-top:4px;white-space:pre-wrap}
</style></head><body><main><h1>Board</h1><div id="out">Loading...</div></main>
<script>
${BOARD_SCRIPT}</script></body></html>`;
