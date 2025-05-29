# BlackBox 🖤🔐

> _"Un coffre-fort crypté. Multi-algos. Pour l'ère post-quantique."_  
> Web app de chiffrement avancée, pour hackers, pros et rêveurs du code.

---

## ⚙️ Présentation

**BlackBox** est une application web de chiffrement multi-algorithmes pensée pour la sécurité et la discrétion.  
Tu peux chiffrer tes données avec des standards éprouvés, mais aussi avec un algorithme **custom** exclusif, ou bientôt en post-quantum (Kyber en développement).

---

## 🧰 Installation

Pour lancer l’application en local :

```
npm install
npm run dev
```

Une fois démarré, rends-toi sur :  
👉 [http://localhost:5173](http://localhost:5173)

Pour générer la version optimisée pour la production :

```
npm run build
```

---

## 🚀 Fonctionnalités clés

- 🎛️ Choix entre AES-256-GCM, ChaCha20-Poly1305, algorithme custom, et Kyber (en cours)  
- 🔑 Clés dérivées avec PBKDF2, salts aléatoires, et stretching fort  
- 🕵️‍♂️ Double couche de chiffrement dans l’algorithme custom, avec obfuscation avancée  
- 🔒 Intégrité des données garantie par HMAC-SHA256  
- 🌑 Mode stealth (UI) prêt, cryptage stealth à venir  
- 💻 100% Web Crypto API, client-side only  

---

## 💀 Algorithme Custom — "Double Lock & Obfuscate"

L’algorithme custom de BlackBox.js est une construction hybride à plusieurs couches, conçue pour renforcer la sécurité au-delà d’un simple chiffrement symétrique. Voici son fonctionnement en détail :

### Étapes de chiffrement

1. **Dérivation de clés multiples**  
   Le mot de passe utilisateur est utilisé avec deux sels aléatoires différents (`salt1` et `salt2`) pour générer **deux clés distinctes** via PBKDF2 (100 000 itérations, SHA-256).  
   Cela crée une base solide et isolée pour chaque couche, réduisant les risques de compromission en cas de fuite d’une clé.

2. **Première couche — ChaCha20**  
   Le texte clair est d’abord chiffré avec ChaCha20 en utilisant la première clé (`key1`).  
   ChaCha20 est rapide, sécurisé et parfait pour les environnements web.

3. **Calcul du hash d’intégrité**  
   Un hash HMAC-SHA256 est généré sur le texte chiffré de la première couche avec une clé d’intégrité dérivée du mot de passe + suffixe `"INTEGRITY"`.  
   Ce hash assure que les données ne seront pas altérées silencieusement.

4. **Obfuscation dynamique**  
   Le résultat de la première couche est ensuite passé dans une fonction d’obfuscation pseudo-aléatoire.  
   - Elle insère des caractères spéciaux (`§`, `¢`, `€`, etc.) à des positions variables selon une graine aléatoire (`obfuscationSeed`), brouillant ainsi la structure des données.  
   - Cette étape complique la reconnaissance de patterns et rend l’analyse cryptographique plus ardue.

5. **Seconde couche — AES-256-GCM**  
   La donnée obfusquée est ensuite chiffrée une seconde fois avec AES-256-GCM et la deuxième clé dérivée (`key2`).  
   Cette couche ajoute une sécurité supplémentaire par chiffrement standardisé, garantissant confidentialité et intégrité grâce à GCM.

6. **Assemblage final**  
   Le résultat final combine dans une chaîne les deux sels (`salt1`, `salt2`), la graine d’obfuscation, le hash d’intégrité, et le texte chiffré AES, séparés par des `|`.  
   Cette structure permet une déchiffrement et une vérification précises.

---

### Étapes de déchiffrement

1. Extraction des sels, graine d’obfuscation, hash d’intégrité et données chiffrées.  
2. Re-dérivation des deux clés avec les sels et le mot de passe.  
3. Déchiffrement AES-256-GCM (seconde couche) sur les données obfusquées.  
4. Suppression des caractères d’obfuscation pour retrouver le texte chiffré ChaCha20 original.  
5. Vérification du hash d’intégrité (HMAC-SHA256) — si la vérification échoue, le processus s’arrête (données altérées ou mot de passe invalide).  
6. Déchiffrement ChaCha20 (première couche) pour retrouver le texte clair.

---

## 🔐 Pourquoi cette approche ?

- **Double clé, double couche :** Séparer les clés et couches limite les risques en cas d’attaque sur une partie seulement.  
- **Obfuscation :** Ajouter un “bruit” spécifique rend l’attaque statistique et l’analyse par pattern plus complexes.  
- **Intégrité renforcée :** La vérification HMAC à l’intérieur évite toute manipulation sans détection.  
- **Compatible web :** Basé sur Web Crypto API, 100% côté client, donc confidentialité maximale.

---

## ⚠️ Limitations actuelles

- Le mode stealth est actuellement seulement visuel, le cryptage stealth est en projet.  
- L’algorithme Kyber est pour l’instant simulé, implémentation réelle à venir.

---

## 📚 Ressources techniques

- [Web Crypto API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)  
- [RFC 8439 — ChaCha20-Poly1305](https://datatracker.ietf.org/doc/html/rfc8439)
- [NIST Post Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [AES-GCM Standard](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- Recherche sur obfuscation et cryptographie multi-couches

---

## 🤖 Contributions & Feedback

Open source, en constante évolution. Toute aide pour finaliser Kyber ou améliorer le mode stealth sera bienvenue.  
Contacte-moi pour partager tes idées ou questions.

---

# Gardons nos secrets hors de portée. Toujours. 🖤🔐
