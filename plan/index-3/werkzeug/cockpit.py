"""Cockpit oben im Index 3.0: abhaken, nächster Schritt, Bestelltermine, Anbietervergleich, BPMN-Ansicht.

Speicher (Fähigkeit db): status/{id}, angebote/{id}, wahl/AP-C1, werte/node001. Nichts wird bestellt oder verschickt.
Die Termine rechnet die Seite aus dem Netz (netz.py) und den eingetragenen Werten; fehlende Werte bleiben „offen“.
"""
import json

CSS = r'''
#cockpit { margin:0 0 34px } #cockpit h2 { margin-bottom:6px }
.ck-note { font-size:13px; color:var(--muted) } .ck-warn { color:#a03a1a; font-weight:600 }
.ck-prog { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px; margin:12px 0 }
.ck-prog > div { border:1px solid var(--line); background:var(--surface); padding:8px 10px; border-radius:6px; font-size:13px }
.ck-prog b { display:block; font-size:13px; color:var(--ink) } .ck-bar { height:6px; background:var(--line); border-radius:3px; margin-top:6px; overflow:hidden } .ck-bar i { display:block; height:100%; background:var(--go) }
.ck-h3 { margin:22px 0 8px; font-size:17px }
.ck-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr)); gap:10px }
.ck-card { border:1px solid var(--line); background:var(--surface); border-radius:8px; padding:10px 12px; display:flex; flex-direction:column; gap:6px; min-width:0 }
.ck-card.krit { border-color:#c4542c } .ck-card .ck-id { font-family:var(--mono); font-size:11.5px; color:var(--muted) }
.ck-card h4 { margin:0; font-size:15px; color:var(--ink) } .ck-card .ck-meta { font-size:12.5px; color:var(--muted) }
.ck-row { display:flex; gap:6px; flex-wrap:wrap; align-items:center } .ck-row label { font-size:12px; color:var(--muted) }
.ck-card textarea, .ck-card input, .ck-tab input, .ck-tab select, .ck-werte input { font:inherit; font-size:13px; padding:4px 6px; border:1px solid var(--line); border-radius:4px; background:var(--bg); color:var(--ink); max-width:100% }
.ck-card textarea { width:100%; min-height:44px; resize:vertical }
.ck-btn { font:inherit; font-size:13px; padding:4px 10px; border:1px solid var(--line); border-radius:4px; background:var(--bg); color:var(--ink); cursor:pointer }
.ck-btn.go { background:var(--go-bg); border-color:var(--go); color:var(--ink) } .ck-btn:disabled { opacity:.5; cursor:default }
.ck-tw { overflow-x:auto; border:1px solid var(--line); border-radius:6px; background:var(--surface) }
.ck-tab { border-collapse:collapse; width:100%; font-size:13px } .ck-tab th, .ck-tab td { padding:6px 8px; border-top:1px solid var(--line); text-align:left; vertical-align:top } .ck-tab thead th { border-top:0; font-size:11.5px; color:var(--muted); font-weight:500 }
.ck-tab tr.ck-sel td { background:var(--go-bg) } .ck-tab td.bad { color:#a03a1a; font-weight:600 } .ck-tab input { width:7em }
.ck-werte { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:8px } .ck-werte label { display:flex; flex-direction:column; font-size:12px; color:var(--muted); gap:3px }
.ck-order { border:2px solid var(--go); border-radius:8px; padding:12px 14px; background:var(--surface); display:grid; gap:6px }
.ck-order .big { font-size:20px; font-weight:600; color:var(--ink) }
.ck-bpwrap { overflow:auto; border:1px solid var(--line); border-radius:6px; background:#fff; max-height:70vh }
svg.bp { display:block; font-family:var(--font, system-ui, sans-serif) }
.bp-lane0 { fill:#f7f8f6 } .bp-lane1 { fill:#eef1ec } .bp-lanet { font-size:11px; fill:#5b6b63; font-weight:600 } .bp-abt { font-size:12px; fill:#1d3a2c; font-weight:700 } .bp-sep { stroke:#c9d2cb; stroke-dasharray:4 4 }
.bp-e { fill:none; stroke:#9aa59f; stroke-width:1.2 } .bp-pfs { fill:#9aa59f } .bp-e.krit { stroke:#c4542c; stroke-width:2 }
.bp-s { fill:#fff; stroke:#7d8a83; stroke-width:1.3 } .bp-s2 { fill:none; stroke:#7d8a83 } .bp-ic { fill:none; stroke:#7d8a83 } .bp-t { font-size:10.5px; fill:#1b2a23; text-anchor:middle }
.bp-n { cursor:pointer } .bp-n.st-erledigt .bp-s { fill:#dcefe2; stroke:#2e7d4f } .bp-n.st-dran .bp-s { fill:#fff4d6; stroke:#b07a00; stroke-width:2.4 } .bp-n.st-arbeit .bp-s { fill:#e3edf8; stroke:#2c5378; stroke-width:2 }
.bp-n.krit .bp-s { stroke:#c4542c; stroke-width:2.6 }
.ck-leg { display:flex; gap:12px; flex-wrap:wrap; font-size:12px; color:var(--muted); margin:6px 0 } .ck-leg span::before { content:""; display:inline-block; width:12px; height:12px; border:1.5px solid; border-radius:3px; margin-right:5px; vertical-align:-2px }
.ck-leg .l1::before { background:#dcefe2; border-color:#2e7d4f } .ck-leg .l2::before { background:#fff4d6; border-color:#b07a00 } .ck-leg .l3::before { background:#e3edf8; border-color:#2c5378 } .ck-leg .l4::before { background:#fff; border-color:#c4542c }
'''

HTML = r'''<section id="cockpit"><h2>Cockpit: wo wir stehen, was jetzt dran ist</h2>
<p class="lede2">Abhaken, Ergebnis eintragen, weiter. Der Plan rechnet die Termine aus dem Netz und euren Einträgen neu: frühester Start vorwärts, spätester Start rückwärts vom Zieltermin für den Montagebeginn. Was fehlt, steht als „offen“ mit dem Wert, der fehlt. Bestellt wird von Hand über den Link des gewählten Anbieters.</p>
<p class="ck-note" id="ck-status">Lädt …</p>
<div class="ck-prog" id="ck-prog"></div>
<h3 class="ck-h3" id="ck-jetzt">Jetzt dran</h3>
<p class="ck-note">Alle Schritte, deren Vorgänger erledigt sind. Mehr zu jedem Schritt (Unterlagen, Auftrag für die KI) im Baum unten.</p>
<div class="ck-cards" id="ck-cards"></div>
<h3 class="ck-h3" id="ck-bestellung">Bestellung der Objekte: Anbieter, Lieferzeit, Bestelltag</h3>
<div class="ck-order" id="ck-order"></div>
<h4 style="margin:14px 0 6px">Werte für die Rechnung</h4>
<div class="ck-werte" id="ck-werte"></div>
<h4 style="margin:14px 0 6px">Angebote vergleichen (AP-C1)</h4>
<p class="ck-note">Je Angebot: Lieferzeit, Lieferform und Maße des größten Teils. Ein Angebot, dessen größtes Teil über dem Wert aus der Streckenmessung (AP-A0) liegt, wird rot markiert. Die Wahl setzt die Lieferzeit in die Rechnung.</p>
<div class="ck-tw"><table class="ck-tab" id="ck-ang"><thead><tr><th>Wahl</th><th>Anbieter</th><th>Herkunft</th><th>Lieferzeit Tage</th><th>Lieferform</th><th>Montage oben</th><th>Größtes Teil L×B×H m</th><th>Schwerstes Teil kg</th><th>Preis</th><th>Bestell-Link</th><th>Transport</th><th></th></tr></thead><tbody></tbody></table></div>
<p><button type="button" class="ck-btn" id="ck-neu">Angebot hinzufügen</button></p>
<h3 class="ck-h3" id="ck-bpmn">Ablauf als BPMN 2.0</h3>
<div class="ck-leg"><span class="l1">erledigt</span><span class="l3">in Arbeit</span><span class="l2">jetzt dran</span><span class="l4">kritisch oder zu spät</span></div>
<p class="ck-note">Bahnen je Rolle, Abschnitte A bis H. Rechtecke sind Aufgaben, Rauten Entscheidungen und Gates, abgerundete Felder Ereignisse. Antippen springt zum Schritt im Baum. Seitlich scrollen.</p>
<div class="ck-bpwrap">__SVG__</div>
<h3 class="ck-h3" id="ck-termine">Alle Termine</h3>
<div class="ck-tw"><table class="ck-tab" id="ck-term"><thead><tr><th>Abschnitt</th><th>Schritt</th><th>Status</th><th>Frühester Start</th><th>Spätester Start</th><th>Was fehlt</th></tr></thead><tbody></tbody></table></div>
<script type="application/json" id="ck-daten">__DATEN__</script>
</section>
'''

JS = r'''<script>
(function(){
  var D = JSON.parse(document.getElementById('ck-daten').textContent);
  var K = {}; D.knoten.forEach(function(k){ K[k.id] = k; });
  var AB = {}; D.abschnitte.forEach(function(a){ AB[a[0]] = a[1]; });
  var S = {}, A = {}, WAHL = null, W = {}, db = null, me = null, schreibbar = false;
  var heute = new Date(); heute.setHours(0,0,0,0);
  var $ = function(id){ return document.getElementById(id); };
  function el(t, cls, txt){ var e = document.createElement(t); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function tage(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function fmt(d){ return d ? d.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'}) : 'offen'; }
  function datum(s){ if (!s) return null; var d = new Date(s + 'T00:00:00'); return isNaN(d) ? null : d; }
  function zahl(v){ return (v === '' || v == null || isNaN(+v)) ? null : +v; }
  function status(id){ if (id === 'frost') return (W.frost_ab && W.frost_bis) ? 'erledigt' : 'offen'; var s = S[id]; if (s && s.status) return s.status; return K[id].erledigt_im_plan ? 'erledigt' : 'offen'; }
  function gewaehlt(){ return WAHL && A[WAHL] ? A[WAHL] : null; }
  function dauer(id){
    var k = K[id], s = S[id] || {};
    if (zahl(s.dauer) != null) return {t: zahl(s.dauer)};
    if (k.param === 'lieferzeit'){ var a = gewaehlt(); return a && zahl(a.lieferzeit) != null ? {t: zahl(a.lieferzeit)} : {t: null, fehlt: 'Lieferzeit: Angebot in AP-C1 eintragen und wählen'}; }
    if (k.param === 'zoll') return zahl(W.zoll) != null ? {t: zahl(W.zoll)} : {t: null, fehlt: 'Tage für Verzollung eintragen'};
    if (k.param === 'transport') return (zahl(W.transport) != null && zahl(W.puffer) != null) ? {t: zahl(W.transport) + zahl(W.puffer)} : {t: null, fehlt: 'Tage für Transport und Puffer eintragen'};
    if (k.dauer != null) return {t: k.dauer};
    return {t: null, fehlt: 'Dauer für „' + k.titel + '“ eintragen'};
  }
  function frostfrei(d){
    if (!W.frost_ab || !W.frost_bis) return {fehlt: 'Frostfreies Fenster eintragen'};
    var a = W.frost_ab.split('-').map(Number), b = W.frost_bis.split('-').map(Number);
    for (var y = d.getFullYear(); y < d.getFullYear() + 4; y++){ var ab = new Date(y, a[0]-1, a[1]), bis = new Date(y, b[0]-1, b[1]); if (d <= bis) return {d: d < ab ? ab : d}; }
    return {fehlt: 'Frostfreies Fenster prüfen'};
  }
  function rechne(){
    var ES = {}, EF = {}, WHY = {};
    D.reihenfolge.forEach(function(id){
      var k = K[id], s = S[id] || {};
      if (id === 'frost'){ if (status(id) === 'erledigt'){ ES[id] = heute; EF[id] = heute; } else { ES[id] = null; EF[id] = null; WHY[id] = 'Frostfreies Fenster eintragen'; } return; }
      if (status(id) === 'erledigt'){ var e = datum(s.ende) || heute; ES[id] = datum(s.beginn); EF[id] = e; return; }
      var start = heute, offen = null;
      for (var i = 0; i < k.nach.length; i++){ var p = k.nach[i]; if (!EF[p]){ offen = WHY[p] || ('wartet auf ' + K[p].titel); break; } if (EF[p] > start) start = EF[p]; }
      if (offen){ ES[id] = null; EF[id] = null; WHY[id] = offen; return; }
      if (datum(s.beginn) && datum(s.beginn) > start) start = datum(s.beginn);
      if (id === 'K-MONTAGE'){ var f = frostfrei(start); if (f.fehlt){ ES[id] = null; EF[id] = null; WHY[id] = f.fehlt; return; } start = f.d; }
      var du = dauer(id); ES[id] = start; if (du.t == null){ EF[id] = null; WHY[id] = du.fehlt; } else EF[id] = tage(start, du.t);
    });
    // rückwärts vom Zieltermin Montagebeginn, nur für die Vorgänger des Montagebeginns
    var ziel = datum(W.ziel), LS = {}, LF = {}, LWHY = {}, vor = {};
    (function mark(id){ if (vor[id]) return; vor[id] = true; K[id].nach.forEach(mark); })('K-MONTAGE');
    var succ = {}; D.knoten.forEach(function(k){ k.nach.forEach(function(p){ (succ[p] = succ[p] || []).push(k.id); }); });
    D.reihenfolge.slice().reverse().forEach(function(id){
      if (!vor[id]) return;
      if (status(id) === 'erledigt'){ LS[id] = null; return; }
      var lf;
      if (id === 'K-MONTAGE'){ lf = ziel; if (!ziel) LWHY[id] = 'Zieltermin Montagebeginn eintragen'; }
      else { var ss = (succ[id] || []).filter(function(x){ return vor[x] && status(x) !== 'erledigt'; }); lf = null;
        for (var i = 0; i < ss.length; i++){ var x = LS[ss[i]]; if (!x){ lf = null; LWHY[id] = LWHY[ss[i]] || 'offen'; break; } if (!lf || x < lf) lf = x; } }
      LF[id] = lf; var du = dauer(id);
      LS[id] = (lf && du.t != null) ? tage(lf, -du.t) : null; if (lf && du.t == null) LWHY[id] = du.fehlt;
    });
    return {ES: ES, EF: EF, WHY: WHY, LS: LS, LWHY: LWHY};
  }
  function dran(id){ return id !== 'frost' && status(id) !== 'erledigt' && K[id].nach.every(function(p){ return status(p) === 'erledigt'; }); }
  function passt(a){
    var m = [zahl(W.max_l), zahl(W.max_b), zahl(W.max_h)], g = [zahl(a.l), zahl(a.b), zahl(a.h)];
    if (m.some(function(v){ return v == null; })) return {t: 'Strecke noch nicht gemessen (AP-A0)', ok: null};
    if (g.some(function(v){ return v == null; })) return {t: 'Maße fehlen', ok: null};
    var zu = ['Länge', 'Breite', 'Höhe'].filter(function(n, i){ return g[i] > m[i]; });
    if (zahl(W.max_kg) != null && zahl(a.kg) != null && zahl(a.kg) > zahl(W.max_kg)) zu.push('Gewicht');
    return zu.length ? {t: 'zu groß: ' + zu.join(', '), ok: false} : {t: 'passt', ok: true};
  }
  function speichere(pfad, patch){
    if (!db || !schreibbar) return;
    var alt = pfad.indexOf('status/') === 0 ? (S[pfad.slice(7)] || {}) : pfad.indexOf('angebote/') === 0 ? (A[pfad.slice(9)] || {}) : pfad === 'werte/node001' ? W : {};
    var neu = Object.assign({}, alt, patch, {von: me || '', am: new Date().toISOString()});
    db.doc(pfad).set(neu).catch(function(e){ $('ck-status').textContent = 'Speichern ging nicht: ' + (e && e.message || e && e.code || 'unbekannt'); });
  }
  function render(){
    var R = rechne();
    // Fortschritt
    var pg = $('ck-prog'); pg.textContent = '';
    D.abschnitte.forEach(function(a){
      var ids = D.knoten.filter(function(k){ return k.ab === a[0]; }).map(function(k){ return k.id; });
      var fertig = ids.filter(function(i){ return status(i) === 'erledigt'; }).length;
      var d = el('div'); d.appendChild(el('b', null, a[0] + ' · ' + a[1])); d.appendChild(el('span', null, fertig + ' von ' + ids.length + ' erledigt'));
      var bar = el('div', 'ck-bar'), i = el('i'); i.style.width = (ids.length ? Math.round(100 * fertig / ids.length) : 0) + '%'; bar.appendChild(i); d.appendChild(bar); pg.appendChild(d);
    });
    // Jetzt dran
    var cards = $('ck-cards'); cards.textContent = '';
    D.reihenfolge.filter(dran).forEach(function(id){
      var k = K[id], s = S[id] || {}, c = el('div', 'ck-card'); var ls = R.LS[id];
      if (ls && ls < heute) c.classList.add('krit');
      c.appendChild(el('span', 'ck-id', k.id + ' · ' + k.ab + ' ' + AB[k.ab] + ' · ' + D.arten[k.art]));
      c.appendChild(el('h4', null, k.lang));
      c.appendChild(el('span', 'ck-meta', 'Frühester Start: ' + fmt(R.ES[id]) + ' · spätester: ' + (ls ? fmt(ls) : 'offen') + (status(id) === 'in Arbeit' ? ' · in Arbeit' : '')));
      if (R.WHY[id] || R.LWHY[id]) c.appendChild(el('span', 'ck-meta', 'Fehlt: ' + (R.WHY[id] || R.LWHY[id])));
      var row = el('div', 'ck-row');
      var b1 = el('button', 'ck-btn', status(id) === 'in Arbeit' ? 'in Arbeit ✓' : 'in Arbeit'); b1.type = 'button';
      b1.onclick = function(){ speichere('status/' + id, {status: 'in Arbeit', beginn: s.beginn || new Date().toISOString().slice(0, 10)}); };
      var b2 = el('button', 'ck-btn go', 'erledigt'); b2.type = 'button';
      b2.onclick = function(){ speichere('status/' + id, {status: 'erledigt', ende: new Date().toISOString().slice(0, 10)}); };
      row.appendChild(b1); row.appendChild(b2);
      if (k.baum){ var a = el('a', null, 'im Baum →'); a.href = '#' + k.baum; row.appendChild(a); }
      c.appendChild(row);
      var r2 = el('div', 'ck-row'); r2.appendChild(el('label', null, 'Dauer Tage'));
      var du = el('input'); du.type = 'number'; du.min = '0'; du.style.width = '6em'; du.value = s.dauer != null ? s.dauer : ''; du.onchange = function(){ speichere('status/' + id, {dauer: du.value}); };
      r2.appendChild(du); r2.appendChild(el('label', null, 'Quelle')); var q = el('input'); q.style.width = '10em'; q.value = s.quelle || ''; q.onchange = function(){ speichere('status/' + id, {quelle: q.value}); }; r2.appendChild(q); c.appendChild(r2);
      var ta = el('textarea'); ta.placeholder = 'Ergebnis'; ta.value = s.ergebnis || ''; ta.onchange = function(){ speichere('status/' + id, {ergebnis: ta.value}); }; c.appendChild(ta);
      [b1, b2, du, q, ta].forEach(function(x){ x.disabled = !schreibbar; });
      cards.appendChild(c);
    });
    if (!cards.children.length) cards.appendChild(el('p', 'ck-note', 'Nichts offen, dessen Vorgänger erledigt sind.'));
    // Bestellung
    var o = $('ck-order'); o.textContent = ''; var a = gewaehlt();
    o.appendChild(el('span', 'ck-note', 'Gewähltes Angebot: ' + (a ? (a.anbieter || '–') + (a.herkunft ? ' (' + a.herkunft + ')' : '') + ', Lieferzeit ' + (a.lieferzeit || 'offen') + ' Tage' : 'noch keines (Tabelle unten)')));
    o.appendChild(el('span', 'big', 'Spätestens bestellen: ' + fmt(R.LS['K-BESTELLEN'])));
    if (!R.LS['K-BESTELLEN']) o.appendChild(el('span', 'ck-warn', 'Fehlt: ' + (R.LWHY['K-BESTELLEN'] || 'offen')));
    else if (R.LS['K-BESTELLEN'] < heute) o.appendChild(el('span', 'ck-warn', 'Der späteste Bestelltag ist überschritten: Zieltermin oder Anbieter ändern.'));
    o.appendChild(el('span', null, 'Frühestens bestellen: ' + fmt(R.ES['K-BESTELLEN']) + (R.ES['K-BESTELLEN'] ? '' : ' (' + (R.WHY['K-BESTELLEN'] || 'offen') + ')')));
    o.appendChild(el('span', null, 'Montagebeginn frühestens: ' + fmt(R.ES['K-MONTAGE']) + (R.ES['K-MONTAGE'] ? '' : ' (' + (R.WHY['K-MONTAGE'] || 'offen') + ')') + ' · Ziel: ' + (W.ziel ? fmt(datum(W.ziel)) : 'offen')));
    if (a && a.link){ var lk = el('a', 'ck-btn go', 'Zum Anbieter (bestellt wird von Hand)'); lk.href = a.link; lk.target = '_blank'; lk.rel = 'noreferrer'; o.appendChild(lk); }
    // Werte
    var wv = $('ck-werte'); if (!wv.dataset.fertig){ wv.dataset.fertig = '1';
      [['ziel', 'Zieltermin Montagebeginn (D58)', 'date'], ['frost_ab', 'frostfrei ab (MM-TT)', 'text'], ['frost_bis', 'frostfrei bis (MM-TT)', 'text'], ['zoll', 'Verzollung Tage (AP-C2)', 'number'], ['transport', 'Transport und Umschlag Tage (AP-C3)', 'number'], ['puffer', 'Puffer Tage', 'number'],
       ['max_l', 'Größtes Teil, Länge m (AP-A0)', 'number'], ['max_b', 'Breite m (AP-A0)', 'number'], ['max_h', 'Höhe m (AP-A0)', 'number'], ['max_kg', 'Gewicht kg (AP-A0)', 'number']].forEach(function(f){
        var l = el('label', null, f[1]), i = el('input'); i.type = f[2]; i.id = 'ck-w-' + f[0]; if (f[2] === 'number'){ i.step = 'any'; i.min = '0'; }
        i.onchange = function(){ var p = {}; p[f[0]] = i.value; speichere('werte/node001', p); }; l.appendChild(i); wv.appendChild(l); }); }
    Array.prototype.forEach.call(wv.querySelectorAll('input'), function(i){ var k = i.id.slice(5); if (document.activeElement !== i) i.value = W[k] || ''; i.disabled = !schreibbar; });
    // Angebote
    var tb = document.querySelector('#ck-ang tbody'); tb.textContent = '';
    Object.keys(A).sort(function(x, y){ return (A[x].am || '').localeCompare(A[y].am || ''); }).forEach(function(id){
      var r = A[id], tr = el('tr'); if (id === WAHL) tr.className = 'ck-sel';
      var td0 = el('td'), rb = el('input'); rb.type = 'radio'; rb.name = 'ck-wahl'; rb.checked = id === WAHL; rb.disabled = !schreibbar; rb.onchange = function(){ if (db && schreibbar) db.doc('wahl/AP-C1').set({angebot: id, von: me || '', am: new Date().toISOString()}); }; td0.appendChild(rb); tr.appendChild(td0);
      [['anbieter', 'text'], ['herkunft', 'sel'], ['lieferzeit', 'number'], ['lieferform', 'sel2'], ['montage', 'sel3'], ['lbh', 'lbh'], ['kg', 'number'], ['preis', 'text'], ['link', 'url']].forEach(function(f){
        var td = el('td'), i;
        if (f[1] === 'sel' || f[1] === 'sel2' || f[1] === 'sel3'){ i = el('select'); ({sel: ['', 'Ungarn', 'Polen', 'Alibaba', 'andere'], sel2: ['', 'in Teilen', 'ganzes Modul'], sel3: ['', 'ja', 'nein']})[f[1]].forEach(function(v){ var op = el('option', null, v || '–'); op.value = v; i.appendChild(op); }); i.value = r[f[0]] || ''; i.onchange = function(){ var p = {}; p[f[0]] = i.value; speichere('angebote/' + id, p); }; }
        else if (f[1] === 'lbh'){ i = el('span'); ['l', 'b', 'h'].forEach(function(k2){ var x = el('input'); x.type = 'number'; x.step = 'any'; x.style.width = '4em'; x.value = r[k2] || ''; x.disabled = !schreibbar; x.onchange = function(){ var p = {}; p[k2] = x.value; speichere('angebote/' + id, p); }; i.appendChild(x); }); }
        else { i = el('input'); i.type = f[1]; if (f[1] === 'number'){ i.step = 'any'; i.min = '0'; } i.value = r[f[0]] || ''; i.onchange = function(){ var p = {}; p[f[0]] = i.value; speichere('angebote/' + id, p); }; }
        if (i.tagName !== 'SPAN') i.disabled = !schreibbar; td.appendChild(i); tr.appendChild(td); });
      var pz = passt(Object.assign({}, r, {kg: r.kg})), tdp = el('td', pz.ok === false ? 'bad' : null, pz.t); tr.appendChild(tdp);
      var tdx = el('td'), bx = el('button', 'ck-btn', 'löschen'); bx.type = 'button'; bx.disabled = !schreibbar; bx.onclick = function(){ if (confirm('Angebot löschen?')) db.doc('angebote/' + id).delete(); }; tdx.appendChild(bx); tr.appendChild(tdx);
      tb.appendChild(tr);
    });
    if (!tb.children.length){ var tr0 = el('tr'), td = el('td', 'ck-note', 'Noch keine Angebote. „Angebot hinzufügen“ legt eine Zeile an.'); td.colSpan = 12; tr0.appendChild(td); tb.appendChild(tr0); }
    $('ck-neu').disabled = !schreibbar;
    // BPMN färben
    D.knoten.forEach(function(k){ var g = document.getElementById('bp-' + k.id); if (!g) return; var st = status(k.id);
      g.setAttribute('class', 'bp-n ' + (st === 'erledigt' ? 'st-erledigt' : st === 'in Arbeit' ? 'st-arbeit' : dran(k.id) ? 'st-dran' : 'st-offen') + ((R.LS[k.id] && R.ES[k.id] && R.LS[k.id] <= R.ES[k.id]) || (R.LS[k.id] && R.LS[k.id] < heute) ? ' krit' : '')); });
    // Termine
    var tt = document.querySelector('#ck-term tbody'); tt.textContent = '';
    D.reihenfolge.forEach(function(id){ var k = K[id], st = status(id); var tr = el('tr');
      [k.ab, k.titel, st + (dran(id) && st !== 'erledigt' ? ' · jetzt dran' : ''), st === 'erledigt' ? '–' : fmt(R.ES[id]), st === 'erledigt' ? '–' : (R.LS[id] ? fmt(R.LS[id]) : (K['K-MONTAGE'] && R.LWHY[id] ? 'offen' : '–')), st === 'erledigt' ? '' : (R.WHY[id] || R.LWHY[id] || '')].forEach(function(v, i){ var td = el('td', null, v); if (i === 4 && R.LS[id] && R.LS[id] < heute) td.className = 'bad'; tr.appendChild(td); });
      tt.appendChild(tr); });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.bp-n'), function(g){
    var go = function(){ var k = K[g.getAttribute('data-id')]; if (k && k.baum) location.hash = '#' + k.baum; };
    g.addEventListener('click', go); g.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  $('ck-neu').onclick = function(){ if (!db || !schreibbar) return; db.collection('angebote').doc().set({anbieter: '', am: new Date().toISOString(), von: me || ''}); };
  render();
  var timer = setTimeout(function(){ if (!db) $('ck-status').textContent = 'Speichern ist hier nicht verfügbar. Auf claude.ai angemeldet öffnen, um abzuhaken und einzutragen. Angezeigt wird der Stand aus dem Plan.'; }, 10000);
  (async function(){
    try {
      db = await (window.claude && window.claude.use ? window.claude.use('db') : null);
      var user = await (window.claude && window.claude.use ? window.claude.use('user') : null);
      if (user){ try { me = await user.id(); } catch(e){} try { var c = user.can ? await user.can('data.write') : null; schreibbar = c !== false; } catch(e){ schreibbar = true; } } else schreibbar = !!db;
    } catch(e){ db = null; }
    if (!db){ clearTimeout(timer); $('ck-status').textContent = 'Speichern ist hier nicht verfügbar. Auf claude.ai angemeldet öffnen, um abzuhaken und einzutragen. Angezeigt wird der Stand aus dem Plan.'; return; }
    var geladen = 0, fertig = function(){ if (++geladen >= 4){ clearTimeout(timer); $('ck-status').textContent = schreibbar ? 'Einträge werden gespeichert und sind für alle sichtbar, die den Index öffnen dürfen.' : 'Nur Ansicht: Eintragen dürfen Mitwirkende.'; } };
    var fehler = function(e){ clearTimeout(timer); $('ck-status').textContent = 'Laden fehlgeschlagen: ' + (e && e.message || 'unbekannt'); };
    db.collection('status').onSnapshot(function(sn){ S = {}; sn.docs.forEach(function(d){ S[d.id] = d.data() || {}; }); fertig(); render(); }, fehler);
    db.collection('angebote').onSnapshot(function(sn){ A = {}; sn.docs.forEach(function(d){ A[d.id] = d.data() || {}; }); fertig(); render(); }, fehler);
    db.doc('wahl/AP-C1').onSnapshot(function(d){ WAHL = d && d.data && d.data() ? d.data().angebot : null; fertig(); render(); }, fehler);
    db.doc('werte/node001').onSnapshot(function(d){ W = (d && d.data && d.data()) || {}; fertig(); render(); }, fehler);
  })();
})();
</script>'''

def html_cockpit(daten, svg):
    return HTML.replace('__SVG__', svg).replace('__DATEN__', json.dumps(daten, ensure_ascii=False).replace('</', '<\\/'))
