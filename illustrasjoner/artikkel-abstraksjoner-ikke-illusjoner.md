## Bygg abstraksjoner, ikke illusjoner 🎩

**Å skjule kompleksitet kan gjøre en plattform lettere å bruke. Men skjuler du for mye, bygger du en illusjon. Her er forskjellen på en god abstraksjon og en farlig illusjon.**

## Bilen har en god abstraksjon 🚗

Når du kjører bil, bruker du ratt, pedaler og girvelger. Du trenger ikke tenke på stempler, veivaksel og drivstoffblanding.

Hvis ingeniørene hadde navngitt bilen ut fra delene, ville den kanskje hett «stempel-veivaksel-gir-hjul-enhet». Heldigvis er den oppkalt etter hva den er til for: å kjøre.

Det er en abstraksjon. Et høyere nivå av språk som skjermer deg for kompleksiteten under.

## Navn etter hensikt, ikke implementasjon 🏷️

Vi sier «gasspedal», selv om elbiler ikke bruker bensin. Navnet peker på en detalj i implementasjonen. «Akselerator» beskriver hva pedalen gjør, og passer for alle typer biler.

Gode abstraksjoner heter noe etter formålet, ikke etter hvordan de er bygd.

## En samling er ikke en abstraksjon 🧺

Mange interne plattformer setter sammen eksisterende tjenester. Det er nyttig, men det er ikke en abstraksjon, hvis brukeren fortsatt må kunne alle delene.

En kjede av tre-fire tekniske tjenester gir deg ikke et nytt språk. Det gir deg en samling.

## Når abstraksjonen blir en illusjon 💭

Du bygger en illusjon når du skjuler for mye, også det brukeren faktisk trenger å vite.

Et klassisk eksempel er å få et kall til en annen tjeneste til å se ut som et vanlig kall i samme program. Det er enkelt å bruke, men kallet er tregere, og det kan feile på måter som ikke finnes lokalt. Illusjonen sprekker når virkeligheten treffer.

## Slik finner du gode abstraksjoner 🔍

- Forstå **domenet** og hva brukerne vil oppnå, ikke bare hva teknologien kan
- Bruk **begrep brukerne kjenner igjen**, ikke teknologiens egne
- Ikke bare gjør noe mer generelt. En «generisk kø» er ikke automatisk en abstraksjon
- Ikke fjern det som er viktig for brukeren å vite

## Oppsummert 🧭

- En abstraksjon skjermer for kompleksitet med et høyere nivå av språk
- Navngi etter hensikt, ikke implementasjon
- Å sette sammen tjenester er ikke det samme som å abstrahere
- Skjuler du for mye, bygger du en illusjon

**Gjør det enklere, men ikke enklere enn det kan være.**

## Kilde 📚

Tankene bygger på Gregor Hohpes bok *Platform Strategy* ([leanpub.com/platformstrategy](https://leanpub.com/platformstrategy)).

## Hva tenker du? 💬
