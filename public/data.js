// Contenu pédagogique de NeuroPlay : leçons, quiz, glossaire, ressources.
window.NEURO = {};

NEURO.lessons = [
  {
    id: "neurone",
    icon: "⚡",
    title: "Le neurone, la brique de base",
    minutes: 4,
    body: [
      "Votre cerveau contient environ <b>86 milliards de neurones</b>. Un neurone est une cellule spécialisée dans une seule chose : recevoir des signaux, les additionner, et décider s'il transmet à son tour.",
      "Il a trois parties : les <b>dendrites</b> (des « antennes » ramifiées qui reçoivent les messages), le <b>corps cellulaire</b> (qui fait le calcul) et l'<b>axone</b> (un long câble qui envoie le message plus loin, parfois jusqu'à un mètre de long, du bas du dos au pied).",
      "Le message est <b>électrique</b>. Au repos, l'intérieur du neurone est légèrement négatif (environ −70 millivolts). Quand il reçoit assez de stimulations pour franchir un <b>seuil</b>, il déclenche un <b>potentiel d'action</b> : une brève impulsion qui file le long de l'axone.",
      "C'est du <b>tout ou rien</b> : un neurone ne « tire » pas plus fort pour un message important, il tire <i>plus souvent</i>. L'intensité est codée par la fréquence.",
      "Beaucoup d'axones sont entourés d'une gaine de <b>myéline</b>, un isolant qui accélère le signal jusqu'à plus de 100 m/s (environ 400 km/h)."
    ],
    fact: "Les neurones ne sont pas seuls : les cellules gliales (astrocytes, microglie…) sont à peu près aussi nombreuses. Elles nourrissent, protègent et nettoient le cerveau.",
    game: "neurone",
    quiz: [
      { q: "Quelle partie du neurone reçoit les messages ?", a: ["L'axone", "Les dendrites", "La myéline"], ok: 1,
        why: "Les dendrites sont les antennes d'entrée ; l'axone est le câble de sortie." },
      { q: "Comment un neurone code-t-il un signal plus intense ?", a: ["Il tire plus souvent", "Il tire plus fort", "Il change de couleur"], ok: 0,
        why: "Le potentiel d'action est « tout ou rien » : c'est la fréquence des impulsions qui augmente." },
      { q: "À quoi sert la myéline ?", a: ["À stocker les souvenirs", "À accélérer le signal", "À fabriquer de la dopamine"], ok: 1,
        why: "C'est un isolant électrique : le signal « saute » d'un trou à l'autre de la gaine et va bien plus vite." }
    ]
  },
  {
    id: "synapse",
    icon: "🔗",
    title: "La synapse : quand les neurones se parlent",
    minutes: 4,
    body: [
      "Deux neurones ne se touchent pas. Entre le bout de l'axone de l'un et la dendrite de l'autre, il y a un minuscule espace d'environ 20 nanomètres : la <b>fente synaptique</b>. L'ensemble s'appelle une <b>synapse</b>.",
      "Quand le signal électrique arrive au bout de l'axone, il libère des molécules chimiques : les <b>neurotransmetteurs</b>. Elles traversent la fente et se fixent sur des <b>récepteurs</b> du neurone suivant, comme une clé dans une serrure.",
      "Certains neurotransmetteurs <b>excitent</b> (ils poussent le neurone suivant vers son seuil) : le principal est le <b>glutamate</b>. D'autres <b>inhibent</b> (ils le freinent) : le principal est le <b>GABA</b>. Le cerveau fonctionne grâce à l'équilibre entre les deux.",
      "D'autres, comme la <b>dopamine</b> (motivation, apprentissage par la récompense) ou la <b>sérotonine</b> (humeur, sommeil, appétit), agissent plutôt comme des « régulateurs de volume » sur des réseaux entiers.",
      "Un seul neurone peut avoir des milliers de synapses. On estime qu'il y en a des centaines de milliers de milliards dans un cerveau humain."
    ],
    fact: "La dopamine n'est pas « l'hormone du plaisir » : elle signale surtout qu'une récompense est meilleure (ou pire) que prévu. C'est un signal d'apprentissage.",
    game: "neurone",
    quiz: [
      { q: "Comment le message traverse-t-il la fente synaptique ?", a: ["Par un courant électrique direct", "Grâce aux neurotransmetteurs", "Par le sang"], ok: 1,
        why: "Le signal électrique devient chimique : des neurotransmetteurs traversent la fente." },
      { q: "Quel est le principal neurotransmetteur inhibiteur ?", a: ["Le glutamate", "La dopamine", "Le GABA"], ok: 2,
        why: "Le GABA freine l'activité. Beaucoup de somnifères et d'anxiolytiques renforcent son effet." },
      { q: "La dopamine sert surtout à…", a: ["Signaler une récompense inattendue", "Isoler les axones", "Voir les couleurs"], ok: 0,
        why: "Elle code l'écart entre ce qu'on attendait et ce qu'on obtient, ce qui aide à apprendre." }
    ]
  },
  {
    id: "carte",
    icon: "🗺️",
    title: "La carte du cerveau",
    minutes: 5,
    body: [
      "Le cerveau est divisé en deux <b>hémisphères</b>, gauche et droit, reliés par un gros pont de fibres : le <b>corps calleux</b>. Chaque hémisphère contrôle surtout le côté <i>opposé</i> du corps.",
      "La surface plissée s'appelle le <b>cortex</b>. On la découpe en quatre <b>lobes</b> :",
      "• <b>Frontal</b> (à l'avant) : planifier, décider, se contrôler, parler (aire de Broca, souvent à gauche) et commander les mouvements.<br>• <b>Pariétal</b> (sur le dessus, vers l'arrière) : le toucher, la position du corps, l'orientation dans l'espace.<br>• <b>Temporal</b> (sur les côtés, au niveau des tempes) : l'audition, la compréhension du langage, et, en dessous, l'hippocampe, clé de la mémoire.<br>• <b>Occipital</b> (tout à l'arrière) : la vision. Oui, on voit avec l'arrière de la tête !",
      "Sous le cortex, à l'arrière, le <b>cervelet</b> coordonne les mouvements et l'équilibre (et contient à lui seul la majorité des neurones). Le <b>tronc cérébral</b>, qui relie le cerveau à la moelle épinière, gère les fonctions vitales automatiques : respiration, rythme cardiaque, éveil.",
      "Attention : ces zones travaillent toujours <b>en réseau</b>. Une fonction comme lire mobilise la vision, le langage, l'attention et la mémoire en même temps."
    ],
    fact: "Le mythe des « 10 % du cerveau » est faux : l'imagerie montre que toutes les régions sont actives, simplement pas toutes au même moment.",
    game: "carte",
    quiz: [
      { q: "Quel lobe traite principalement la vision ?", a: ["Frontal", "Occipital", "Temporal"], ok: 1,
        why: "Le lobe occipital, tout à l'arrière de la tête, abrite le cortex visuel." },
      { q: "Si l'hémisphère gauche est touché, quel côté du corps est le plus affecté ?", a: ["Le gauche", "Le droit", "Les deux pareil"], ok: 1,
        why: "Les voies motrices et sensorielles se croisent : chaque hémisphère gère le côté opposé." },
      { q: "Que gère le tronc cérébral ?", a: ["La respiration et le rythme cardiaque", "La lecture", "Les souvenirs d'enfance"], ok: 0,
        why: "C'est le centre des fonctions vitales automatiques." }
    ]
  },
  {
    id: "memoire",
    icon: "🧩",
    title: "La mémoire, ou plutôt les mémoires",
    minutes: 5,
    body: [
      "Il n'y a pas « une » mémoire mais plusieurs systèmes. La <b>mémoire de travail</b> garde quelques informations quelques secondes, le temps de s'en servir (un numéro qu'on vient d'entendre). Elle est très limitée : on estime sa capacité à environ <b>4 éléments</b> (on cite souvent « 7 ± 2 », un chiffre des années 1950).",
      "La <b>mémoire à long terme</b> se divise en mémoire <b>déclarative</b> (ce qu'on peut raconter : faits, souvenirs personnels) et <b>procédurale</b> (savoir-faire : faire du vélo, taper au clavier).",
      "L'<b>hippocampe</b>, une structure en forme de cheval de mer cachée dans le lobe temporal, est indispensable pour créer de nouveaux souvenirs déclaratifs. On l'a compris grâce au patient <b>H.M.</b> : après l'ablation de ses hippocampes en 1953, il ne pouvait plus former de nouveaux souvenirs, mais apprenait encore de nouveaux gestes.",
      "Un souvenir n'est pas une vidéo rangée dans un tiroir : il est <b>reconstruit</b> à chaque rappel. C'est pour cela qu'il peut se déformer, et qu'on peut avoir de faux souvenirs très convaincants.",
      "Pour mieux retenir, la science conseille : se <b>tester</b> plutôt que relire, <b>espacer</b> les révisions, et <b>dormir</b>."
    ],
    fact: "Regrouper les éléments (« chunking ») contourne la limite de la mémoire de travail : 0 6 1 2 3 4 5 6 7 8 se retient mieux en 06 12 34 56 78.",
    game: "empan",
    quiz: [
      { q: "Quelle structure est essentielle pour créer de nouveaux souvenirs ?", a: ["Le cervelet", "L'hippocampe", "Le corps calleux"], ok: 1,
        why: "Sans hippocampe, comme chez le patient H.M., on ne forme plus de nouveaux souvenirs déclaratifs." },
      { q: "Faire du vélo relève de la mémoire…", a: ["Procédurale", "De travail", "Épisodique"], ok: 0,
        why: "C'est un savoir-faire automatique, qui ne passe pas par les mots." },
      { q: "Quelle méthode aide le plus à retenir ?", a: ["Relire 5 fois d'affilée", "Se tester à intervalles espacés", "Surligner tout le texte"], ok: 1,
        why: "L'auto-test et la répétition espacée sont parmi les méthodes d'apprentissage les mieux validées." }
    ]
  },
  {
    id: "sommeil",
    icon: "🌙",
    title: "Le sommeil, chantier nocturne",
    minutes: 4,
    body: [
      "Pendant le sommeil, le cerveau ne s'éteint pas : il change de régime. Une nuit est faite de <b>cycles d'environ 90 minutes</b>, qui enchaînent sommeil léger, <b>sommeil lent profond</b> et <b>sommeil paradoxal</b>.",
      "Le <b>sommeil lent profond</b> domine en début de nuit. De grandes ondes lentes parcourent le cortex, et l'hippocampe « rejoue » les expériences de la journée pour les transférer vers la mémoire à long terme.",
      "Le <b>sommeil paradoxal</b> (ou REM) domine en fin de nuit : le cerveau est presque aussi actif qu'éveillé, les yeux bougent, les rêves sont les plus vifs, et les muscles sont paralysés pour qu'on ne les mette pas en scène.",
      "Des expériences chez la souris suggèrent aussi que le sommeil aide à <b>évacuer des déchets</b> du cerveau, grâce au liquide qui circule entre les cellules.",
      "Manquer de sommeil réduit l'attention, la mémoire et le contrôle des émotions, de façon mesurable dès une seule nuit courte."
    ],
    fact: "Une sieste de 10 à 20 minutes améliore la vigilance sans laisser groggy, car on ne tombe pas encore en sommeil profond.",
    game: "reaction",
    quiz: [
      { q: "Combien dure environ un cycle de sommeil ?", a: ["20 minutes", "90 minutes", "4 heures"], ok: 1,
        why: "On enchaîne en général 4 à 6 cycles d'environ 90 minutes par nuit." },
      { q: "Pendant le sommeil paradoxal…", a: ["Le cerveau est presque éteint", "Les muscles sont paralysés et on rêve intensément", "On ne rêve jamais"], ok: 1,
        why: "Le cerveau est très actif mais le corps est mis « hors circuit »." },
      { q: "À quoi sert le sommeil lent profond, entre autres ?", a: ["Consolider les souvenirs", "Digérer", "Faire pousser les cheveux"], ok: 0,
        why: "L'hippocampe y rejoue les événements de la journée pour les consolider." }
    ]
  },
  {
    id: "plasticite",
    icon: "🌱",
    title: "La plasticité : un cerveau qui se transforme",
    minutes: 4,
    body: [
      "Le cerveau n'est pas figé : il se <b>modifie</b> en permanence selon ce qu'on vit et ce qu'on apprend. C'est la <b>plasticité cérébrale</b>.",
      "La règle de base a été proposée par Donald Hebb en 1949, et on la résume souvent ainsi : <i>« les neurones qui s'activent ensemble se connectent ensemble »</i>. Quand deux neurones sont souvent actifs en même temps, leur synapse se renforce.",
      "Apprendre, c'est donc <b>modifier des connexions</b> : en créer, en renforcer, en affaiblir, en supprimer. C'est pourquoi la pratique régulière marche mieux qu'un gros effort ponctuel.",
      "Un exemple célèbre : chez les chauffeurs de taxi londoniens, qui mémorisent des milliers de rues, une partie de l'hippocampe (la partie postérieure) est plus volumineuse que la moyenne, et d'autant plus qu'ils ont d'années de métier.",
      "La plasticité est maximale dans l'enfance, mais elle continue toute la vie. Elle permet aussi de récupérer en partie après un AVC : d'autres régions réapprennent une fonction perdue."
    ],
    fact: "La création de nouveaux neurones chez l'adulte (neurogenèse) est bien établie chez l'animal, mais son ampleur chez l'humain fait encore débat entre chercheurs.",
    game: "stroop",
    quiz: [
      { q: "Que dit la règle de Hebb ?", a: ["Les neurones qui s'activent ensemble se connectent ensemble", "On perd 10 000 neurones par jour", "Le cerveau est figé à 20 ans"], ok: 0,
        why: "C'est le principe de base de l'apprentissage au niveau des synapses." },
      { q: "Qu'avait de particulier l'hippocampe des taxis londoniens ?", a: ["Il était plus petit", "Une partie était plus volumineuse", "Il était absent"], ok: 1,
        why: "La partie postérieure, liée à la navigation, était plus grande, et grossissait avec l'expérience." },
      { q: "La plasticité cérébrale…", a: ["S'arrête à l'adolescence", "Continue toute la vie", "N'existe que chez l'enfant"], ok: 1,
        why: "Elle diminue avec l'âge mais ne disparaît jamais." }
    ]
  },
  {
    id: "perception",
    icon: "👁️",
    title: "Perception : le cerveau devine le monde",
    minutes: 4,
    body: [
      "On a l'impression de voir le monde « tel qu'il est ». En réalité, le cerveau <b>reconstruit</b> une image à partir de signaux incomplets, en s'aidant de ce qu'il <b>s'attend</b> à voir.",
      "Exemple : chaque œil a une <b>tache aveugle</b>, l'endroit où le nerf optique quitte la rétine, sans aucun capteur. Vous ne voyez jamais de trou, parce que le cerveau le <b>comble</b> avec ce qui l'entoure.",
      "Les <b>illusions d'optique</b> sont précieuses pour les chercheurs : elles montrent les « raccourcis » que prend le cerveau. Dans l'illusion de <b>Müller-Lyer</b>, deux lignes identiques paraissent de longueurs différentes à cause des flèches à leurs extrémités.",
      "L'<b>attention</b> filtre aussi énormément : dans une expérience célèbre, la moitié des gens qui comptent des passes de ballon ne remarquent pas une personne déguisée en gorille qui traverse la scène.",
      "Et certains automatismes sont plus forts que notre volonté : c'est ce que montre l'<b>effet Stroop</b>. Lire est si automatique qu'on a du mal à ne pas lire le mot quand on doit nommer sa couleur."
    ],
    fact: "Le cerveau fonctionne un peu comme une machine à prédire : il compare en permanence ce qu'il prévoyait à ce que disent les sens, et corrige.",
    game: "illusion",
    quiz: [
      { q: "Pourquoi ne voit-on pas sa tache aveugle ?", a: ["Elle n'existe pas", "Le cerveau la comble", "On cligne des yeux"], ok: 1,
        why: "Le cerveau « remplit » le trou avec les informations alentour." },
      { q: "Que montre l'effet Stroop ?", a: ["Que lire est un automatisme difficile à bloquer", "Que l'on voit mal le rouge", "Que la mémoire est illimitée"], ok: 0,
        why: "La lecture s'impose et ralentit la tâche « nommer la couleur de l'encre »." },
      { q: "Les illusions d'optique révèlent…", a: ["Un défaut des yeux", "Les raccourcis que prend le cerveau", "Un manque de vitamines"], ok: 1,
        why: "Elles exposent les hypothèses que le cerveau fait pour interpréter le monde." }
    ]
  }
];

NEURO.glossary = [
  ["Neurone", "Cellule nerveuse qui reçoit, intègre et transmet des signaux électriques et chimiques."],
  ["Synapse", "Zone de communication entre deux neurones, séparée par une fente minuscule."],
  ["Neurotransmetteur", "Molécule libérée à la synapse pour transmettre le message au neurone suivant."],
  ["Potentiel d'action", "Brève impulsion électrique « tout ou rien » qui parcourt l'axone."],
  ["Axone", "Prolongement unique et long du neurone qui envoie le signal."],
  ["Dendrite", "Prolongement ramifié du neurone qui reçoit les signaux."],
  ["Myéline", "Gaine isolante autour des axones qui accélère la conduction."],
  ["Cortex", "Couche externe plissée du cerveau, siège des fonctions les plus élaborées."],
  ["Hippocampe", "Structure du lobe temporal essentielle à la formation des souvenirs et à l'orientation."],
  ["Amygdale", "Petite structure en forme d'amande, impliquée dans la peur et la valeur émotionnelle des situations."],
  ["Cervelet", "Partie arrière et basse du cerveau qui coordonne les mouvements et l'équilibre."],
  ["Thalamus", "Relais central qui trie la plupart des informations sensorielles avant le cortex."],
  ["Dopamine", "Neurotransmetteur lié à la motivation et à l'apprentissage par la récompense."],
  ["Sérotonine", "Neurotransmetteur impliqué dans l'humeur, le sommeil et l'appétit."],
  ["GABA", "Principal neurotransmetteur inhibiteur du cerveau : il freine l'activité."],
  ["Glutamate", "Principal neurotransmetteur excitateur du cerveau."],
  ["Plasticité", "Capacité du cerveau à modifier ses connexions selon l'expérience."],
  ["Cellule gliale", "Cellule non neuronale qui soutient, nourrit et protège les neurones."],
  ["IRMf", "Imagerie par résonance magnétique fonctionnelle : mesure indirectement l'activité des régions du cerveau via le débit sanguin."],
  ["EEG", "Électroencéphalogramme : enregistre l'activité électrique du cerveau avec des électrodes sur le crâne."],
  ["Corps calleux", "Faisceau de fibres qui relie les deux hémisphères."],
  ["Mémoire de travail", "Mémoire à très court terme qui maintient quelques éléments le temps de les utiliser."]
];

NEURO.resources = [
  { cat: "Apprendre (FR)", items: [
    ["Le cerveau à tous les niveaux", "https://lecerveau.mcgill.ca/", "Université McGill · 3 niveaux, du débutant à l'avancé"],
    ["Khan Academy · Système nerveux", "https://fr.khanacademy.org/", "Vidéos courtes et exercices"],
    ["Inserm · dossiers", "https://www.inserm.fr/dossiers-d-information/", "Dossiers de fond fiables (cherchez « cerveau »)"]
  ]},
  { cat: "Interactif & jeux (EN)", items: [
    ["BrainFacts · 3D Brain", "https://www.brainfacts.org/3d-brain", "Cerveau 3D à explorer région par région"],
    ["Neuroscience for Kids", "https://faculty.washington.edu/chudler/neurok.html", "Expériences et jeux très simples"],
    ["Optical Illusions (Michael Bach)", "https://michaelbach.de/ot/", "Plus de 100 illusions expliquées"],
    ["Human Benchmark", "https://humanbenchmark.com/", "Mini-tests de réaction et de mémoire"],
    ["Neuronify", "https://ovilab.net/neuronify/", "Construire des circuits de neurones"]
  ]},
  { cat: "Actualités", items: [
    ["Cerveau & Psycho", "https://www.cerveauetpsycho.fr/", "Magazine grand public"],
    ["The Conversation France", "https://theconversation.com/fr", "Articles écrits par des chercheurs"],
    ["Institut du Cerveau", "https://institutducerveau.org/", "Découvertes et actualités (Paris)"],
    ["Neuroscience News", "https://neurosciencenews.com/", "Plusieurs articles par jour (EN)"],
    ["ScienceDaily · Mind & Brain", "https://www.sciencedaily.com/news/mind_brain/", "Flux continu de recherches (EN)"]
  ]}
];
