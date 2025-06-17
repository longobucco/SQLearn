import React, { useEffect, useState } from "react";
import initSqlJs from "sql.js";
import { Circle } from "rc-progress";

const esercizi = [
  {
    title: "Elenco utenti unici ordinati per nome",
    description:
      "Mostra l'elenco dei nomi degli utenti senza duplicati, ordinati alfabeticamente.",
    answer: "SELECT DISTINCT name FROM users ORDER BY name ASC;",
  },
  {
    title: "Totale speso per utente",
    description:
      "Mostra per ogni utente il totale speso in tutti i suoi ordini. Ordina dal totale più alto al più basso.",
    answer:
      "SELECT users.id, users.name, SUM(orders.total) AS totale_speso FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id, users.name ORDER BY totale_speso DESC;",
  },
  {
    title: "Prodotti ordinati almeno 5 volte con media quantità per ordine",
    description:
      "Mostra i prodotti che sono stati ordinati almeno 5 volte (sommando le quantità), indicando anche la quantità media per ordine. Ordina per media decrescente.",
    answer:
      "SELECT p.id, p.name, SUM(oi.quantity) AS quantita_totale, AVG(oi.quantity) AS media_per_ordine FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.id, p.name HAVING SUM(oi.quantity) >= 5 ORDER BY media_per_ordine DESC;",
  },
  {
    title: "Prodotti più ordinati per quantità totale",
    description:
      "Mostra i prodotti ordinati in base alla quantità totale venduta (sommando le quantità degli order_items), dal più al meno venduto.",
    answer:
      "SELECT products.id, products.name, SUM(order_items.quantity) AS totale_venduto FROM products JOIN order_items ON products.id = order_items.product_id GROUP BY products.id, products.name ORDER BY totale_venduto DESC;",
  },
  {
    title: "Elenco ordini con nome utente",
    description:
      "Mostra l'elenco di tutti gli ordini con il nome dell'utente che li ha effettuati.",
    answer:
      "SELECT orders.id AS ordine_id, users.name AS nome_utente, orders.total FROM orders JOIN users ON orders.user_id = users.id;",
  },
  {
    title: "Dettagli ordini: utente, prodotto e quantità",
    description:
      "Per ogni voce di ordine, mostra il nome dell'utente, il nome del prodotto e la quantità ordinata.",
    answer:
      "SELECT users.name AS nome_utente, products.name AS nome_prodotto, order_items.quantity FROM order_items JOIN orders ON order_items.order_id = orders.id JOIN users ON orders.user_id = users.id JOIN products ON order_items.product_id = products.id;",
  },
  {
    title: "Utenti con almeno un ordine",
    description: "Mostra gli utenti che hanno effettuato almeno un ordine.",
    answer:
      "SELECT users.id, users.name, COUNT(orders.id) AS numero_ordini FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id, users.name HAVING COUNT(orders.id) >= 1;",
  },
  {
    title: "Ordini di un utente specifico",
    description:
      "Mostra il totale degli ordini effettuati dall'utente con email 'alice@example.com'.",
    answer:
      "SELECT orders.id, orders.total FROM orders JOIN users ON orders.user_id = users.id WHERE users.email = 'alice@example.com';",
  },
  {
    title: "Ordini superiori alla media",
    description:
      "Mostra tutti gli ordini che hanno un totale superiore alla media di tutti gli ordini.",
    answer:
      "SELECT id, total FROM orders WHERE total > (SELECT AVG(total) FROM orders);",
  },
  {
    title: "Utenti con media ordine sopra i 100",
    description:
      "Mostra gli utenti che hanno una media ordine superiore a 100 euro.",
    answer:
      "SELECT users.id, users.name, AVG(orders.total) AS media_ordini FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id, users.name HAVING AVG(orders.total) > 100;",
  },
  {
    title: "Totale speso per utente",
    description:
      "Mostra il totale degli ordini per ogni utente usando GROUP BY.",
    answer:
      "SELECT user_id, SUM(total) as totale_speso FROM orders GROUP BY user_id;",
  },
  {
    title: "Ordina i prodotti per prezzo crescente",
    description:
      "Mostra l'elenco dei prodotti ordinati dal meno costoso al più costoso.",
    answer: "SELECT id, name, price FROM products ORDER BY price ASC;",
  },
  {
    title: "Numero di ordini per utente",
    description: "Conta quanti ordini ha effettuato ogni utente.",
    answer:
      "SELECT user_id, COUNT(*) AS numero_ordini FROM orders GROUP BY user_id;",
  },
  {
    title: "Spesa media per utente",
    description: "Calcola la spesa media per ciascun utente.",
    answer:
      "SELECT user_id, AVG(total) AS spesa_media FROM orders GROUP BY user_id;",
  },
  {
    title: "Utente con il massimo totale speso",
    description: "Individua l'utente che ha speso di più in totale.",
    answer:
      "SELECT user_id, SUM(total) AS totale FROM orders GROUP BY user_id ORDER BY totale DESC LIMIT 1;",
  },
  {
    title: "Classifica utenti per spesa",
    description:
      "Assegna un rank agli utenti in base alla somma spesa (usa una window function).",
    answer:
      "SELECT user_id, SUM(total) AS totale, RANK() OVER (ORDER BY SUM(total) DESC) AS posizione FROM orders GROUP BY user_id;",
  },
  {
    title: "Utenti con più ordini (conteggio decrescente)",
    description:
      "Mostra l'elenco degli utenti con il numero di ordini effettuati, ordinato dal più attivo al meno attivo.",
    answer:
      "SELECT users.id, users.name, COUNT(orders.id) AS numero_ordini FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.id, users.name ORDER BY numero_ordini DESC;",
  },
  {
    title: "Differenza rispetto alla media",
    description:
      "Mostra per ogni ordine quanto è distante dalla media di tutti gli ordini (usa una window function).",
    answer:
      "SELECT id, total, total - AVG(total) OVER () AS differenza_dalla_media FROM orders;",
  },
  {
    title: "Media mobile ordini",
    description:
      "Calcola la media mobile degli ordini in base all'ID (usa ROWS BETWEEN).",
    answer:
      "SELECT id, total, AVG(total) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS media_mobile FROM orders;",
  },
  {
    title: "MEDIA giornaliera per città e regione",
    description:
      "Calcola il numero medio giornaliero di transazioni per ogni città, regione e anno.",
    answer:
      "SELECT c.città, c.regione, d.anno, SUM(a.numeroDiTransazioni)*1.0 / COUNT(DISTINCT d.idData) AS media_giornaliera FROM Attività a JOIN Citta c ON a.idCitta = c.idCitta JOIN Data d ON a.idData = d.idData GROUP BY c.città, c.regione, d.anno;",
  },
  {
    title: "Percentuale per città su regione",
    description:
      "Calcola la percentuale di transazioni per ogni città rispetto al totale della sua regione per ciascun anno.",
    answer:
      "WITH totali_regione AS ( SELECT c.regione, d.anno, SUM(a.numeroDiTransazioni) AS totale FROM Attività a JOIN Citta c ON a.idCitta = c.idCitta JOIN Data d ON a.idData = d.idData GROUP BY c.regione, d.anno ) SELECT c.città, c.regione, d.anno, SUM(a.numeroDiTransazioni)*100.0 / tr.totale AS percentuale FROM Attività a JOIN Citta c ON a.idCitta = c.idCitta JOIN Data d ON a.idData = d.idData JOIN totali_regione tr ON tr.regione = c.regione AND tr.anno = d.anno GROUP BY c.città, c.regione, d.anno;",
  },
  {
    title: "Ranking città per regione",
    description:
      "All'interno di ogni regione, assegna un rank alle città per numero di transazioni decrescente.",
    answer:
      "SELECT c.regione, c.città, SUM(a.numeroDiTransazioni) AS totale, RANK() OVER (PARTITION BY c.regione ORDER BY SUM(a.numeroDiTransazioni) DESC) AS posizione FROM Attività a JOIN Citta c ON a.idCitta = c.idCitta GROUP BY c.regione, c.città;",
  },
  {
    title: "Totale speso per ogni prodotto, ordinato per quantità venduta",
    description:
      "Calcola il totale speso per ogni prodotto, ordinato in base alla quantità totale venduta.",
    answer:
      "SELECT p.name, SUM(oi.quantity * p.price) AS totale_speso FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.id ORDER BY totale_speso DESC;",
  },
  {
    title: "Media delle spese per utente per prodotto",
    description:
      "Calcola la spesa media per ciascun utente su ogni prodotto ordinato.",
    answer:
      "SELECT o.user_id, oi.product_id, AVG(oi.quantity * p.price) AS spesa_media FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id GROUP BY o.user_id, oi.product_id;",
  },
  {
    title: "Numero di ordini per prodotto in un anno",
    description:
      "Conta il numero di ordini per ciascun prodotto effettuati durante un determinato anno.",
    answer:
      "SELECT p.name, COUNT(DISTINCT oi.order_id) AS numero_ordini FROM products p JOIN order_items oi ON p.id = oi.product_id JOIN orders o ON oi.order_id = o.id JOIN Attività a ON o.id = a.idData JOIN Data d ON a.idData = d.idData WHERE d.anno = 2023 GROUP BY p.id;",
  },
  {
    title: "Utenti con più di un ordine, ordinati per numero di ordini",
    description:
      "Mostra gli utenti che hanno effettuato più di un ordine, ordinati per il numero totale di ordini.",
    answer:
      "SELECT u.name, COUNT(o.id) AS numero_ordini FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id HAVING COUNT(o.id) > 1 ORDER BY numero_ordini DESC;",
  },
  {
    title: "Prodotti più costosi ordinati più di una volta",
    description:
      "Mostra i prodotti più costosi che sono stati ordinati più di una volta, ordinati per prezzo decrescente.",
    answer:
      "SELECT p.name, p.price, SUM(oi.quantity) AS totale_quantita FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.id HAVING COUNT(oi.order_id) > 1 ORDER BY p.price DESC;",
  },
  {
    title: "Prodotti con il miglior rapporto tra quantità venduta e prezzo",
    description:
      "Mostra i prodotti con il miglior rapporto tra la quantità venduta e il prezzo unitario, ordinati per il rapporto più alto.",
    answer:
      "SELECT p.name, p.price, SUM(oi.quantity) AS totale_quantita, (SUM(oi.quantity) * 1.0) / p.price AS rapporto FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.id ORDER BY rapporto DESC;",
  },
  {
    title: "Ordini che superano il 50% della spesa totale per utente",
    description:
      "Mostra gli ordini il cui totale supera il 50% della spesa totale di ciascun utente.",
    answer:
      "SELECT o.id, o.user_id, o.total FROM orders o JOIN (SELECT user_id, SUM(total) AS spesa_totale FROM orders GROUP BY user_id) utente_spesa ON o.user_id = utente_spesa.user_id WHERE o.total > utente_spesa.spesa_totale / 2;",
  },
  {
    title: "Top 3 utenti che hanno speso di più",
    description: "Mostra i primi 3 utenti che hanno speso di più in totale.",
    answer:
      "SELECT u.name, SUM(o.total) AS totale_speso FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id ORDER BY totale_speso DESC LIMIT 3;",
  },
  {
    title: "Prodotti con la quantità più alta per ordine",
    description:
      "Mostra i prodotti che hanno la quantità più alta per ordine (media per prodotto).",
    answer:
      "SELECT p.name, AVG(oi.quantity) AS media_quantita FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.id ORDER BY media_quantita DESC;",
  },
  {
    title: "Utenti che non hanno effettuato ordini",
    description: "Mostra gli utenti che non hanno effettuato alcun ordine.",
    answer:
      "SELECT u.name FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE o.user_id IS NULL;",
  },
  {
    title:
      "Totale degli ordini per utente, ordinato per numero totale di ordini",
    description:
      "Mostra il totale degli ordini effettuati da ciascun utente, ordinato per numero totale di ordini.",
    answer:
      "SELECT u.name, COUNT(o.id) AS total_orders, RANK() OVER (ORDER BY COUNT(o.id) DESC) AS rank_by_orders FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id ORDER BY total_orders DESC;",
  },
  {
    title: "Ordine totale e media per utente con la posizione",
    description:
      "Mostra l'ordine totale e la media degli ordini per ogni utente, con la posizione rispetto agli altri utenti.",
    answer:
      "SELECT u.name, SUM(o.total) AS total_amount, AVG(o.total) OVER (PARTITION BY u.id) AS avg_order_amount, ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY SUM(o.total) DESC) AS rank_by_total_amount FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id ORDER BY total_amount DESC;",
  },
  {
    title: "Numero di ordini per mese e ordine cumulativo per utente",
    description:
      "Mostra il numero di ordini effettuati ogni mese per ciascun utente, insieme al numero di ordini cumulativo.",
    answer:
      "SELECT u.name, EXTRACT(MONTH FROM o.order_date) AS month, COUNT(o.id) AS orders_this_month, SUM(COUNT(o.id)) OVER (PARTITION BY u.id ORDER BY EXTRACT(MONTH FROM o.order_date)) AS cumulative_orders FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id, EXTRACT(MONTH FROM o.order_date) ORDER BY u.name, month;",
  },
  {
    title: "Media e deviazione standard degli ordini per utente per trimestre",
    description:
      "Mostra la media e la deviazione standard degli ordini per ogni utente, raggruppati per trimestre.",
    answer:
      "SELECT u.name, EXTRACT(QUARTER FROM o.order_date) AS quarter, AVG(o.total) AS avg_order_amount, STDDEV(o.total) OVER (PARTITION BY u.id ORDER BY EXTRACT(QUARTER FROM o.order_date)) AS stddev_order_amount FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id, EXTRACT(QUARTER FROM o.order_date) ORDER BY u.name, quarter;",
  },
  {
    title: "Classifica degli utenti per il totale degli ordini per mese",
    description:
      "Mostra la classifica degli utenti in base al totale degli ordini effettuati ogni mese.",
    answer:
      "SELECT u.name, EXTRACT(MONTH FROM o.order_date) AS month, SUM(o.total) AS total_orders_month, RANK() OVER (PARTITION BY EXTRACT(MONTH FROM o.order_date) ORDER BY SUM(o.total) DESC) AS rank_by_month FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id, EXTRACT(MONTH FROM o.order_date) ORDER BY month, rank_by_month;",
  }
];

export default function App() {
  const [db, setDb] = useState(null);
  const [query, setQuery] = useState("");
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem("currentStep");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [solved, setSolved] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(() => {
    const saved = localStorage.getItem("completedSteps");
    return saved ? JSON.parse(saved) : Array(esercizi.length).fill(false);
  });
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    const loadDb = async () => {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });
      const db = new SQL.Database();
      db.run(`
        CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
        INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
        INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');

        CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL);
        INSERT INTO products (name, price) VALUES ('Laptop', 1200.00);
        INSERT INTO products (name, price) VALUES ('Mouse', 25.50);

        CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, total REAL);
        INSERT INTO orders (user_id, total) VALUES (1, 1225.50);
        INSERT INTO orders (user_id, total) VALUES (2, 25.50);

        CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id));
        INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 1, 1);
        INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 2, 2);
        INSERT INTO order_items (order_id, product_id, quantity) VALUES (2, 2, 1);

        CREATE TABLE Citta (idCitta INTEGER PRIMARY KEY, città TEXT, regione TEXT);
        INSERT INTO Citta VALUES (1, 'Milano', 'Lombardia');
        INSERT INTO Citta VALUES (2, 'Bergamo', 'Lombardia');
        INSERT INTO Citta VALUES (3, 'Torino', 'Piemonte');

        CREATE TABLE Data (idData INTEGER PRIMARY KEY, data TEXT, mese TEXT, meseDellAnno INTEGER, semestre TEXT, anno INTEGER);
        INSERT INTO Data VALUES (1, '2023-01-01', 'Gennaio', 1, 'I', 2023);
        INSERT INTO Data VALUES (2, '2023-01-02', 'Gennaio', 1, 'I', 2023);
        INSERT INTO Data VALUES (3, '2023-01-03', 'Gennaio', 1, 'I', 2023);

        CREATE TABLE Attività (idData INTEGER, OperatoreVirtuale TEXT, idCitta INTEGER, numeroDiTransazioni INTEGER);
        INSERT INTO Attività VALUES (1, 'TIM', 1, 100);
        INSERT INTO Attività VALUES (2, 'TIM', 1, 200);
        INSERT INTO Attività VALUES (1, 'Vodafone', 2, 150);
        INSERT INTO Attività VALUES (2, 'Vodafone', 2, 150);
        INSERT INTO Attività VALUES (3, 'Iliad', 3, 300);
      `);
      setDb(db);
      setSelectedExercise(esercizi[currentStep]);
    };
    loadDb();
  }, []);

  const runQuery = () => {
    localStorage.setItem("currentStep", currentStep);
    setError(null);
    setOutput(null);
    setSolved(false);
    try {
      const res = db.exec(query);
      setOutput(res);
      if (
        selectedExercise &&
        query.trim().toLowerCase() ===
          selectedExercise.answer.trim().toLowerCase()
      ) {
        setSolved(true);
        const updated = [...completedSteps];
        if (!updated[currentStep]) {
          updated[currentStep] = true;
          setCompletedSteps(updated);
          localStorage.setItem("completedSteps", JSON.stringify(updated));
        }
      } else {
        setError("❌ La query non è corretta, riprova!");
      }
    } catch (e) {
      setOutput(null);
      setError(e.message);
    }
  };

  const renderResults = () => {
    if (!output || output.length === 0)
      return <p className="text-gray-400">Nessun risultato.</p>;
    const { columns, values } = output[0];
    return (
      <table className="table-auto border-collapse w-full mt-4 text-sm text-gray-200">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="border px-4 py-2 bg-gray-700 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((row, i) => (
            <tr key={i}>
              {row.map((val, j) => (
                <td key={j} className="border px-4 py-2 bg-gray-800">
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-gray-100">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">SQL Playground</h1>
          <div className="flex flex-col items-center">
            <Circle
              percent={
                (completedSteps.filter(Boolean).length / esercizi.length) * 100
              }
              strokeWidth={6}
              trailWidth={6}
              strokeColor="#4ade80"
              trailColor="#1f2937"
              style={{ width: 50 }}
            />
            <span className="text-xs mt-1 text-white">
              {Math.round(
                (completedSteps.filter(Boolean).length / esercizi.length) * 100
              )}
              %
            </span>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-400">
            📘 Esercizi disponibili:
          </label>
          <div className="flex gap-2 items-center">
            <select
              onChange={(e) => {
                const index = parseInt(e.target.value);
                const ex = esercizi[index];
                setSelectedExercise(ex);
                localStorage.setItem("currentStep", index);
                setQuery("");
                setCurrentStep(index);
                setSolved(false);
              }}
              className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-700"
              value={currentStep}
            >
              {esercizi.map((ex, idx) => (
                <option key={idx} value={idx}>
                  Step {idx + 1}: {ex.title}
                </option>
              ))}
            </select>
            <button
              className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600"
              onClick={() => {
                const prev = Math.max(currentStep - 1, 0);
                setSelectedExercise(esercizi[prev]);
                localStorage.setItem("currentStep", prev);
                setQuery("");
                setCurrentStep(prev);
                setSolved(false);
              }}
            >
              ⬅️ Indietro
            </button>
            <button
              className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600"
              onClick={() => {
                const next = Math.min(currentStep + 1, esercizi.length - 1);
                setSelectedExercise(esercizi[next]);
                localStorage.setItem("currentStep", next);
                setQuery("");
                setCurrentStep(next);
                setSolved(false);
              }}
            >
              Avanti ➡️
            </button>
          </div>
          {selectedExercise && (
            <div className="mt-2 text-sm text-gray-400 italic">
              Step {currentStep + 1}/{esercizi.length}
            </div>
          )}

          {solved && (
            <div className="mt-2 text-green-400 text-sm font-semibold">
              ✅ Query corretta!
              <details className="mt-2">
                <summary className="cursor-pointer underline text-green-300">
                  Mostra soluzione
                </summary>
                <pre className="bg-gray-800 text-white p-2 mt-1 rounded text-sm whitespace-pre-wrap">
                  {selectedExercise?.answer}
                </pre>
              </details>
            </div>
          )}

          {selectedExercise && (
            <p className="mt-2 text-sm text-gray-400 italic">
              {selectedExercise.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="mb-2 text-xs underline text-blue-400"
        >
          {showSolution ? "Nascondi" : "Mostra"} soluzione
        </button>
        {showSolution && (
          <pre className="bg-gray-800 text-white p-3 rounded text-sm whitespace-pre-wrap">
            {selectedExercise?.answer}
          </pre>
        )}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={5}
          className="w-full p-3 border border-gray-700 rounded-md font-mono text-sm bg-gray-800 text-white placeholder-gray-400"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={runQuery}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Esegui Query
          </button>
        </div>
        {/* Mostra risultati immediatamente dopo il bottone */}
        {output && renderResults()}
        {/* Mostra errore subito sotto se presente */}
        {error && <p className="text-red-500 mt-4">Errore: {error}</p>}
        <div className="mt-4 text-sm text-gray-400">
          <details className="mb-4">
            <summary className="cursor-pointer underline text-gray-300">
              🔍 Ispeziona tabella
            </summary>
            <div className="flex gap-2 mt-2">
              {["users", "products", "orders", "order_items"].map((table) => (
                <button
                  key={table}
                  onClick={() => setQuery(`PRAGMA table_info(${table});`)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                >
                  {table}
                </button>
              ))}
            </div>
          </details>
          <details className="mb-4">
            <summary className="cursor-pointer underline text-gray-300">
              📊 Visualizza struttura delle tabelle
            </summary>
            <pre className="bg-gray-800 text-white p-3 mt-2 rounded whitespace-pre-wrap text-sm">
              TABELLE DISPONIBILI: 📁 users(id INTEGER, name TEXT, email TEXT)
              📁 products(id INTEGER, name TEXT, price REAL) 📁 orders(id
              INTEGER, user_id INTEGER, total REAL) 📁 order_items(order_id
              INTEGER, product_id INTEGER, quantity INTEGER)
              <br></br>
              <hr></hr>
              <br></br>
              📁 Attività(idCitta INTEGER, idData INTEGER, numeroDiTransazioni
              INTEGER) 📁 Citta(idCitta INTEGER, città TEXT, regione TEXT) 📁
              Data(idData INTEGER, anno INTEGER)
            </pre>
          </details>
          <div>
            <p className="mb-1 font-semibold text-gray-300">
              📘 Guida rapida SQL:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-200">
              <li>
                <code className="text-blue-400">
                  SELECT * FROM nome_tabella;
                </code>{" "}
                – Mostra tutti i record
              </li>
              <li>
                <code className="text-blue-400">
                  SELECT col1, col2 FROM nome_tabella WHERE condizione;
                </code>{" "}
                – Filtra colonne e righe in base a una condizione
              </li>
              <li>
                <code className="text-blue-400">
                  SELECT name FROM sqlite_master WHERE type='table';
                </code>{" "}
                – Elenca tutte le tabelle (specifico per SQLite)
              </li>
              <li>
                <code className="text-blue-400">
                  SELECT col1, COUNT(*) FROM nome_tabella GROUP BY col1;
                </code>{" "}
                – Raggruppa i dati in base a <code>col1</code> e conta i record
                per gruppo
              </li>
              <li>
                <code className="text-blue-400">
                  SELECT col1, COUNT(*) FROM nome_tabella GROUP BY col1 HAVING
                  COUNT(*) &gt; 1;
                </code>{" "}
                – Filtra i gruppi con condizioni (es. solo gruppi con più di 1
                record)
              </li>
              <li>
                <code className="text-blue-400">
                  SELECT a.col1, b.col2 FROM tabella1 a JOIN tabella2 b ON a.id
                  = b.id;
                </code>{" "}
                – Unisce (JOIN) due tabelle in base a una condizione
              </li>
              <li>
                <code className="text-blue-400">
                  SELECT col1, RANK() OVER (PARTITION BY col2 ORDER BY col3
                  DESC) as rank_num FROM nome_tabella;
                </code>{" "}
                – Usa funzioni finestra per assegnare ranking ai record, divisi
                per gruppi definiti da <code>PARTITION BY</code>
              </li>
              <li>
                <code className="text-blue-400">
                  SELECT col1, AVG(col2) OVER (PARTITION BY col3) FROM
                  nome_tabella;
                </code>{" "}
                – Calcola la media di <code>col2</code> all’interno di ogni
                partizione definita da <code>col3</code> senza raggruppare i
                risultati
              </li>
            </ul>
          </div>
        </div>
        -
      </div>
      <div>
        <li style={{ height: "1rem" }}></li>
      </div>
      <div style={{ textAlign: "center" }}>
        Developed by{" "}
        <a
          href="https://www.github.com/longobucco"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#add8e6" }}
        >
          Luca Visconti
        </a>
      </div>
    </div>
  );
}
