# PULSE·DE

PULSE·DE ist ein neutrales Recherche- und Dokumentationssystem für politische Vorgänge und ihre belegbaren finanziellen Folgen in Deutschland.

## Aktueller Stand

- Responsive Apple-/iOS-inspirierte Oberfläche
- Suche nach Vorgang, Person, Partei und Behörde
- Filter nach Partei, Kategorie und Status
- Detailansicht pro Vorgang
- Strukturierte Daten in `data.json`
- Quellenlinks und getrennte Kostentypen
- GitHub Actions Research Monitor
- Mobile-first Layout
- Gesamtstaatliche Einnahmen, Ausgaben, Defizit und Finanzvermögen
- Öffentliche Schulden mit Pro-Kopf-Kennzahl und Maastricht-Abgrenzung
- Sichtbare Trennung von Bundeshaushalt und gesamtstaatlicher Finanzstatistik

## Datenmodell

Jeder Vorgang sollte mindestens enthalten:

`id`, `title`, `year`, `category`, `party`, `people`, `agency`, `status`, `costDisplay`, `costType`, `source`, `sourceName`, `updated`, `summary`, `detail`.

Wichtig: Eine staatliche Ausgabe oder ein Steuerschaden wird nicht automatisch einer Person oder Partei zugerechnet. Vorwürfe, parlamentarische Untersuchungen, Prüfberichte und gerichtliche Feststellungen werden getrennt geführt.

## Automatische Recherche

Der Workflow `.github/workflows/research-monitor.yml` prüft mehrmals täglich amtliche Bundestag-RSS-Quellen und die Berichtssuche des Bundesrechnungshofes. Treffer landen als GitHub-Issue in einer Recherche-Inbox. Die redaktionelle Prüfung bleibt absichtlich ein separater Schritt.

Der Bundestag stellt RSS-Feeds für Pressemitteilungen, Kurzmeldungen, Drucksachen und thematische Bereiche bereit.

## Quellenpriorität

1. Gerichte / amtliche Entscheidungen
2. Deutscher Bundestag
3. Bundesrechnungshof
4. Bundesministerien und Bundesbehörden
5. Landesrechnungshöfe / Landesparlamente
6. seriöse Medien zur Einordnung

## Transparenzprinzip

Jede Kennzahl soll mit Datenstand, Abgrenzung, Berechnung und Primärquelle nachvollziehbar sein. Nationale Schuldenstatistik und Maastricht-Schulden werden nicht vermischt. Pro-Kopf-Werte sind statistische Bezugsgrößen und keine individuellen Rechnungen. Politische Vorgänge werden nicht automatisch als Fehltritt, Skandal oder Glaubwürdigkeitsverlust klassifiziert.

## Nächste Ausbaustufe

- echte Deutschlandkarte mit Bundesländern und Geokoordinaten
- Politiker- und Parteienprofile
- Aktenzeichen und Dokumentenarchiv
- Kostenaggregation mit Unsicherheitsintervallen
- automatische Dublettenerkennung
- KI-gestützte Klassifizierung neuer Quellen mit menschlicher Freigabe
- Datenexport als JSON/CSV
