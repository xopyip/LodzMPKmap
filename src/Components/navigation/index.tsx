import React, { useCallback, useState } from "react";
import { useAlert } from "react-alert";
import { Line } from "../../types";
import "./style.scss";

type NavigationProps = {
  setCurrentVehicles: (result: string[]) => void;
  lines: Line[];
  isTopographic: boolean;
  setIsTopographic: (val: boolean) => void;
};

export default function Navigation({
  setCurrentVehicles,
  lines,
  isTopographic,
  setIsTopographic,
}: NavigationProps) {
  const [search, setSearch] = useState("");
  const alert = useAlert();
  const findVehicles = useCallback(
    (e: React.FormEvent) => {
      setCurrentVehicles([]);
      e.preventDefault();
      const r = lines
        .filter(
          line => line.name.toLowerCase().indexOf(search.toLowerCase()) > -1,
        )
        .filter(line => {
          const extractNumberPattern = /\D*(\d+)\D*/;
          const lineNumberResult = extractNumberPattern.exec(line.name);
          const searchNumberResult = extractNumberPattern.exec(search);
          if (lineNumberResult === null || searchNumberResult === null) {
            return false;
          }
          return lineNumberResult[1] === searchNumberResult[1];
        })
        .map(d => d.name);
      if (r.length === 0) {
        alert.show("Podaj poprawny numer linii komunikacji miejskiej!");
        return false;
      }
      setCurrentVehicles(r);
      return false;
    },
    [lines, search, alert, setCurrentVehicles],
  );
  return (
    <>
      <div id="navigation">
        <form onSubmit={findVehicles}>
          <div className="input-container">
            <input
              type="text"
              required
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="search-input"
            />
            <label htmlFor="search-input">Linia MPK (np. 58B)</label>
          </div>
          <button type="submit" className="btn">
            Wyszukaj!
          </button>
        </form>
      </div>
      <button
        aria-label="Tryb wyświetlania mapy"
        id="change-map-style"
        onClick={() => setIsTopographic(!isTopographic)}
        value="Tryb wyświetlania mapy"
        type="button"
        className={isTopographic ? "" : "non-topographic"}
      />
    </>
  );
}
