import base64
from pathlib import Path
img = lambda n: 'data:image/jpeg;base64,' + base64.b64encode((Path(__file__).resolve().parent.parent / 'bilder' / n).read_bytes()).decode()
def cards(items, cls='c3'):
    return f'<div class="grid {cls}">' + ''.join(f'<div class="card"><p class="tag">{t}</p><h3>{h}</h3><p>{p}</p></div>' for t, h, p in items) + '</div>'
def lst(items): return '<ul>' + ''.join(f'<li>{x}</li>' for x in items) + '</ul>'
H = [('H1','Human Value','Erzeugt das Gesamtsystem messbaren Nutzen für die relevanten Nutzerrollen?'),
     ('H2','Autarkie und Resilienz','Erreichen kritische Funktionen die definierten Autonomie- und Ausfallziele?'),
     ('H3','Operational Viability','Lassen sich Services und Technik mit vertretbarem Aufwand zuverlässig betreiben?'),
     ('H4','Economic Viability','Trägt das reale Verhältnis aus CAPEX, OPEX, Erlösen und Nutzung?'),
     ('H5','Digital Value','Erzeugt die digitale Repräsentation messbaren Nutzen für Betrieb, Entscheidungen und Lernen?'),
     ('H6','AI Value','Verbessert KI ausgewählte Prozesse nachweisbar gegenüber einer konventionellen Lösung?'),
     ('H7','Learning Capability','Werden Erfahrungen strukturiert in bessere Anforderungen, Standards und Entscheidungen überführt?'),
     ('H8','Replicability','Lassen sich Erkenntnisse aus Node001 bei einem späteren Node wiederverwenden?')]
ROAD = [('Marktnachweis','Bezahlte Projekte, Zahlungsbereitschaft, wiederkehrende Probleme'),('Site Truth','Geologie, Zugang, Wasser, technische Basis und Kostenband'),
        ('Product & Economics','Produktmix, Services, CAPEX/OPEX, Erlös- und Sensitivitätsmodell'),('Financing & Permissions','Struktur, Finanzierung, rechtliche und behördliche Freigaben'),
        ('Build & Operate','Den ersten sinnvollen Bauabschnitt umsetzen, betreiben und messen'),('Learn & Replicate','Evidenz in Standards und Genome überführen; Node002 als Replikationstest')]
USE = [('Site & Engineering','Geologie, Wasser, Zugang, Basis of Design, Kostenband'),('Product & Market','Nutzerrollen, Produktmix, Zahlungsbereitschaft, Serviceumfang'),
       ('Economic Model','CAPEX/OPEX, Erlöse, Cost-to-Serve, Sensitivitäten'),('Legal & Structure','Genehmigungen, Miet- und Nutzungsmodell, Investmentstruktur'),
       ('Minimum Viable Node','Erster sinnvoller Bauabschnitt und kritische Infrastruktur'),('Digital & Operations','Assetregister, Datenmodell, Monitoring, Service- und Lernprozesse')]
html = f'''<title>X-PORTAL Whitepaper</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Ein Dokument zum Lesen: schmale Textspalte, Status als Farbe und Wort, Waldgrün aus den Karpaten als einzige Akzentfarbe. */
:root {{ --bg:#f3f5f1; --paper:#ffffff; --ink:#10201a; --body:#33423b; --muted:#66756d; --line:#d9dfd8; --forest:#1d5a3c; --forest-bg:#e2efe6; --amber:#8a5a00; --amber-bg:#f6ecd4; --slate:#2c5378; --slate-bg:#e2ebf4;
  --display:'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif; --text:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif; --mono:'IBM Plex Mono',ui-monospace,Menlo,monospace }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; color-scheme:dark }} }}
:root[data-theme="dark"] {{ --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; color-scheme:dark }}
* {{ box-sizing:border-box }}
body {{ background:var(--bg); color:var(--body); font-family:var(--text); font-size:16.5px; line-height:1.6; padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:0 72px }}
.wrap {{ max-width:980px; margin:0 auto; display:flex; flex-direction:column; gap:56px }}
.cover {{ position:relative; margin-top:24px; border-radius:6px; overflow:hidden; background:#10201a; color:#fff; min-height:420px; display:flex; flex-direction:column; justify-content:flex-end }}
.cover img {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover }}
.cover::after {{ content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(10,22,17,.15) 0%, rgba(10,22,17,.88) 78%) }}
.cover > div {{ position:relative; z-index:1; padding:32px clamp(20px,4vw,44px); display:flex; flex-direction:column; gap:10px }}
.cover .eyebrow {{ color:#cfe3d6 }} .cover h1 {{ color:#fff }} .cover p {{ color:#e3ece6; max-width:60ch; margin:0 }} .cover small {{ color:#b8c9be; font-family:var(--mono); font-size:12px }}
.eyebrow {{ font-family:var(--mono); font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin:0 }}
h1 {{ font-family:var(--display); font-size:clamp(34px,6vw,60px); line-height:1.02; letter-spacing:-.025em; margin:0; text-wrap:balance }}
h2 {{ font-family:var(--display); font-size:clamp(24px,3.4vw,32px); line-height:1.15; letter-spacing:-.015em; color:var(--ink); margin:0; text-wrap:balance }}
h3 {{ font-family:var(--display); font-size:18px; color:var(--ink); margin:0 }}
section {{ display:flex; flex-direction:column; gap:16px }}
section > p, section > ul, .lead {{ max-width:68ch; margin:0 }}
.lead {{ font-size:19px; color:var(--ink) }}
.num {{ font-family:var(--mono); font-size:12.5px; color:var(--forest) }}
ul {{ padding-left:20px; margin:0 }} li {{ margin:4px 0 }}
.grid {{ display:grid; gap:12px }} .c3 {{ grid-template-columns:repeat(auto-fit, minmax(min(100%,260px),1fr)) }} .c2 {{ grid-template-columns:repeat(auto-fit, minmax(min(100%,340px),1fr)) }} .c4 {{ grid-template-columns:repeat(auto-fit, minmax(min(100%,210px),1fr)) }}
.card {{ background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:16px 18px; display:flex; flex-direction:column; gap:6px; min-width:0 }}
.card p {{ margin:0; font-size:15px }} .tag {{ font-family:var(--mono); font-size:11.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--forest) }}
.rule {{ border-left:4px solid var(--forest); background:var(--forest-bg); color:var(--ink); padding:14px 18px; border-radius:0 6px 6px 0; max-width:none; font-weight:500 }}
.status {{ display:grid; gap:12px; grid-template-columns:repeat(auto-fit, minmax(min(100%,270px),1fr)) }}
.status .card {{ border-top:4px solid var(--c) }} .s-have {{ --c:var(--forest) }} .s-work {{ --c:var(--slate) }} .s-open {{ --c:var(--amber) }}
.status h3 {{ display:flex; align-items:center; gap:8px }} .pill {{ font-family:var(--mono); font-size:11px; padding:2px 8px; border-radius:999px; background:var(--cb); color:var(--c) }}
.s-have .pill {{ --cb:var(--forest-bg) }} .s-work .pill {{ --cb:var(--slate-bg) }} .s-open .pill {{ --cb:var(--amber-bg) }}
.status ul {{ font-size:15px }}
ol.steps {{ list-style:none; padding:0; margin:0; display:grid; gap:10px; grid-template-columns:repeat(auto-fit, minmax(min(100%,290px),1fr)); max-width:none }}
.steps li {{ display:grid; grid-template-columns:34px minmax(0,1fr); gap:10px; background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:12px 14px; margin:0 }}
.steps .n {{ font-family:var(--mono); font-size:13px; color:var(--forest); padding-top:2px }} .steps b {{ color:var(--ink); display:block }} .steps span {{ font-size:14.5px }}
.loop {{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; font-size:14.5px }} .loop span {{ background:var(--paper); border:1px solid var(--line); border-radius:999px; padding:5px 12px; color:var(--ink) }} .loop i {{ color:var(--muted); font-style:normal }}
figure {{ margin:0 }} figure img {{ width:100%; height:auto; display:block; border-radius:6px }} figcaption {{ font-size:13px; color:var(--muted); margin-top:6px }}
table {{ border-collapse:collapse; width:100%; font-size:15px; background:var(--paper) }} th, td {{ text-align:left; vertical-align:top; padding:10px 12px; border-top:1px solid var(--line) }}
th {{ font-family:var(--mono); font-size:11.5px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); font-weight:500 }} td:first-child {{ font-family:var(--mono); font-size:13px; color:var(--forest); white-space:nowrap }} td b {{ color:var(--ink) }}
.tw {{ overflow-x:auto; border:1px solid var(--line); border-radius:6px }}
.cols {{ display:grid; gap:12px; grid-template-columns:repeat(auto-fit, minmax(min(100%,320px),1fr)) }}
.intern {{ border:1.5px dashed var(--amber); background:var(--amber-bg); border-radius:6px; padding:16px 18px; display:flex; flex-direction:column; gap:8px }} .intern h3 {{ color:var(--amber) }} .intern p, .intern ul {{ margin:0; font-size:15px; color:var(--ink) }}
footer {{ font-size:13px; color:var(--muted); border-top:1px solid var(--line); padding-top:16px; max-width:80ch }}
a {{ color:var(--forest) }}
</style>
<div class="wrap">
<header class="cover"><img alt="Konzeptvisualisierung eines Node in den Karpaten: Gebäude am Hang, Solardächer, gemeinsamer Weg" src="{img('image-1-1.jpg')}">
<div><p class="eyebrow">Whitepaper · Diskussionsstand November 2026 · vertraulich</p>
<h1>Digitale Arbeit. Reale Orte. Lernendes System.</h1>
<p>X-PORTAL verbindet bezahlte digitale Arbeit mit realen Lebens- und Arbeitsorten. Node001 in den Karpaten wird der erste reale Proof of Concept des Gesamtsystems.</p>
<small>Konzeptvisualisierung · keine finale Planung</small></div></header>

<section id="these"><p class="num">01 · Die These</p><h2>Aus digitaler Wertschöpfung entsteht Schritt für Schritt reproduzierbares Systemwissen</h2>
<p class="lead">X-PORTAL entwickelt menschenzentrierte, weitgehend versorgungsautarke, operativ autonome, resiliente und wirtschaftlich tragfähige Lebens-, Arbeits- und Aufenthaltsumgebungen, in denen Mensch, physische Welt, Services, Organisation und Technologie als integriertes, lernendes Gesamtsystem zusammenwirken.</p>
{cards([('Heute','Digitale Wertschöpfung','Kundenprojekte schaffen Umsatz, Marktnähe und reale Problemsignale. Wiederkehrende Aufgaben können zu wiederverwendbaren KI-Lösungen werden.'),
        ('Erster physischer PoC','Reale Nodes','Node001 verbindet Wohnen, Arbeiten, Services und autonome Infrastruktur. Der Standort muss als eigenes wirtschaftliches System tragfähig werden.'),
        ('Skalierungshypothese','Lernendes System','Betriebsdaten, Entscheidungen und Evidenz fließen in Standards und Architektur zurück. Erst dadurch entsteht die Grundlage für weitere Nodes.')])}
<p class="rule">Disziplin: Node001 darf wirtschaftlich nicht davon abhängen, dass später Lizenz-, Genome- oder IP-Erlöse entstehen.</p></section>

<section id="problem"><p class="num">02 · Das Problem</p><h2>Heute werden die relevanten Systeme getrennt entwickelt</h2>
{cards([('01','Digitale Arbeit','Projekte, Freelancer, KI-Automatisierung und Remote Work werden vor allem als digitale Prozesse gedacht.'),
        ('02','Lebens- und Arbeitsorte','Gebäude, Gemeinschaft, Mobilität und Services gelten meist als Immobilien- oder Hospitality-Thema.'),
        ('03','Betrieb und Infrastruktur','Energie, Wasser, Wartung, Daten und Resilienz werden oft als technische Einzellösungen optimiert.')])}
<p>X-PORTAL setzt an dieser Trennung an und integriert sechs Ebenen: Mensch, physische Welt, Services, Organisation, Technologie und Wirtschaftlichkeit. Dass diese Integration trägt, ist noch nicht bewiesen. Node001 ist der erste reale Test dafür.</p></section>

<section id="system"><p class="num">03 · Das System</p><h2>Ein kontrollierter Kreislauf aus Nutzung, Daten und Evidenz</h2>
<p>Reale Nutzung erzeugt Daten und Evidenz. Evidenz verbessert die nächste Entscheidung und später den nächsten Node.</p>
<div class="loop"><span>Menschen</span><i>→</i><span>Arbeit und Services</span><i>→</i><span>Node</span><i>→</i><span>Betrieb und Daten</span><i>→</i><span>Lernen</span><i>→</i><span>Nächster Node</span></div>
<div class="cols"><div class="card"><p class="tag">Reference Architecture</p><h3>Die Regeln des Aufbaus</h3><p>Systemebenen, Schnittstellen, Prinzipien und Anforderungen, nach denen X-PORTAL-Systeme aufgebaut werden. Stand: v0.4 als Arbeitsbaseline, mit 14 Systemanforderungen von Menschenzentrierung über Resilienz bis Konfigurationskontrolle.</p></div>
<div class="card"><p class="tag">X-PORTAL Genome</p><h3>Der reproduzierbare Teil</h3><p>Invarianten, konfigurierbare Module, Parameter, Entscheidungsregeln und Evidenz. Eine Genome-Regel ist erst belastbar, wenn Node001 reale Evidenz erzeugt und Node002 zeigt, dass das Wissen tatsächlich wiederverwendbar ist.</p></div></div>
<p>X-PORTAL definiert keinen Baukasten fertiger Lösungen. Es definiert einen Mechanismus, mit dem standortspezifische Lösungen entwickelt, betrieben, gemessen, verbessert und, soweit Evidenz es rechtfertigt, reproduziert werden.</p></section>

<section id="erloese"><p class="num">04 · Das Geschäftsmodell</p><h2>Vier Erlösstufen mit unterschiedlichem Reifegrad</h2>
{cards([('01 · Heute','Kundenprojekte','Bezahlte Leistungen für Unternehmen. Sie liefern Umsatz, Marktfeedback und reale Anwendungsfälle.'),
        ('02 · In Entwicklung','Technologielösungen','Wiederkehrende Aufgaben sollen als wiederverwendbare oder betriebene Lösungen Erlöse bringen: zuerst KI, perspektivisch auch Robotik, Drohnen und mechanische Systeme.'),
        ('03 · Node001','Miete und Services am Node','Wohnen und Arbeiten zur Miete sowie Leistungen vor Ort. Kein Immobilienverkauf im klassischen Sinn. Der Produktmix wird validiert.'),
        ('04 · Später','System-Skalierung','Standardisierung wird von Anfang an mitgedacht. Erlöse aus Betrieb, Technologie, Standards oder Partnerschaften erst nach nachgewiesener Reproduzierbarkeit.')], 'c4')}
<h3>Das Geschäftsmodell auf einen Blick</h3>
{cards([('Wertangebot','Für Nutzer','Ein Ort, an dem bezahlte digitale Arbeit, Wohnen und Gemeinschaft zusammenpassen: eigene Wohneinheit, Arbeitsplatz mit verlässlichem Internet, Versorgung, die auch im Winter läuft.'),
        ('Wertangebot','Für Unternehmen','Projekte und Technologielösungen aus einem Team, das reale Probleme vor Ort selbst löst und messbar macht.'),
        ('Kunden','Wer zahlt','Unternehmen (Projekte, Lösungen); Mieter am Node (Wohnen, Arbeiten, Services). Digitale Nomaden und Gäste folgen erst nach Auslastungsdaten.'),
        ('Schlüsselressourcen','Was wir haben müssen','Plattform und Lieferteam, Grundstück, Reference Architecture, Betriebswissen aus Node001.'),
        ('Kostenstruktur','Was es kostet','Company: Team und Plattform. Node001: Infrastruktur, Objekte, Kommunalgebäude, Betrieb. Getrennt gerechnet.'),
        ('Preislogik','Selbstkosten als Basis','Miete und Pauschalen werden aus gemessenen Kosten abgeleitet. Wer in Projekten oder für die Gemeinschaft mitarbeitet, bekommt diese Leistung angerechnet.'),
        ('Prüfstein','Was es beweisen muss','Node001 trägt sich aus Nutzung. Cost-to-Serve je Bewohner und Monat wird gemessen, nicht angenommen.')])}
<p class="rule">Kernregel: Node001 muss aus realer Nutzung wirtschaftlich tragfähig werden. Künftige IP- und Genome-Erlöse sind Upside, kein Rettungsanker im Base Case.</p></section>

<section id="node001"><p class="num">05 · Node001</p><h2>Der erste reale Proof of Concept</h2>
<p>Karpatenregion, Westukraine. Der Standort soll kein reines Bauprojekt sein, sondern das gesamte X-PORTAL-System unter realen Bedingungen testen. Geprüft werden acht Hypothesen. Jede erhält vor der Freigabe Messgröße, Datengrundlage, Zielwert, Prüfzeitpunkt und ein Go/Revise/Stop-Kriterium.</p>
<figure><img alt="Konzeptvisualisierung Node001: Wohngebäude, Gemeinschaftsgebäude mit Terrasse, Gemüsegarten und Wege am Hang" src="{img('image-6-1.jpg')}"><figcaption>Konzeptvisualisierung · keine finale Planung</figcaption></figure>
<div class="tw"><table><thead><tr><th>ID</th><th>Hypothese</th><th>Prüffrage</th></tr></thead><tbody>{''.join(f'<tr><td>{a}</td><td><b>{b}</b></td><td>{c}</td></tr>' for a,b,c in H)}</tbody></table></div>
<p>Zum kleinsten validierbaren System gehören Rollen und Bedürfnisse der Menschen, Gebäude und Infrastruktur, Energie, Wasser, Kommunikation und Zugang, Kernservices mit Kosten und Kennzahlen, ein Asset- und Systemregister mit Monitoring sowie ein Entscheidungs- und Evidenzspeicher. Nicht dazu gehören ein vollständiger Digital Twin, autonome KI-Steuerung kritischer Prozesse, breite Robotik und eine Multi-Node-Plattform.</p></section>

<section id="bauphasen"><p class="num">06 · Bauphasen</p><h2>Ein Übergangsobjekt zuerst, danach Objekte und Kommunalgebäude</h2>
<p>Die Visualisierungen zeigen ein Zielbild, keine Planung. Der Weg dorthin hat drei Phasen. Jede beginnt erst nach den technischen, wirtschaftlichen und finanziellen Gates.</p>
<ol class="steps"><li><span class="n">0</span><div><b>Objekt als Übergang</b><span>Ein Wohn- und Arbeitsobjekt für Team und Bauarbeiter, mit Infrastruktur für Wasser, Strom und Internet, die mitwachsen kann. Sanitär und Warmwasser sind von Anfang an fest eingebaut.</span></div></li>
<li><span class="n">1</span><div><b>Objekte und Kommunalgebäude</b><span>Zuerst das Kommunalgebäude mit Küche, Sanitär und Arbeitsplätzen, dann Wohn- und Arbeitsobjekte für Mieter und Team.</span></div></li>
<li><span class="n">2</span><div><b>Ausbau nach Nachfrage</b><span>Weitere Objekte, bis das Grundstück genutzt ist. Die Fläche für das Hauptgebäude wird als letzte bebaut.</span></div></li></ol>
<p>Material und Bauart sind standortabhängig und werden mit KI-gestützter Bauplanung und 3D-Modellen aus Geologie, Gelände und Zufahrt abgeleitet. Größe und Selbstkosten je Objekt kommen aus dem parametrischen Business Case und werden mit Angeboten belegt.</p></section>

<section id="management"><p class="num">07 · Führung und Ausführung</p><h2>Gesteuert nach dem St. Galler Management-Modell</h2>
<p>X-PORTAL wird auf drei Ebenen geführt. Jede Ebene beschreibt Aktivitäten, Strukturen und Verhalten, und jede Aussage trägt einen Status von VERIFIED bis DECISION REQUIRED.</p>
<div class="tw"><table><thead><tr><th>Ebene</th><th>Frage</th><th>Bei X-PORTAL</th></tr></thead><tbody>
<tr><td>Normativ</td><td><b>Warum und nach welchen Regeln?</b></td><td>Vision, Prinzipien, Governance mit klaren Entscheidungsrechten; Änderungen an Kernaussagen nur als Change Request.</td></tr>
<tr><td>Strategisch</td><td><b>Womit und in welcher Reihenfolge?</b></td><td>Vier Erlösstufen, zwei Investment Cases, Roadmap als Risikoabbau, Bauphasen, Genome und Standards.</td></tr>
<tr><td>Operativ</td><td><b>Wer macht was, womit, wann?</b></td><td>Node001 als Projekt mit Gates; Prozesse für Entwickeln, Betreiben, Störung und Lernen; jede kritische Funktion bis auf das Werkzeug geplant.</td></tr></tbody></table></div>
<p>Ein Beispiel für die operative Tiefe: <b>Wärme</b> → Ofen je Einheit → Brennholz mit Menge je Winter → eigenes Holz schlagen und ein Jahr trocknen, für den ersten Winter trockenes Holz zukaufen → Holzlager → Säge, Spaltaxt, Schutzausrüstung und Kurs → wer nachlegt und wer Holz holt → Schornsteinreinigung → zweite Wärmequelle, CO-Melder und Feuerlöscher. Für jedes Glied gibt es Quelle, Verantwortung und Status. So sind zwölf kritische Funktionen und 120 Anschaffungen geplant, von Strom und Wasser über Internet und Schnee bis zu Zugang und Daten.</p>
<p class="rule">Was wir nicht wissen, steht als Annahme da und wird im ersten Winter gemessen. Der Messwert ersetzt die Annahme und wird Teil des Standards für den nächsten Node.</p></section>

<section id="stand"><p class="num">08 · Stand heute</p><h2>Reale Substanz, zentrale Nachweise fehlen noch</h2>
<div class="status">
<div class="card s-have"><h3>Vorhanden <span class="pill">belegt</span></h3>{lst(['Plattform x-portal.eu mit KI-Matching und Freelancer-Profilen','Warteliste für Node001','Grundstück für Node001 gesichert','Geologischer Untersuchungsbericht für Node001','Reference Architecture v0.4 als Arbeitsbaseline'])}</div>
<div class="card s-work"><h3>In Arbeit <span class="pill">läuft</span></h3>{lst(['Fachprüfung des Geologieberichts und Lageplan','Rechtliche Prüfung von Website, Miet- und Nutzungsmodell','Erste eigene KI-Agenten','Node001 System Architecture und parametrischer Business Case'])}</div>
<div class="card s-open"><h3>Zu validieren <span class="pill">offen</span></h3>{lst(['Baukosten, Selbstkosten je Objekt und Produktmodell','Rechtliche Struktur der Gesellschaft für Node001','Finanzierung des ersten Bauabschnitts','Nachfrage, Auslastung und Cost-to-Serve','Daten- und Betriebsarchitektur zwischen Standorten und Organisation'])}</div>
</div><p>Stand November 2026. Künftige Meilensteine sind Ziele, keine Zusagen.</p></section>

<section id="roadmap"><p class="num">09 · Der Weg</p><h2>Erst belegen, dann ausbauen</h2>
<p>Die Roadmap ist eine Folge von Risikoabbau-Schritten, keine Reihe zugesagter Termine. Baubeginn 2027 ist das Ziel, und zwar nur nach technischen, wirtschaftlichen und finanziellen Gates.</p>
<ol class="steps">{''.join(f'<li><span class="n">{i:02d}</span><div><b>{a}</b><span>{b}</span></div></li>' for i,(a,b) in enumerate(ROAD,1))}</ol></section>

<section id="wert"><p class="num">10 · Die Wertthese</p><h2>Mehr als ein physischer Standort</h2>
<div class="loop"><span>Physische Assets</span><i>+</i><span>Betriebswissen</span><i>+</i><span>Daten und Evidenz</span><i>+</i><span>Standards und Technologie</span><i>+</i><span>X-PORTAL Genome</span></div>
<p>Der zusätzliche System- und IP-Wert ist plausibel, aber heute eine Hypothese. Er muss durch Betrieb und Replikation verdient werden. Der Burggraben sind nicht einzelne Technologien, sondern die validierte Kombination, die Evidenzbasis und die Fähigkeit, den nächsten Node schneller, besser oder risikoärmer zu entwickeln. Beweismaßstab ist Node002.</p>
<div class="cols"><div class="card"><p class="tag">Wiederverwendbar</p>{lst(['Architekturprinzipien','Requirements- und Traceability-Logik','Schnittstellen und Datenmodell','Entscheidungsregeln','Lern- und Change-Mechanismus','Validierte Standards'])}</div>
<div class="card"><p class="tag">Standortabhängig</p>{lst(['Grundstück, Topografie, Geologie','Klima, Wasser und Ressourcen','Recht und Genehmigungen','Markt und Zielgruppen','Produkt- und Service-Mix','Gebäudeform und lokale Ausprägung'])}</div></div></section>

<section id="vorher"><p class="num">11 · Vor dem Investment</p><h2>Eigenmittel und Eigenleistung zuerst</h2>
<p>Bevor Kapital für Infrastruktur und Objekte aufgenommen wird, klärt X-PORTAL aus eigenen Mitteln und eigener Arbeit die Fragen, die ein Investor sonst als Risiko einpreisen müsste.</p>
{cards([('Boden','Geprüfte Gründung','Fachprüfung des geologischen Berichts, Zusatzerkundung und Vermessung mit Geländemodell.'),
        ('Wasser','Menge und Qualität','Laboranalyse des Grundwassers und Auslegung der Aufbereitung.'),
        ('Strom und Netz','Anschluss belegt','Antrag beim Netzbetreiber und Angebot für die Internetanbindung.'),
        ('Recht und Struktur','Investierbare Gesellschaft','Rechtliche Prüfung von Gesellschaft, Miet- und Nutzungsmodell.'),
        ('Kosten','Angebote statt Richtwerte','Bauplanung und schriftliche Angebote für die großen Posten; daraus entsteht das Kostenband.'),
        ('Nachfrage','Interessenten und Umsatz','Mietinteressenten für Node001 und bezahlte Kundenprojekte der Company.')])}
<p>Dazu kommt sichtbare Vorarbeit am Grundstück: Baufläche vorbereiten, eigenes Holz schlagen und einlagern, Messreihen über den Winter. Jede Stunde wird dokumentiert.</p>
<p class="rule">Kapital wird erst gebraucht, wenn diese Nachweise vorliegen. Es fließt dann in Infrastruktur, Objekte und Betriebsfähigkeit, nicht in offene Grundsatzfragen.</p></section>

<section id="kapital"><p class="num">12 · Kapital</p><h2>Zwei Investment Cases, eine gemeinsame Story</h2>
<p>Company und Node001 haben unterschiedliche Risiken, Cashflows und Zeithorizonte. Sie werden wirtschaftlich und rechtlich getrennt bewertet.</p>
<div class="cols"><div class="card"><p class="tag">Digitales und organisatorisches System</p><h3>X-PORTAL Company</h3><p>Kapital für Plattform, Lieferteam, wiederverwendbare KI-Lösungen sowie System- und Architekturentwicklung.</p><p><b>Ertragslogik:</b> Kundenprojekte, dann wiederverwendbare Lösungen, später möglicherweise systembezogene Erlöse.</p><p><b>Finanzierung:</b> Equity-ähnlich. Struktur und Meilensteine sind noch festzulegen.</p></div>
<div class="card"><p class="tag">Physischer PoC</p><h3>Node001</h3><p>Kapital für den ersten physischen Standort: Infrastruktur, den ersten sinnvollen Bauabschnitt und die Betriebsfähigkeit.</p><p><b>Ertragslogik:</b> wiederkehrende Erlöse aus Miete und Services vor Ort.</p><p><b>Finanzierung:</b> Eigenkapital bis zur fertigen Bauplanung, danach Investoren für Infrastruktur und Objekte. Eigenständiger Project- bzw. Asset-Case.</p></div></div>
<div class="card"><p class="tag">Struktur · in rechtlicher Klärung</p><h3>Drei Ebenen</h3><p>X-PORTAL hält als Dach Architektur, Lizenzen und Markenrechte. Eine Agentur liefert Kundenprojekte im deutschsprachigen Raum. Node001 liegt in einer eigenen Gesellschaft am Standort. Wer an einem Node mitwirkt, soll an diesem Node beteiligt werden können, nicht am Dach.</p></div>
<h3>Was Kapital jetzt freischalten soll</h3><p>Nicht maximal bauen, sondern die Unsicherheiten beseitigen, die den nächsten belastbaren Investmententscheid verhindern.</p>
<ol class="steps">{''.join(f'<li><span class="n">{i:02d}</span><div><b>{a}</b><span>{b}</span></div></li>' for i,(a,b) in enumerate(USE,1))}</ol>
<p class="rule">Investment-Readiness-Gate: belastbares Kostenband, validiertes Revenue Model, rechtliche Struktur, messbare Meilensteine, klarer Kapitalbedarf.</p></section>

<section id="team"><p class="num">13 · Team und nächster Schritt</p><h2>Aus der Story einen investierbaren Case machen</h2>
{cards([('Produkt und Projekt','Roman Dering',''),('Lead Developer','Pavel J.','')], 'c2')}
<p><b>Beratung Architektur und Bau:</b> ein Architekt aus der Region begleitet Planung, Geologie und Baukontext in beratender Funktion.</p>
<p>Die Architektur steht als Arbeitsbaseline. Als Nächstes werden Node001 und die Finanzierung quantitativ und rechtlich belastbar gemacht. Dieses Papier soll ein Gespräch eröffnen; technische, rechtliche und standortspezifische Details liefern später die Due-Diligence-Unterlagen.</p>
<div class="intern"><h3>Intern: vor externem Versand finalisieren, dann diesen Kasten entfernen</h3>{lst(['Vollständige Founder-, Ownership- und Governance-Darstellung (im Team oben fehlt die Geschäftsführung)','Karten D69–D72 auf der <a href="https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP">Entscheidungsseite</a> entscheiden: Paket vor dem Investment, Bewertung der Eigenleistung, Zeitpunkt der Ansprache','Fachprüfung des Geologieberichts (heute nur KI-Zusammenfassung, nicht geprüft)','Rechtsprüfung der Struktur: Dach, Agentur, Gesellschaft für Node001; Beteiligung am Node','Mission und Globalziele mit der Vision v0.4 in eine Logik bringen','Parametrischer Business Case, Selbstkosten je Objekt, Kapitalbedarf und Investor Ask (Beträge stehen bewusst nicht im Papier)','Infografik „Integrierte Managementarchitektur“ von v0.2 auf v0.4 heben','Jurist prüft den Text vor dem Versand'])}</div></section>

<footer>Kein öffentliches Angebot von Wertpapieren, Vermögensanlagen oder Kryptowerten; keine Anlageberatung. Vertraulicher Diskussionsstand, November 2026. Künftige Meilensteine sind Ziele, keine Zusagen. Grundlage: X-PORTAL Reference Architecture v0.4 (Working Baseline, 12.11.2026) und Investor Deck, Working Draft, November 2026.</footer>
</div>'''
html = html.replace('<p></p>', '')
(Path(__file__).resolve().parent.parent / 'x-portal-whitepaper.body.html').write_text(html); print(len(html))
