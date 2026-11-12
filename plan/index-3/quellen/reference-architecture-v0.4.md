---
title: "X-PORTAL Reference Architecture v0.4 – Working Baseline for Human + AI Collaboration"
version: "v0.4-WB1"
date: "12.11.2026"
status: "Working Baseline – controlled further development"
canonical_for: "Further human + AI collaboration"
---

# X-PORTAL Reference Architecture v0.4
## Working Baseline for Human + AI Collaboration

**Version:** v0.4-WB1  
**Date:** 12.11.2026  
**Status:** Working Baseline – controlled further development

## 1. Zweck dieser Arbeitsbaseline
Diese Fassung ist die gemeinsame Arbeitsreferenz für Menschen und KI. Sie trennt dauerhaft gültige Systemlogik von offenen Annahmen und Node001-spezifischer Implementierung. Sie ist kein Investorentext und kein Detailengineering.

### Normative Sprache
- **MUSS** = verbindliche Anforderung für den aktuellen Architekturstand.
- **SOLL** = Standardfall; Abweichung ist zu begründen.
- **KANN** = Option, kein Baseline-Zwang.

## 2. Vision
> X-PORTAL entwickelt menschenzentrierte, weitgehend versorgungsautarke, operativ autonome, resiliente und wirtschaftlich tragfähige Lebens-, Arbeits- und Aufenthaltsumgebungen, in denen Mensch, physische Welt, Services, Organisation und Technologie als integriertes, lernendes Gesamtsystem zusammenwirken.

## 3. Abstraktionsebenen und Begriffe

- **X-PORTAL:** Das übergeordnete menschenzentrierte, weitgehend autonome, resiliente, wirtschaftlich tragfähige und lernende sozio-technische Gesamtsystem.
- **Reference Architecture:** Beschreibt die grundlegende Architektur, Systemebenen, Schnittstellen, Prinzipien und Regeln, nach denen X-PORTAL-Systeme aufgebaut werden.
- **X-PORTAL Genome:** Der reproduzierbare Teil der Architektur: Invarianten, konfigurierbare Module, Parameter, Entscheidungsregeln, Standards sowie Evidenz und Lernerfahrungen.
- **Node:** Eine konkrete, standortspezifische Instanziierung von X-PORTAL.
- **Node001 Beregniza:** Erste reale Instanziierung und Proof of Concept des X-PORTAL-Gesamtsystems.
- **X-PORTAL Organisation:** Die Organisation, die Entwicklung, Betrieb, Governance, Lernen und Weiterentwicklung des Systems verantwortet.
- **System Model:** Strukturierte digitale Beschreibung von Systemelementen, Beziehungen, Anforderungen, Zuständen und Schnittstellen.
- **Digital Twin:** Dynamisch mit der Realität verbundene digitale Repräsentation ausgewählter Systembereiche. Nicht jeder Teil des System Models benötigt einen Digital Twin.

## 4. Systemebenen

- **Mensch:** Zweck und Referenzpunkt des Systems: Bedürfnisse, Rollen, Sicherheit, Selbstbestimmung, Wohlbefinden, Arbeit, Erholung, Wahrnehmung und Interaktion.
- **Physische Welt:** Grundstück, Naturraum, Gebäude, Wege, Energie, Wasser, Abwasser, Anlagen, Ausstattung, Maschinen und weitere physische Assets.
- **Services:** Leistungen, die Menschen und Betrieb mit der physischen, organisatorischen und technologischen Welt verbinden.
- **Organisation:** Rollen, Verantwortlichkeiten, Governance, Prozesse, Partner, Ressourcen, Qualität, Risiko und Entscheidungslogik.
- **Technologie:** Sensorik, IoT, Connectivity, Daten, System Model/Digital Twin, KI, Agenten, Automatisierung und perspektivisch Robotik.
- **Wirtschaftlichkeit:** Durchgängige Bewertungsdimension für CAPEX, OPEX, Erlöse, Cost-to-Serve, Lebenszyklus, Risiken, Kapitalbindung und Skalierung.

## 5. Übergreifende Architekturprinzipien

- **Menschenzentrierung:** Systementscheidungen werden anhand ihrer Wirkung auf Menschen bewertet.
- **Autarkie / Autonomie:** Kritische Funktionen sollen mit möglichst geringer externer Abhängigkeit und hoher lokaler Handlungsfähigkeit betrieben werden.
- **Resilienz:** Störungen sollen kontrolliert aufgenommen, kritische Funktionen aufrechterhalten und stabile Zustände wiederhergestellt werden.
- **Modularität:** Komponenten und Funktionen sollen, soweit sinnvoll, austauschbar, erweiterbar und kombinierbar sein.
- **Interoperabilität:** Kritische physische, digitale, organisatorische und Service-Schnittstellen werden definiert und dokumentiert.
- **Wartbarkeit:** Systeme müssen unter realistischen lokalen Bedingungen wartbar und betreibbar sein.
- **Messbarkeit:** Relevante Systemzustände, Wirkungen und Kosten werden soweit sinnvoll messbar gemacht.
- **Lernfähigkeit:** Betriebserfahrung und Evidenz verändern kontrolliert Anforderungen, Standards und Architektur.
- **Wirtschaftlichkeit:** Nicht Maximalleistung, sondern optimaler Gesamtnutzen über den Lebenszyklus ist das Ziel.
- **Reproduzierbarkeit:** Übertragbar sind Systemlogik und validierte Standards, nicht zwingend lokale Lösungen.

## 6. System Context und Grenzen

### 6.1 X-PORTAL Gesamtsystem – innerhalb
X-PORTAL Organisation; Reference Architecture; Genome; gemeinsame Standards; Daten- und Wissensarchitektur; KI-/Software-Komponenten; Nodes; übergreifender Lernprozess.

### 6.2 Externe Umwelt
Gesellschaft und Communities; Staat/Behörden; Kapitalgeber; Märkte/Kunden; Lieferanten/Partner; Energie- und Kommunikationsanbieter; Forschung/Technologieanbieter; natürliche Umwelt.

### 6.3 Node-Systemgrenze
Ein Node umfasst Mensch, physische Welt, Services, lokale Organisation, Technologie, wirtschaftliche Strukturen und Lernmechanismen, soweit sie für die konkrete Instanziierung erforderlich sind.

## 7. Concept of Operations (CONOPS)

- **CO-01 Node entwickeln:** Standortdaten → Anforderungen → Varianten → technische und wirtschaftliche Bewertung → Entscheidung → Implementierung.
- **CO-02 Mensch nutzt X-PORTAL:** Rolle → Bedürfnis → Service → physische/digitale Interaktion → Ergebnis → Feedback.
- **CO-03 Node betreiben:** Systemzustände → Monitoring → Prozesse/Services → Ressourcen → Wartung → Kosten → Leistungskennzahlen.
- **CO-04 Störung bewältigen:** Störung → Erkennung → Priorisierung → lokale Reaktion → Ersatz-/Notbetrieb → Wiederherstellung → Ursachenanalyse.
- **CO-05 System lernen:** Annahme → Implementierung → reale Wirkung → Evidenz → Bewertung → Entscheidung → Änderung.
- **CO-06 neuen Node entwickeln:** Genome + Evidenz bestehender Nodes → Standortparameter → Konfiguration → lokale Engineering-Entscheidungen → neuer Node.

## 8. Requirements Architecture

**Traceability-Kette:** Vision → Stakeholder Need → System Requirement → Node-/Subsystem Requirement → Design Decision → Verification → Evidence.

| ID | Name | Norm | Requirement | Ebene |
|---|---|---|---|---|
| XP-SYS-001 | Human Centricity | MUSS | Systementscheidungen müssen hinsichtlich ihrer Wirkung auf relevante menschliche Bedürfnisse bewertet werden. | Mensch |
| XP-SYS-002 | Autarkie / Autonomie | MUSS | Für kritische Funktionen müssen definierte Autarkie- bzw. Autonomieziele bestehen. | Querschnitt |
| XP-SYS-003 | Resilience | MUSS | Für kritische Funktionen müssen tolerierbare Ausfallzeiten, Degradationsmodi und Wiederherstellungsstrategien definiert sein. | Querschnitt |
| XP-SYS-004 | Economic Viability | MUSS | Wesentliche Designentscheidungen müssen hinsichtlich CAPEX, OPEX und Lebenszykluswirkung bewertet werden. | Wirtschaftlichkeit |
| XP-SYS-005 | Traceability | MUSS | Wesentliche Anforderungen, Entscheidungen, Implementierungen und Evidenzen müssen nachvollziehbar verknüpft werden. | Governance |
| XP-SYS-006 | Modularity | SOLL | Subsysteme sollen soweit sinnvoll modular und austauschbar aufgebaut werden. | Architektur |
| XP-SYS-007 | Interoperability | MUSS | Kritische Schnittstellen müssen definiert, dokumentiert und versioniert werden. | Architektur |
| XP-SYS-008 | Digital Representation | MUSS | Kritische Assets, Prozesse und Systemzustände müssen in geeigneter Form digital repräsentiert werden können. | Technologie |
| XP-SYS-009 | Safety/Security/Privacy | MUSS | Personen, physische Systeme und Daten müssen angemessen geschützt werden. | Querschnitt |
| XP-SYS-010 | Learning | MUSS | Relevante Erfahrungen müssen systematisch erfasst und in Architektur- und Entscheidungsprozesse zurückgeführt werden. | Lernen |
| XP-SYS-011 | Local Adaptability | MUSS | Ein Node muss lokale Umwelt-, Markt-, Rechts- und Kulturbedingungen berücksichtigen können. | Node |
| XP-SYS-012 | Maintainability | MUSS | Kritische Systeme müssen unter realistischen lokalen Bedingungen wartbar sein. | Physische Welt |
| XP-SYS-013 | Data Governance | MUSS | Für relevante Datenobjekte müssen Ownership, Zweck, Qualität, Zugriff und Aufbewahrung definiert werden. | Technologie |
| XP-SYS-014 | Configuration Control | MUSS | Änderungen an Anforderungen, Standards, Genome und Reference Architecture müssen versioniert und entscheidbar sein. | Governance |

## 9. X-PORTAL Genome v0.1

- **Invariants:** Regeln, die jeder Node grundsätzlich erfüllen muss.
- **Configurable Modules:** wähl- und kombinierbare Funktionsmodule.
- **Parameters:** lokale Eingangsgrößen wie Klima, Topografie, Nutzerrollen, Kapazität, Autarkieziele und Investitionsrahmen.
- **Decision Rules:** Regeln, nach denen Konfigurationen ausgewählt werden.
- **Evidence:** reale Evidenz, die Regeln stützt, verändert oder verwirft.

### Genome-Regel
Eine Genome-Regel ist erst belastbar, wenn sie Quelle, Node, Betriebsdaten/Begründung, Ergebnis und Vertrauensniveau besitzt.

## 10. Node001 Minimum Validatable System (MVS)

| Bereich | Umfang | Scope |
|---|---|---|
| Human | Rollen und Bedürfnisse; Portal Experience Anforderungen; Feedback- und Nutzungsmessung | Zwingend |
| Physical | Gebäude-/Infrastrukturarchitektur; Energie; Wasser; Kommunikation; Zugang/Mobilität; relevante Sicherheitsfunktionen | Zwingend |
| Autarkie & Resilienz | Kritische Funktionen, Zielwerte, Degradations- und Wiederherstellungslogik | Zwingend |
| Services | Owner, Prozess, Ressourcen, KPI, Kosten für jeden Kernservice | Zwingend |
| Organisation | Verantwortlichkeiten, Entscheidungsprozess, Risiko- und Änderungsmanagement | Zwingend |
| Technology | Asset-/Systemregister, Kerndatenmodell, Monitoring, digitale Repräsentation, selektive KI-Anwendungen | Zwingend |
| Economics | CAPEX, OPEX, Erlöse, Cost-to-Serve, Lebenszyklusannahmen | Zwingend |
| Learning | Assumption Register, Decision Log, Soll/Ist, Evidenzspeicher, Rückführung | Zwingend |
| Full Digital Twin | Vollständiger Twin aller Objekte und Prozesse | Später / nur bei Nutzen |
| Autonomous AI | Autonome KI-Steuerung kritischer Prozesse | Nicht MVS |
| Broad Robotics | Breite Robotiklandschaft | Nicht MVS |
| Multi-Node Platform | Globale Plattform- und Lizenzierungsarchitektur | Nicht MVS |

## 11. Node001 PoC-Hypothesen

| ID | Hypothese | Aussage |
|---|---|---|
| H1 | Human Value | Die integrierte Gestaltung erzeugt messbaren Mehrwert für relevante Nutzerrollen. |
| H2 | Autarkie & Resilienz | Kritische Funktionen erreichen das definierte Autarkie-/Autonomie- und Resilienzniveau. |
| H3 | Operational Viability | Services und technische Systeme lassen sich mit vertretbarem organisatorischem Aufwand zuverlässig betreiben. |
| H4 | Economic Viability | Das Gesamtsystem kann unter realistischen Bedingungen wirtschaftlich tragfähig betrieben werden. |
| H5 | Digital Value | Digitale Repräsentation erzeugt messbaren Nutzen für Betrieb, Entscheidungen und Lernen. |
| H6 | AI Value | KI verbessert ausgewählte Prozesse nachweisbar gegenüber einer konventionellen Lösung. |
| H7 | Learning Capability | Erfahrungen werden strukturiert in bessere Anforderungen, Standards und Entscheidungen überführt. |
| H8 | Replicability | Erkenntnisse aus Node001 lassen sich bei einem späteren Node wiederverwenden. |

Jede Hypothese erhält vor Freigabe mindestens Messgröße, Datengrundlage, Zielwert, Prüfzeitpunkt sowie Go/Revise/Stop-Kriterium.

## 12. Safety, Security, Privacy & Legal
- **Safety:** Schutz von Menschen und physischen Systemen.
- **Security:** Schutz gegen unbefugte physische und digitale Eingriffe.
- **Privacy:** Zweckbindung, Datenminimierung und kontrollierte Nutzung personenbezogener Daten.
- **Legal/Regulatory:** nachvollziehbare Anforderungen je Node und Funktion.

## 13. Learning & Change Governance
**Lernkreislauf:** Anforderung → Annahme/Designentscheidung → Implementierung → Betrieb → Datenerfassung → Analyse → Bewertung → Entscheidung → Anpassung → neuer Standard.

Jede relevante Änderung erhält: Change-ID, Problem, Evidenz, Änderung, betroffene Systeme, Kosten/Nutzen, Risiko, Entscheidung, Version und Wirksamkeitsprüfung.

## 14. Statusmodell

- **VERIFIED:** Fachlich/real geprüft und ausreichend belegt.
- **DOCUMENTED:** Dokumentiert vorhanden, aber noch nicht vollständig fachlich verifiziert.
- **IN WORK:** Bearbeitung oder Untersuchung läuft.
- **ASSUMPTION:** Bewusste Annahme; muss validiert werden.
- **OPEN:** Noch ungeklärt.
- **DECISION REQUIRED:** Ausreichende Informationen liegen vor oder müssen verdichtet werden; formale Entscheidung fehlt.

## 15. Arbeitsregeln für KI

1. Diese Baseline ist der aktuelle Bezugsrahmen. Frühere Dokumente sind Evidenz und Historie, aber keine automatisch gültigen Anforderungen.
2. Begriffe X-PORTAL, Reference Architecture, Genome, Node und Node001 dürfen nicht synonym verwendet werden.
3. Fehlende Fakten nicht ergänzen oder erraten. Stattdessen mit ASSUMPTION, OPEN oder DECISION REQUIRED kennzeichnen.
4. Jede Empfehlung soll mindestens Systemebene, betroffene Requirement-ID(s), Status und Node001-Relevanz nennen.
5. Zwischen Reference-Architecture-Anforderung und Node001-Implementierungsumfang strikt unterscheiden: REQUIRED / PREPARE / DEFER.
6. Digital Twin nicht als Synonym für System Model verwenden.
7. Neue KI-, Automatisierungs- oder Robotikfunktionen nur bei nachvollziehbarem Nutzen und klarer Governance empfehlen.
8. Widersprüche zu dieser Baseline ausdrücklich markieren; nicht stillschweigend harmonisieren.
9. Änderungen an Kernbegriffen, Vision, Invarianten oder Anforderungen als CHANGE REQUEST behandeln.
10. Wirtschaftliche Auswirkungen jeder relevanten Architekturentscheidung mitbetrachten; Scheingenauigkeit vermeiden.

## 16. Offene Architekturentscheidungen

| ID | Thema | Status | Gate |
|---|---|---|---|
| OD-001 | Systemgrenze X-PORTAL Organisation ↔ Node-Betrieb | DECISION REQUIRED | Vor Node001 Governance Design |
| OD-002 | Definition kritischer Funktionen und Ziel-Autarkie-/Autonomiewerte für Node001 | OPEN | Vor Basis of Design |
| OD-003 | Human Roles v1.0 und priorisierte Needs | IN WORK | Vor Service Architecture Freeze |
| OD-004 | System Model / Datenmodell v0.1 | OPEN | Vor Digital-Twin-Implementierung |
| OD-005 | Node001 PoC-KPIs und Go/Revise/Stop-Grenzen | OPEN | Vor Investitionsfreigabe |
| OD-006 | Genome Invariants v0.1 | IN WORK | Vor Node001 Architecture Freeze |
| OD-007 | Safety/Security/Privacy/Legal Baseline Node001 | OPEN | Vor Technologie- und Betriebsfreigabe |
| OD-008 | Parametrischer Business Case und Architektur-Sensitivitäten | OPEN | Parallel zur Node001 System Architecture |

## 17. Nächster Entwicklungsgegenstand
**X-PORTAL Node001 System Architecture v0.1** mit: System Context; Stakeholder & Human Roles; Operational Scenarios; Functional Architecture; Physical Architecture; Service Architecture; Organisation & Governance; Technology & Data Architecture; Autarkie & Resilienz; Safety/Security/Privacy; Economic Architecture; Requirements & Verification Matrix; PoC-Hypothesen und Messkonzept.

## 18. Kerndefinition
> X-PORTAL definiert keinen universellen Baukasten fertiger Lösungen. Es definiert einen kontrollierten Mechanismus, mit dem standortspezifische Lösungen entwickelt, implementiert, betrieben, gemessen, bewertet, verbessert und – soweit durch Evidenz gerechtfertigt – reproduziert werden. Node001 Beregniza ist die erste reale Umgebung, in der dieser Mechanismus selbst validiert wird.
