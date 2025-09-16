const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Chemins des dossiers à nettoyer
const nextCachePath = path.join(__dirname, '.next');
const nodeCachePath = path.join(__dirname, 'node_modules', '.cache');

// Fonction pour supprimer un dossier s'il existe
function removeDirIfExists(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`Nettoyage du dossier: ${dirPath}`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Dossier supprimé: ${dirPath}`);
    } catch (err) {
      console.error(`Erreur lors de la suppression de ${dirPath}:`, err);
    }
  }
}

// Nettoyer les caches
removeDirIfExists(nextCachePath);
removeDirIfExists(nodeCachePath);

// Démarrer le serveur de développement
console.log('Démarrage du serveur Next.js...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Erreur lors du démarrage du serveur:', error);
  process.exit(1);
}