# Interaktywna mapa komunikacji miejskiej w Łodzi

## Motywacja

Brak aplikacji w Apple Store umożliwiającej szybkie sprawdzenie lokalizacji autobusu danej linii. 

## Stack
- React - baza aplikacji
- Leaflet - biblioteka odpowiedzialna za wyświetlanie mapy
- [API MPK](http://rozklady.lodz.pl/Home/)
- Nginx - serwer www oraz proxy dla API
- Proste proxy w nodejs dodające nagłówki cors

## TODO:
- Mapa:
  - [x] Wyswietlanie mapy
  - [x] Wyswietlanie trasy pojazdu
  - [ ] Wyświetlanie znaczników przystanków
- Pojazd:
  - [x] Więcej informacji na temat danego pojazdu
  - [x] Znacznik kierunku pojazdu
  - [x] Wyswietlanie kolejnych przystanków na trasie
- Przystanki:
  - [ ] Rozkłady jazdy dla danego przystanku
- Trasy:
  - [ ] Wyznaczanie trasy
  - [ ] Ulubione trasy
  - [ ] Powiadomienia o opoznieniach
