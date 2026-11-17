import html,re
D='un/ppt/slides/'
def fill(f, mapping):
    p=D+f; s=open(p).read(); ts=list(re.finditer(r'<a:t>([^<]*)</a:t>',s))
    out=[];last=0
    for i,m in enumerate(ts,1):
        out.append(s[last:m.start()])
        out.append('<a:t>'+(html.escape(mapping[i],quote=False) if i in mapping else m.group(1))+'</a:t>'); last=m.end()
    out.append(s[last:]); open(p,'w').write(''.join(out))
fill('slide14.xml',{4:'07',5:'Bauphasen: Container für den Anfang, danach richtige Häuser',
 6:'Was die Visualisierungen zeigen, ist das Ziel. Der Weg dorthin hat drei Phasen, jede erst nach den Gates.',
 7:'Phase 0',8:'Container als Übergang',9:'Wohncontainer für Team und Bauarbeiter auf der Fläche, die zuletzt bebaut wird. Kein Produkt für Käufer.',
 10:'Phase 1',11:'Holzhäuser & Kommunalgebäude',12:'Holzhäuser in Teilen, vor Ort montiert. Zuerst das Kommunalgebäude, dann Häuser für Siedler, Mieter und Team.',
 13:'Phase 2',14:'Ausbau nach Nachfrage',15:'Weitere Häuser, bis das Grundstück voll ist. Container gehen zurück; die Übergangsfläche wird zuletzt bebaut.',
 16:'Hausgröße, Preis je Haus und Kostenband je Phase kommen aus dem parametrischen Business Case.',17:'CONTAINER = ÜBERGANG · HÄUSER = PRODUKT'})
fill('slide15.xml',{4:'10',5:'Geführt nach dem St. Galler Management-Modell',
 6:'Drei Ebenen oben, darunter die operative Tiefe: jede kritische Funktion ist bis auf Werkzeug, Person und Reserve geplant.',
 7:'01',8:'Normativ',9:'Vision, Prinzipien, Entscheidungsrechte, Change Requests',
 10:'02',11:'Strategisch',12:'Erlösstufen, Investment Cases, Bauphasen, Genome',
 13:'03',14:'Operativ',15:'Node001 mit Gates, Prozesse, Register, Betrieb oben',
 16:'F01',17:'Wärme',18:'Holzofen → Brennholz → Axt oder Säge → Reserve',
 19:'F03',20:'Wasser',21:'Quelle → Pumpe → Tank → Filter → Boiler',
 22:'F07',23:'Zufahrt & Schnee',24:'Räumvertrag für die Auffahrt, Schaufeln, Streugut, Vorrat',
 25:'Zwölf Funktionsketten mit Preis, Quelle, Person, Wartung und Status · Annahmen werden im ersten Winter gemessen'})
fill('slide5.xml',{11:'Technologielösungen',12:'Wiederkehrende Aufgaben als wiederverwendbare Lösungen: zuerst KI, später Robotik, Drohnen, Mechanik.'})
for f,old,new in [('slide7.xml','07','08'),('slide8.xml','08','09'),('slide9.xml','09','11'),('slide10.xml','10','12'),('slide11.xml','11','13'),('slide12.xml','12','14'),('slide13.xml','13','15')]:
    p=D+f; s=open(p).read(); assert s.count(f'<a:t>{old}</a:t>')==1,(f,s.count(f'<a:t>{old}</a:t>')); open(p,'w').write(s.replace(f'<a:t>{old}</a:t>',f'<a:t>{new}</a:t>'))
print('ok')
