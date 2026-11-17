import html,re,glob
D='un/ppt/slides/'
def fill(f, mapping):
    p=D+f; s=open(p).read(); ts=list(re.finditer(r'<a:t>([^<]*)</a:t>',s)); out=[];last=0
    for i,m in enumerate(ts,1):
        out.append(s[last:m.start()]); out.append('<a:t>'+(html.escape(mapping[i],quote=False) if i in mapping else m.group(1))+'</a:t>'); last=m.end()
    out.append(s[last:]); open(p,'w').write(''.join(out))
fill('slide2.xml',{12:'Node001 verbindet Wohnen und Arbeiten zur Miete, Services und autonome Infrastruktur. Der Standort muss als eigenes wirtschaftliches System tragfähig werden.'})
fill('slide5.xml',{14:'Miete & Services',15:'Wohnen und Arbeiten zur Miete sowie Leistungen vor Ort. Kein klassischer Immobilienverkauf. Produktmix wird validiert.',18:'Standardisierung von Anfang an mitgedacht; Erlöse daraus erst nach nachgewiesener Reproduzierbarkeit.'})
fill('slide14.xml',{5:'Bauphasen: ein Übergangsobjekt zuerst, danach Objekte',6:'Die Visualisierungen zeigen ein Zielbild. Der Weg dorthin hat drei Phasen, jede erst nach den Gates.',
 8:'Objekt als Übergang',9:'Wohnen und Arbeiten für Team und Bauarbeiter, mit Infrastruktur für Wasser, Strom und Internet, die mitwächst.',
 11:'Objekte & Kommunalgebäude',12:'Zuerst das Kommunalgebäude, dann Wohn- und Arbeitsobjekte für Mieter und Team.',
 15:'Weitere Objekte, bis das Grundstück genutzt ist. Die Fläche für das Hauptgebäude wird zuletzt bebaut.',
 16:'Material und Bauart folgen aus Geologie, Gelände und Zufahrt; geplant mit KI-gestützter Bauplanung.',17:'PHASE 0 = ÜBERGANG · MIETE STATT VERKAUF'})
fill('slide7.xml',{11:'Geologischer Bericht und Reference Architecture v0.4',13:'Fachprüfung des Geologieberichts und Lageplan',14:'Rechtliche Prüfung von Website, Miet- und Nutzungsmodell',18:'Baukosten, Selbstkosten je Objekt, Struktur der Node-Gesellschaft'})
fill('slide15.xml',{18:'Eigenes Holz → Lager → Ofen → Reserve',21:'Grundwasser → Pumpe → Aufbereitung → Boiler',25:'Zwölf Funktionsketten und 120 Anschaffungen mit Quelle, Rolle und Status · Annahmen werden im ersten Winter gemessen'})
fill('slide16.xml',{4:'13',5:'Vor dem Investment: Eigenmittel und Eigenleistung zuerst',6:'Wir klären aus eigenen Mitteln, was ein Investor sonst als Risiko einpreisen müsste.',
 8:'Boden',9:'Fachprüfung der Geologie, Zusatzerkundung, Vermessung',11:'Wasser',12:'Laboranalyse des Grundwassers, Auslegung der Aufbereitung',
 14:'Strom & Netz',15:'Antrag beim Netzbetreiber, Angebot für Internet',17:'Recht & Struktur',18:'Gesellschaft für Node001, Miet- und Nutzungsmodell',
 20:'Kosten',21:'Bauplanung und Angebote statt Internet-Richtwerten',23:'Nachfrage',24:'Mietinteressenten und bezahlte Kundenprojekte',
 25:'Dazu Vorarbeit am Grundstück in Eigenleistung · Kapital danach für Infrastruktur und Objekte'})
fill('slide11.xml',{4:'14',11:'Finanzierungslogik: Equity-ähnlich – konkrete Struktur und Meilensteine noch festzulegen.',
 15:'Ertragslogik: wiederkehrende Erlöse aus Miete und Services vor Ort.',16:'Finanzierungslogik: Eigenkapital bis zur fertigen Bauplanung, danach Investoren für Infrastruktur und Objekte.'})
fill('slide12.xml',{4:'15',18:'Genehmigungen, Miet- und Nutzungsmodell, Investmentstruktur'})
fill('slide13.xml',{4:'16',14:'AB',15:'Architektur & Bau',16:'Externe Beratung',7:'Team und Beratung',21:'Node001 Miet- und Revenue Model',25:'Struktur: Dach, Agentur, Node-Gesellschaft'})
for f in glob.glob('un/ppt/notesSlides/*.xml'):
    s=open(f).read(); t=s.replace('Romans aktueller Investorenseite','der aktuellen Investorenseite').replace('Romans Investorenseite','Die Investorenseite').replace('Nicht als fertige Plattform verkaufen','Nicht als fertige Plattform darstellen')
    if t!=s: open(f,'w').write(t)
print('ok')
