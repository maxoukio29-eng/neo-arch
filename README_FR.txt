NEO ARCH — VERSION 2
====================

CE QUE CONTIENT LE PROJET
- Site public responsive : accueil, catalogue, fiches espèce.
- Console admin responsive : connexion, création/modification/suppression.
- Téléversement de photos dans Supabase Storage.
- Base PostgreSQL et règles de sécurité (RLS) dans sql/setup.sql.
- Mode démonstration sans Supabase : quelques espèces d'exemple sont visibles.
  Le mode démo ne permet PAS une synchronisation réelle ni une administration réelle.

1) TESTER EN LOCAL
- Décompresse neo_arch_v2.zip.
- Ouvre le dossier neo_arch_v2 dans VS Code.
- Dans Terminal > Nouveau terminal, exécute :
    py -m http.server 5500
- Ouvre http://localhost:5500
- Catalogue : http://localhost:5500/catalogue.html
- Admin : http://localhost:5500/admin.html
- Arrêter le serveur : Ctrl + C.

2) CONNECTER SUPABASE (nécessaire pour synchroniser téléphone + ordinateur)
A. Crée un projet Supabase.
B. Dans le projet, ouvre SQL Editor > New query.
C. Copie-colle le contenu de sql/setup.sql puis clique Run.
D. Dans Authentication > Users, crée un utilisateur administrateur avec ton adresse e-mail et un mot de passe solide.
   Ne publie pas de formulaire d'inscription ouvert.
E. Copie l'UUID de cet utilisateur depuis Authentication > Users.
F. Dans SQL Editor, exécute :
   insert into public.admin_users (user_id) values ('COLLE-ICI-UUID');
G. Dans Project Settings > API (ou Connect), copie Project URL et la clé publishable.
H. Ouvre js/config.js et renseigne :
   supabaseUrl: "https://TON-PROJET.supabase.co",
   supabaseKey: "TA_CLE_PUBLISHABLE"
   La clé publishable/anon est faite pour le navigateur avec RLS activé.
   NE JAMAIS mettre une clé secret ou service_role dans ce projet.
I. Enregistre, recharge le site. La connexion admin doit maintenant fonctionner.

3) UTILISER L'ADMIN
- Ouvre /admin.html.
- Connecte-toi avec le compte créé dans Supabase.
- Remplis la fiche, choisis une photo, coche "Publier" si tu veux la rendre visible.
- Enregistre. La fiche apparaît sur le catalogue public.
- Sur téléphone, le site doit être déployé en ligne ; utilise alors la même URL publique suivie de /admin.html.
  En local, localhost sur le téléphone ne pointe pas vers ton ordinateur. Pour tester sur le même Wi-Fi,
  utilise l'adresse IPv4 du PC suivie de :5500/admin.html.

4) PUBLICATION
Ce projet est un site statique. Il peut être déployé sur un hébergeur statique gratuit, par exemple GitHub Pages.
Avant publication, configure les URL autorisées dans Supabase Authentication > URL Configuration :
- Site URL : adresse publique du site
- Redirect URLs : ajoute l'adresse publique du site et son chemin si nécessaire.
Le site utilise un CDN pour charger supabase-js et Google Fonts : une connexion Internet est nécessaire.

5) IMPORTANT — SÉCURITÉ ET SCIENCE
- N'utilise jamais la clé secret/service_role dans js/config.js.
- Les autorisations reposent sur les politiques SQL RLS ; ne les désactive pas.
- Vérifie les données taxonomiques et les statuts de conservation auprès de sources fiables.
- N'importe pas une photo trouvée en ligne sans vérifier sa licence et ses conditions de réutilisation.
- Cette base est un socle de départ, pas encore un système de validation scientifique collaborative.
