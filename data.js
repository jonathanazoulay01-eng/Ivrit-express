// Programme d'hébreu moderne — 12 étapes.
// nikud : "full"  = voyelles partout (début)
//         "learn" = voyelles pendant l'apprentissage, cachées pendant les quiz
//         "none"  = pas de voyelles (bouton pour les afficher si besoin)
// Mots : [hébreu avec voyelles, prononciation, français]
// Phrases : [hébreu avec voyelles, français]
const UNITS = [
  {
    id: 1, emoji: "👋", title: "Bonjour !", nikud: "full",
    words: [
      ["שָׁלוֹם", "shalom", "bonjour / salut"],
      ["בֹּקֶר טוֹב", "boker tov", "bonjour (le matin)"],
      ["עֶרֶב טוֹב", "erev tov", "bonsoir"],
      ["לַיְלָה טוֹב", "layla tov", "bonne nuit"],
      ["תּוֹדָה", "toda", "merci"],
      ["בְּבַקָּשָׁה", "bevakasha", "s'il te plaît / de rien"],
      ["כֵּן", "ken", "oui"],
      ["לֹא", "lo", "non"],
      ["סְלִיחָה", "slicha", "pardon / excuse-moi"],
      ["מָה נִשְׁמַע?", "ma nishma ?", "ça va ? (quoi de neuf ?)"]
    ],
    sentences: [
      ["שָׁלוֹם, מָה נִשְׁמַע?", "Salut, ça va ?"],
      ["כֵּן, תּוֹדָה רַבָּה!", "Oui, merci beaucoup !"],
      ["בֹּקֶר טוֹב, אִמָּא!", "Bonjour, maman !"],
      ["סְלִיחָה, לֹא תּוֹדָה.", "Pardon, non merci."],
      ["לַיְלָה טוֹב וְשָׁלוֹם.", "Bonne nuit et au revoir."]
    ]
  },
  {
    id: 2, emoji: "👨‍👩‍👧‍👦", title: "La famille", nikud: "full",
    words: [
      ["אַבָּא", "aba", "papa"],
      ["אִמָּא", "ima", "maman"],
      ["אָח", "a'h", "frère"],
      ["אָחוֹת", "a'hot", "sœur"],
      ["סָבָא", "saba", "grand-père"],
      ["סָבְתָא", "savta", "grand-mère"],
      ["מִשְׁפָּחָה", "mishpa'ha", "famille"],
      ["יֶלֶד", "yeled", "garçon / enfant"],
      ["יַלְדָּה", "yalda", "fille (enfant)"],
      ["הוֹרִים", "horim", "parents"]
    ],
    sentences: [
      ["זֶה אַבָּא שֶׁלִּי.", "C'est mon père."],
      ["יֵשׁ לִי אָח וְאָחוֹת.", "J'ai un frère et une sœur."],
      ["הַמִּשְׁפָּחָה שֶׁלִּי גְּדוֹלָה.", "Ma famille est grande."],
      ["סָבְתָא אוֹהֶבֶת אֶת הַיְּלָדִים.", "Grand-mère aime les enfants."],
      ["הַהוֹרִים שֶׁלִּי בַּבַּיִת.", "Mes parents sont à la maison."]
    ]
  },
  {
    id: 3, emoji: "🎒", title: "À l'école", nikud: "full",
    words: [
      ["בֵּית סֵפֶר", "beit sefer", "école"],
      ["מוֹרֶה", "more", "professeur (homme)"],
      ["מוֹרָה", "mora", "professeure (femme)"],
      ["תַּלְמִיד", "talmid", "élève"],
      ["סֵפֶר", "sefer", "livre"],
      ["מַחְבֶּרֶת", "ma'hberet", "cahier"],
      ["עֵט", "et", "stylo"],
      ["עִפָּרוֹן", "iparon", "crayon"],
      ["כִּתָּה", "kita", "classe"],
      ["שִׁעוּרֵי בַּיִת", "shiourei bayit", "devoirs"]
    ],
    sentences: [
      ["אֲנִי הוֹלֵךְ לְבֵית הַסֵּפֶר.", "Je vais à l'école."],
      ["יֵשׁ לִי עֵט וּמַחְבֶּרֶת.", "J'ai un stylo et un cahier."],
      ["הַמּוֹרֶה נוֹתֵן שִׁעוּרֵי בַּיִת.", "Le prof donne des devoirs."],
      ["הַסֵּפֶר בַּכִּתָּה.", "Le livre est dans la classe."],
      ["הַמּוֹרָה שֶׁלִּי נֶחְמָדָה.", "Ma prof est gentille."]
    ]
  },
  {
    id: 4, emoji: "🍕", title: "Manger et boire", nikud: "full",
    words: [
      ["לֶחֶם", "le'hem", "pain"],
      ["מַיִם", "mayim", "eau"],
      ["חָלָב", "'halav", "lait"],
      ["תַּפּוּחַ", "tapoua'h", "pomme"],
      ["בֵּיצָה", "beitsa", "œuf"],
      ["גְּבִינָה", "guevina", "fromage"],
      ["עוֹף", "of", "poulet"],
      ["אֹרֶז", "orez", "riz"],
      ["פִּיצָה", "pitsa", "pizza"],
      ["אֲרוּחַת בֹּקֶר", "arou'hat boker", "petit-déjeuner"]
    ],
    sentences: [
      ["אֲנִי אוֹכֵל תַּפּוּחַ.", "Je mange une pomme."],
      ["אֲנִי רוֹצָה מַיִם, בְּבַקָּשָׁה.", "Je veux de l'eau, s'il te plaît. (fille)"],
      ["בַּאֲרוּחַת בֹּקֶר יֵשׁ לֶחֶם וּגְבִינָה.", "Au petit-déjeuner, il y a du pain et du fromage."],
      ["אַתָּה אוֹהֵב פִּיצָה?", "Tu aimes la pizza ? (garçon)"],
      ["אִמָּא עוֹשָׂה עוֹף וְאֹרֶז.", "Maman fait du poulet et du riz."]
    ]
  },
  {
    id: 5, emoji: "🏠", title: "La maison", nikud: "learn",
    words: [
      ["בַּיִת", "bayit", "maison"],
      ["חֶדֶר", "'heder", "chambre / pièce"],
      ["מִטְבָּח", "mitba'h", "cuisine"],
      ["שֻׁלְחָן", "shoul'han", "table"],
      ["כִּסֵּא", "kisse", "chaise"],
      ["מִטָּה", "mita", "lit"],
      ["דֶּלֶת", "delet", "porte"],
      ["חַלּוֹן", "'halon", "fenêtre"],
      ["סָלוֹן", "salon", "salon"],
      ["מִקְלַחַת", "mikla'hat", "douche"]
    ],
    sentences: [
      ["הַחֶדֶר שֶׁלִּי קָטָן.", "Ma chambre est petite."],
      ["אִמָּא בַּמִּטְבָּח.", "Maman est dans la cuisine."],
      ["תִּסְגֹּר אֶת הַדֶּלֶת, בְּבַקָּשָׁה.", "Ferme la porte, s'il te plaît."],
      ["הַסֵּפֶר עַל הַשֻּׁלְחָן.", "Le livre est sur la table."],
      ["אֲנִי בַּמִּקְלַחַת!", "Je suis sous la douche !"]
    ]
  },
  {
    id: 6, emoji: "🎨", title: "Couleurs et nombres", nikud: "learn",
    words: [
      ["אַחַת", "a'hat", "un (1)"],
      ["שְׁתַּיִם", "shtayim", "deux (2)"],
      ["שָׁלוֹשׁ", "shalosh", "trois (3)"],
      ["אַרְבַּע", "arba", "quatre (4)"],
      ["חָמֵשׁ", "'hamesh", "cinq (5)"],
      ["אָדֹם", "adom", "rouge"],
      ["כָּחֹל", "ka'hol", "bleu"],
      ["יָרֹק", "yarok", "vert"],
      ["לָבָן", "lavan", "blanc"],
      ["שָׁחֹר", "sha'hor", "noir"]
    ],
    sentences: [
      ["הַתַּפּוּחַ אָדֹם.", "La pomme est rouge."],
      ["הַשֻּׁלְחָן לָבָן.", "La table est blanche."],
      ["יֵשׁ שָׁלוֹשׁ בֵּיצִים בַּמִּטְבָּח.", "Il y a trois œufs dans la cuisine."],
      ["הַסֵּפֶר הַיָּרֹק עַל הַמִּטָּה.", "Le livre vert est sur le lit."],
      ["יֵשׁ לִי חָמֵשׁ מַחְבָּרוֹת.", "J'ai cinq cahiers."]
    ]
  },
  {
    id: 7, emoji: "📅", title: "Le temps et les jours", nikud: "learn",
    words: [
      ["הַיּוֹם", "hayom", "aujourd'hui"],
      ["מָחָר", "ma'har", "demain"],
      ["אֶתְמוֹל", "etmol", "hier"],
      ["שָׁבוּעַ", "shavoua", "semaine"],
      ["שַׁבָּת", "shabbat", "shabbat / samedi"],
      ["יוֹם רִאשׁוֹן", "yom rishon", "dimanche"],
      ["בֹּקֶר", "boker", "matin"],
      ["עֶרֶב", "erev", "soir"],
      ["שָׁעָה", "sha'a", "heure"],
      ["עַכְשָׁו", "a'hshav", "maintenant"]
    ],
    sentences: [
      ["מָחָר יֵשׁ בֵּית סֵפֶר.", "Demain, il y a école."],
      ["מָה הַשָּׁעָה עַכְשָׁו?", "Quelle heure est-il maintenant ?"],
      ["בְּשַׁבָּת אֲנַחְנוּ בַּבַּיִת.", "Le shabbat, nous sommes à la maison."],
      ["אֶתְמוֹל הָיָה יוֹם רִאשׁוֹן.", "Hier, c'était dimanche."],
      ["הַיּוֹם יֵשׁ לִי שִׁעוּרֵי בַּיִת.", "Aujourd'hui, j'ai des devoirs."]
    ]
  },
  {
    id: 8, emoji: "🏃", title: "Les verbes du quotidien", nikud: "learn",
    words: [
      ["אוֹכֵל", "o'hel", "mange"],
      ["שׁוֹתֶה", "shote", "boit"],
      ["הוֹלֵךְ", "hole'h", "va / marche"],
      ["יָשֵׁן", "yashen", "dort"],
      ["לוֹמֵד", "lomed", "apprend / étudie"],
      ["כּוֹתֵב", "kotev", "écrit"],
      ["קוֹרֵא", "kore", "lit"],
      ["מְדַבֵּר", "medaber", "parle"],
      ["רוֹצֶה", "rotse", "veut"],
      ["אוֹהֵב", "ohev", "aime"]
    ],
    sentences: [
      ["אֲנִי לוֹמֵד עִבְרִית.", "J'apprends l'hébreu."],
      ["הוּא שׁוֹתֶה מַיִם.", "Il boit de l'eau."],
      ["הִיא קוֹרֵאת סֵפֶר.", "Elle lit un livre."],
      ["אַתָּה מְדַבֵּר עִבְרִית?", "Tu parles hébreu ?"],
      ["אַבָּא יָשֵׁן בַּסָּלוֹן.", "Papa dort dans le salon."]
    ]
  },
  {
    id: 9, emoji: "⚽", title: "Loisirs et amis", nikud: "none",
    words: [
      ["כַּדּוּרֶגֶל", "kadouregel", "football"],
      ["טֶלֶפוֹן", "telefon", "téléphone"],
      ["חָבֵר", "'haver", "ami / copain"],
      ["חֲבֵרָה", "'havera", "amie / copine"],
      ["מִשְׂחָק", "mis'hak", "jeu / match"],
      ["סֶרֶט", "seret", "film"],
      ["מוּזִיקָה", "mouzika", "musique"],
      ["יָם", "yam", "mer"],
      ["מְשַׂחֵק", "mesa'hek", "joue"],
      ["טִיּוּל", "tiyoul", "sortie / balade"]
    ],
    sentences: [
      ["אֲנִי מְשַׂחֵק כַּדּוּרֶגֶל עִם חֲבֵרִים.", "Je joue au foot avec des amis."],
      ["בּוֹא נִרְאֶה סֶרֶט!", "Viens, on regarde un film !"],
      ["בַּקַּיִץ אֲנַחְנוּ הוֹלְכִים לַיָּם.", "En été, nous allons à la mer."],
      ["הִיא אוֹהֶבֶת מוּזִיקָה.", "Elle aime la musique."],
      ["אֵיפֹה הַטֶּלֶפוֹן שֶׁלִּי?", "Où est mon téléphone ?"]
    ]
  },
  {
    id: 10, emoji: "🚌", title: "En ville", nikud: "none",
    words: [
      ["עִיר", "ir", "ville"],
      ["רְחוֹב", "re'hov", "rue"],
      ["אוֹטוֹבּוּס", "otobous", "bus"],
      ["חֲנוּת", "'hanout", "magasin"],
      ["כֶּסֶף", "kessef", "argent"],
      ["אֵיפֹה", "eifo", "où"],
      ["כַּמָּה", "kama", "combien"],
      ["יָמִינָה", "yamina", "à droite"],
      ["שְׂמֹאלָה", "smola", "à gauche"],
      ["יָשָׁר", "yashar", "tout droit"]
    ],
    sentences: [
      ["אֵיפֹה הָאוֹטוֹבּוּס?", "Où est le bus ?"],
      ["כַּמָּה זֶה עוֹלֶה?", "Combien ça coûte ?"],
      ["הַחֲנוּת יָמִינָה.", "Le magasin est à droite."],
      ["יְרוּשָׁלַיִם עִיר יָפָה.", "Jérusalem est une belle ville."],
      ["אֵין לִי כֶּסֶף.", "Je n'ai pas d'argent."]
    ]
  },
  {
    id: 11, emoji: "🩺", title: "Le corps", nikud: "none",
    words: [
      ["רֹאשׁ", "rosh", "tête"],
      ["יָד", "yad", "main"],
      ["רֶגֶל", "reguel", "jambe / pied"],
      ["עַיִן", "ayin", "œil"],
      ["פֶּה", "pe", "bouche"],
      ["אַף", "af", "nez"],
      ["אֹזֶן", "ozen", "oreille"],
      ["בֶּטֶן", "beten", "ventre"],
      ["רוֹפֵא", "rofe", "médecin"],
      ["כּוֹאֵב", "koev", "fait mal"]
    ],
    sentences: [
      ["כּוֹאֵב לִי הָרֹאשׁ.", "J'ai mal à la tête."],
      ["כּוֹאֶבֶת לִי הַבֶּטֶן.", "J'ai mal au ventre."],
      ["אֲנִי הוֹלֵךְ לָרוֹפֵא.", "Je vais chez le médecin."],
      ["תִּשְׁטֹף יָדַיִם!", "Lave-toi les mains !"],
      ["יֵשׁ לוֹ רֶגֶל שְׁבוּרָה.", "Il a une jambe cassée."]
    ]
  },
  {
    id: 12, emoji: "😎", title: "Émotions et argot", nikud: "none",
    words: [
      ["שָׂמֵחַ", "same'ah", "content"],
      ["עָצוּב", "atsouv", "triste"],
      ["עָיֵף", "ayef", "fatigué"],
      ["רָעֵב", "ra'ev", "affamé (a faim)"],
      ["כּוֹעֵס", "koes", "en colère"],
      ["מְפַחֵד", "mefa'hed", "a peur"],
      ["מְשַׁעֲמֵם", "mesha'amem", "ennuyeux"],
      ["כֵּיף", "kef", "le fun / sympa"],
      ["אַחְלָה", "a'hla", "génial (argot)"],
      ["סַבָּבָּה", "sababa", "OK / cool (argot)"]
    ],
    sentences: [
      ["אֲנִי עָיֵף, אֲנִי הוֹלֵךְ לִישֹׁן.", "Je suis fatigué, je vais dormir."],
      ["אַתָּה רָעֵב?", "Tu as faim ?"],
      ["הַסֶּרֶט הָיָה מְשַׁעֲמֵם.", "Le film était ennuyeux."],
      ["נִפָּגֵשׁ מָחָר? סַבָּבָּה!", "On se voit demain ? OK !"],
      ["הָיָה כֵּיף בַּטִּיּוּל!", "C'était super, la sortie !"]
    ]
  }
];
