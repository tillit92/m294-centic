# Centic – Finanz-Tracker

Centic ist eine Angular-basierte Webanwendung zur Verwaltung von persönlichen Finanzen. Benutzer können Transaktionen, Budgets und Kategorien verwalten. Das Dashboard gibt eine Übersicht über den aktuellen Monat mit Ausgaben, Kontostand und Budgetstatus.

Die Authentifizierung erfolgt über Keycloak (OAuth2 / JWT). Bestimmte Aktionen wie das Erstellen oder Löschen von Kategorien sind auf Administratoren beschränkt.

---

## Technologien

| Bereich | Technologie |
|---|---|
| Framework | Angular 21 |
| UI-Komponenten | Angular Material |
| Authentifizierung | Keycloak / OAuth2 |
| HTTP | Angular HttpClient |
| Mehrsprachigkeit | ngx-translate (de_CH / en) |
| Testing | Vitest über Angular CLI |

---

## Voraussetzungen

- Node.js >= 18
- Angular CLI >= 21 (`npm install -g @angular/cli`)
- Eine laufende Keycloak-Instanz
- Laufendes [M295 Backend](https://github.com/tillit92/m295-centic) (Standard: `http://localhost:9090`)

---

## Installation

```bash
git clone <repository-url>
cd demo-app-frontend
npm install
```

---

## Konfiguration

Die Umgebungsdateien befinden sich unter `src/environments/`.

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  backendBaseUrl: 'http://localhost:9090/api/',
};
```

Die Keycloak-Konfiguration (Issuer, ClientId usw.) ist in `src/app/app.config.ts` definiert.

---

## Entwicklungsserver starten

```bash
ng serve --open
```

Die Applikation ist danach unter `http://localhost:4200` erreichbar.

Der Angular Dev-Server leitet `/api`-Anfragen über `proxy.conf.json` an das Backend weiter — es gibt keine CORS-Probleme während der Entwicklung.

---

## Build

```bash
ng build
```

Der produktive Build wird in den Ordner `dist/` geschrieben.

---

## Tests ausführen

Tests sind mit Vitest geschrieben und laufen über den Angular CLI Test-Runner.

```bash
ng test
```

Dieser Befehl führt alle `*.spec.ts`-Dateien aus und überwacht Änderungen. Einmaliger Durchlauf ohne Watch-Modus:

```bash
ng test --watch=false
```

### Testabdeckung

| Datei | Tests |
|---|---|
| `category.service.spec.ts` | 6 |
| `category-list.spec.ts` | 6 |
| `header.service.spec.ts` | 1 |
| `base.component.spec.ts` | 1 |

---

## Projektstruktur

```
src/
├── app/
│   ├── components/        # Gemeinsame Komponenten (Header, Bestätigungsdialog, ...)
│   ├── dataaccess/        # Modellklassen (Category, Transaction, Budget, ...)
│   ├── dir/               # Eigene Direktiven (IsInRole, Autofocus)
│   ├── guard/             # Routen-Guards
│   ├── interceptor/       # HTTP-Interceptoren (JWT)
│   ├── pages/             # Feature-Seiten
│   │   ├── dashboard/
│   │   ├── category-list/
│   │   ├── category-detail/
│   │   ├── transaction-list/
│   │   ├── transaction-detail/
│   │   ├── budget-list/
│   │   └── budget-detail/
│   └── service/           # Angular Services (CategoryService, ...)
├── assets/
│   ├── i18n/              # Übersetzungsdateien (de_CH.json, en.json)
│   └── images/            # Logo und statische Dateien
└── environments/          # Umgebungskonfiguration
```

---

## Funktionen

- **Dashboard** — Monatlicher Kontostand, Ausgaben vs. Budgetlimit, letzte Transaktionen
- **Transaktionen** — Auflisten, Erstellen, Bearbeiten und Löschen von Ein- und Ausgaben
- **Budgets** — Monatliche Ausgabenlimits pro Kategorie definieren
- **Kategorien** — Kategorien mit Farbcode verwalten (nur Admin)
- **Mehrsprachig** — Deutsch (de_CH) und Englisch

---

## Rollen

| Rolle | Berechtigungen |
|---|---|
| `USER` | Alle Daten anzeigen, eigene Transaktionen und Budgets erstellen und bearbeiten |
| `ADMIN` | Alles oben, plus Kategorien erstellen, bearbeiten und löschen |