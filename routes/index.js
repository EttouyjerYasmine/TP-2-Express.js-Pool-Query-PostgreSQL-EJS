import { Router } from 'express';
import { query } from '../config/db.js';
import { body, validationResult } from 'express-validator';

const validateUser = [
  body('nom')
    .isLength({ min: 2 })
    .withMessage('Le nom doit contenir au moins 2 caractères.')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Email invalide.')
    .normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/home', {
        title: 'Erreur',
        users: [],
        error: errors.array().map(e => e.msg).join(', ')
      });
    }
    next();
  }
];

const router = Router();

// GET / – page d’accueil et liste des utilisateurs
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT id, nom, email FROM users ORDER BY id DESC LIMIT 10');
    res.render('pages/home', { title: 'Accueil', users: rows, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/home', { title: 'Erreur', users: [], error: 'Erreur serveur' });
  }
});

// POST /users – création
router.post('/users', validateUser, async (req, res) => {
  const { nom, email } = req.body;
  try {
    await query(
      'INSERT INTO users (nom, email) VALUES ($1, $2)',
      [nom, email]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/home', { title: 'Erreur', users: [], error: 'Échec de création' });
  }
});

// POST /users/:id/edit – mise à jour
router.post('/users/:id/edit', validateUser, async (req, res) => {
  const { id } = req.params;
  const { nom, email } = req.body;
  try {
    await query(
      'UPDATE users SET nom=$1, email=$2 WHERE id=$3',
      [nom, email, id]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur de mise à jour');
  }
});

// POST /users/:id/delete – suppression
router.post('/users/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM users WHERE id=$1', [id]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur de suppression');
  }
});

export default router;
