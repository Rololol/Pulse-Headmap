# PULSE Politikdatenbank

PULSE trennt Quellenentdeckung von redaktioneller Bewertung.

## Ebenen

1. Quellen-Inbox – automatisch entdeckte Bundestags-, Rechnungshof- und Gerichtsveröffentlichungen.
2. Vorgänge – redaktionell geprüfte Fälle mit eindeutiger ID.
3. Personen / Parteien / Institutionen – eigene Entitäten, die über IDs mit Vorgängen verknüpft werden.
4. Dokumente / Aktenzeichen – Primärquellen und gerichtliche bzw. parlamentarische Referenzen.
5. Kosten – getrennte Typen für angefallene Kosten, Zahlungsverpflichtungen, geplante/potenzielle Ausgaben und Steuerverzichte.
6. Geografie – Bundesland, Kreis und Koordinaten; für die Deutschlandkarte wird BKG VG250 verwendet.

## Redaktionsregel

Automatisch gefundene Veröffentlichungen werden nicht automatisch als Fehltritt oder Skandal veröffentlicht. Sie landen zunächst in data/inbox.json mit reviewState=needs_review. Erst eine geprüfte Redaktion kann daraus einen PULSE-Vorgang machen.

Das verhindert, dass ein Suchtreffer, eine Pressemitteilung oder ein Gerichtsverfahren fälschlich als politisches Fehlverhalten klassifiziert wird.

## Zielmodell

Die Datenbank ist auf mehrere tausend Vorgänge ausgelegt. data.json bleibt zunächst die kompakte öffentliche Datengrundlage; die normalisierten Entitäten können anschließend in separate Dateien oder eine API/SQLite-Datenbank überführt werden.

## Offizielle Quellen

- Bundestag Open Data: https://www.bundestag.de/services/opendata
- Bundestag RSS: https://www.bundestag.de/services/rss
- Bundesrechnungshof Berichtssuche: https://bundesrechnungshof.de/veroeffentlichungen/berichtssuche
- Bundesverfassungsgericht Pressemitteilungen: https://www.bundesverfassungsgericht.de/SharedDocs/Pressemitteilungen/DE/
- Bundesverwaltungsgericht Aktuelles: https://www.bverwg.de/aktuelles
- Bundesgerichtshof Suche: https://www.bundesgerichtshof.de/SiteGlobals/Forms/Suche/Expertensuche_Formular.html

## Karte

Die Verwaltungsgebiete VG250 des BKG stehen als Open Data sowie über WMS/WFS zur Verfügung und werden jährlich fortgeführt.
