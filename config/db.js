// config/db.js
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Création du pool de connexions
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  idleTimeoutMillis: 30000,       // 30s avant de fermer une connexion inactive
  connectionTimeoutMillis: 2000,  // 2s de timeout pour la connexion
});

// Fonction pour exécuter les requêtes
export const query = (text, params) => pool.query(text, params);

// Gestion des erreurs globales du pool
pool.on('error', (err) => {
  console.error('Erreur dans le pool PostgreSQL:', err);
});


// Tester la connexion
pool.connect()
  .then(() => console.log("Connexion PostgreSQL réussie ✔"))
  .catch((err) => console.error("Erreur connexion PostgreSQL ❌", err));

export default pool;
