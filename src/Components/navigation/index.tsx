import React, { useCallback, useState } from "react";
import { useAlert } from "react-alert";
import { Line } from "../../types";
import "./style.scss";

type NavigationProps = {
  setCurrentVehicles: (result: string) => void;
  lines: Line[];
};

export default function Navigation({
  setCurrentVehicles,
  lines,
}: NavigationProps) {
  const [search, setSearch] = useState("");
  const alert = useAlert();
  const findVehicles = useCallback(
    (e: React.FormEvent) => {
      setCurrentVehicles("");
      e.preventDefault();
      const r = lines
        .filter(
          line => line.name.toLowerCase().indexOf(search.toLowerCase()) > -1,
        )
        .filter(line => {
          const exp = /[^0-9]*([0-9]+)[^0-9]*/;
          return (
            (exp.exec(line.name) ?? ["", NaN])[1] ===
            (exp.exec(search) ?? ["", NaN])[1]
          ); // NaN because NaN === NaN returns false
        })
        .map(d => d.name)
        .join(",");
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
  );
}
