export interface LocalityData {
  slug: string;
  name: string;
  distance: string;
  driveTime: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  intro: string;
  whyUs: string[];
  faq: { question: string; answer: string }[];
}

export const localities: LocalityData[] = [
  {
    slug: "osteopata-collado-villalba",
    name: "Collado Villalba",
    distance: "5 km",
    driveTime: "~7 min",
    metaTitle: "Osteópata cerca de Collado Villalba | Katy Caballero - Alpedrete",
    metaDescription: "Osteópata y masajista a solo 7 minutos de Collado Villalba. Osteopatía, masaje deportivo, tailandés y más en Alpedrete. Parking gratuito. Pide cita: 643 961 065.",
    keywords: "osteopata collado villalba, masajista collado villalba, osteopatia collado villalba, masaje deportivo collado villalba, fisioterapia collado villalba",
    intro: "Si vives en Collado Villalba y buscas un osteópata o masajista de confianza, mi consulta en Alpedrete está a solo 7 minutos en coche. Muchos de mis pacientes habituales vienen desde Villalba porque valoran el trato personalizado y cercano que ofrezco, algo difícil de encontrar en las clínicas más grandes de la zona.\n\nCollado Villalba es la ciudad más grande de la Sierra Noroeste de Madrid, con más de 60.000 habitantes. Aunque cuenta con varios centros de fisioterapia y salud, muchas personas prefieren desplazarse unos minutos para encontrar un enfoque más holístico y personalizado. En mi consulta de la Calle Río Guadarrama, cada sesión está diseñada exclusivamente para ti, sin prisas ni protocolos genéricos.\n\nEl trayecto desde Collado Villalba es muy sencillo: por la M-601 dirección Alpedrete llegas en apenas 7 minutos, y hay parking gratuito en la puerta. Muchos pacientes combinan la cita conmigo con un paseo por Alpedrete, un pueblo tranquilo y acogedor en plena Sierra de Guadarrama.\n\nYa sea que necesites aliviar un dolor de espalda crónico, recuperarte de una lesión deportiva, o simplemente regalarte un masaje de relajación, estoy aquí para ayudarte. Llevo más de 12 años dedicada a la osteopatía y los masajes, y mi formación incluye osteopatía estructural, visceral y craneal, masaje deportivo, tailandés y técnicas especializadas como las pindas herbales.",
    whyUs: [
      "A solo 7 minutos de Collado Villalba por la M-601",
      "Parking gratuito en la puerta de la consulta",
      "Trato personalizado: cada sesión es única, diseñada para ti",
      "Más de 12 años de experiencia en osteopatía y masajes",
      "Precios accesibles: osteopatía desde 40€, masaje deportivo desde 20€",
      "Horario amplio: lunes a viernes de 9:00 a 20:00, sábados de 10:00 a 14:00",
    ],
    faq: [
      { question: "¿Cómo llego desde Collado Villalba?", answer: "Toma la M-601 dirección Alpedrete. En 7 minutos llegas a la Calle Río Guadarrama 2. Al reservar te envío la ubicación exacta por WhatsApp." },
      { question: "¿Hay parking cerca de la consulta?", answer: "Sí, hay estacionamiento gratuito en la misma calle y alrededores. No tendrás problema para aparcar." },
      { question: "¿Atendéis urgencias desde Collado Villalba?", answer: "Si tienes un dolor agudo (lumbalgia, tortícolis, contractura), intento darte cita lo antes posible, normalmente en el mismo día o al día siguiente. Escríbeme por WhatsApp al 643 961 065." },
      { question: "¿Merece la pena desplazarse desde Villalba?", answer: "Muchos de mis pacientes de Collado Villalba me dicen que sí: el trato personalizado, la tranquilidad de la consulta y los resultados del tratamiento compensan los 7 minutos de viaje. Además, el parking gratuito facilita mucho la visita." },
    ],
  },
  {
    slug: "osteopata-moralzarzal",
    name: "Moralzarzal",
    distance: "3 km",
    driveTime: "~5 min",
    metaTitle: "Osteópata cerca de Moralzarzal | Katy Caballero - Alpedrete",
    metaDescription: "Osteópata y masajista a 5 minutos de Moralzarzal. Consulta en Alpedrete con más de 12 años de experiencia. Osteopatía, masaje deportivo y tailandés. Cita: 643 961 065.",
    keywords: "osteopata moralzarzal, masajista moralzarzal, osteopatia moralzarzal, masaje moralzarzal, fisioterapia moralzarzal",
    intro: "Moralzarzal y Alpedrete son pueblos vecinos separados por apenas 3 kilómetros. Si vives en Moralzarzal, llegar a mi consulta te llevará solo 5 minutos en coche, prácticamente como ir al pueblo de al lado a hacer un recado.\n\nComo vecina de la zona, conozco bien las necesidades de los habitantes de Moralzarzal: familias activas que disfrutan de la Sierra, deportistas que aprovechan los senderos y rutas ciclistas, profesionales que teletrabajan y acumulan tensión cervical, y personas mayores que buscan alivio para sus dolencias.\n\nMoralzarzal es un pueblo de unos 13.000 habitantes con un entorno natural privilegiado. Muchos de sus vecinos practican deporte al aire libre, lo que a veces conlleva contracturas, sobrecargas o lesiones. Mi enfoque combina la osteopatía (que busca la raíz del problema) con masajes terapéuticos para ofrecer un tratamiento integral.\n\nLa cercanía entre nuestros pueblos hace que muchos pacientes de Moralzarzal me visiten regularmente, como parte de su rutina de cuidado personal. Al ser una consulta pequeña y personal, puedo ofrecer flexibilidad de horarios y un seguimiento cercano de tu evolución.",
    whyUs: [
      "Pueblos vecinos: solo 5 minutos por la M-601",
      "Consulta tranquila en un entorno relajado, lejos del bullicio",
      "Conocimiento de las necesidades de la zona Sierra",
      "Flexibilidad de horarios y seguimiento personalizado",
      "Amplia gama de tratamientos: osteopatía, masaje deportivo, tailandés y más",
      "Parking gratuito sin complicaciones",
    ],
    faq: [
      { question: "¿Cómo llego desde Moralzarzal?", answer: "Toma la M-601 dirección Alpedrete. En 5 minutos llegas a la Calle Río Guadarrama 2. Es el camino más directo y sencillo." },
      { question: "¿Hay aparcamiento?", answer: "Sí, hay parking gratuito en la calle de la consulta. Al ser una zona residencial tranquila, siempre hay plazas disponibles." },
      { question: "¿Puedo ir andando o en bici desde Moralzarzal?", answer: "En bici llegas en 10-15 minutos por la carretera. Andando es algo más lejos (unos 40 minutos), pero hay caminos bonitos entre ambos pueblos." },
    ],
  },
  {
    slug: "osteopata-galapagar",
    name: "Galapagar",
    distance: "8 km",
    driveTime: "~10 min",
    metaTitle: "Osteópata cerca de Galapagar | Katy Caballero - Alpedrete",
    metaDescription: "Osteópata y masajista a 10 minutos de Galapagar. Osteopatía estructural, visceral y craneal, masaje deportivo y tailandés en Alpedrete. Pide cita: 643 961 065.",
    keywords: "osteopata galapagar, masajista galapagar, osteopatia galapagar, masaje deportivo galapagar, fisioterapia galapagar",
    intro: "Si buscas un osteópata o masajista desde Galapagar, mi consulta en Alpedrete está a solo 10 minutos por la M-505 y M-601. Galapagar es uno de los municipios más grandes de la zona con más de 35.000 habitantes, y muchos de sus vecinos ya confían en mis tratamientos.\n\nGalapagar tiene una ubicación privilegiada entre la Sierra y Madrid, lo que atrae a familias jóvenes y activas. El ritmo de vida, aunque más tranquilo que en la capital, sigue generando tensiones físicas: jornadas de trabajo, deporte los fines de semana, cuidado de los niños... Todo esto se traduce en dolores de espalda, contracturas, cefaleas y otras molestias que la osteopatía puede resolver.\n\nLa ruta desde Galapagar a Alpedrete es cómoda y rápida: tomas la M-505 hacia Collado Villalba y luego la M-601 hacia Alpedrete. En total, 10 minutos de un trayecto sin complicaciones y con parking gratuito al llegar.\n\nEn mi consulta encontrarás un enfoque diferente al de las clínicas convencionales. No aplico protocolos genéricos: cada sesión comienza con una valoración personalizada y el tratamiento se adapta a lo que tu cuerpo necesita ese día. Mis más de 12 años de experiencia me permiten combinar distintas técnicas para obtener los mejores resultados.",
    whyUs: [
      "A 10 minutos de Galapagar por la M-505 y M-601",
      "Enfoque holístico: tratamos la causa, no solo el síntoma",
      "Más de 12 años de experiencia con pacientes de toda la Sierra",
      "Consulta íntima con atención 100% personalizada",
      "Amplio horario: L-V 9:00-20:00 y sábados mañana",
      "Complemento perfecto a los servicios de salud locales",
    ],
    faq: [
      { question: "¿Cómo llego desde Galapagar?", answer: "Toma la M-505 dirección Collado Villalba y luego la M-601 hacia Alpedrete. En 10 minutos estás en la Calle Río Guadarrama 2. Te envío la ubicación exacta al reservar." },
      { question: "¿Hay parking?", answer: "Sí, hay aparcamiento gratuito en la zona. Es una calle residencial tranquila donde siempre encontrarás sitio." },
      { question: "¿La osteopatía complementa a la fisioterapia que me hacen en Galapagar?", answer: "Sí, osteopatía y fisioterapia son complementarias. La osteopatía aporta un enfoque más global del cuerpo que puede potenciar los resultados de la fisioterapia. Muchos pacientes combinan ambos tratamientos." },
    ],
  },
  {
    slug: "osteopata-guadarrama",
    name: "Guadarrama",
    distance: "10 km",
    driveTime: "~12 min",
    metaTitle: "Osteópata cerca de Guadarrama | Katy Caballero - Alpedrete",
    metaDescription: "Osteópata y masajista a 12 minutos de Guadarrama. Especialista en recuperación deportiva y osteopatía en Alpedrete. Masaje deportivo, tailandés y más. Cita: 643 961 065.",
    keywords: "osteopata guadarrama, masajista guadarrama, osteopatia guadarrama, masaje deportivo guadarrama, recuperacion muscular guadarrama",
    intro: "Guadarrama, a los pies de la Sierra homónima, es un paraíso para los deportistas: senderismo, trail running, ciclismo de montaña, escalada... Y con todo ese deporte, el cuerpo necesita cuidados. Mi consulta en Alpedrete está a solo 12 minutos y recibo habitualmente a deportistas y familias de Guadarrama.\n\nCon más de 16.000 habitantes, Guadarrama combina la tranquilidad de la Sierra con una vida deportiva muy activa. El Puerto de Guadarrama, la Senda Schmidt, las rutas de BTT... todo esto exige mucho del cuerpo. El masaje deportivo y la osteopatía son herramientas fundamentales para que puedas seguir disfrutando de la montaña sin lesiones ni molestias.\n\nPero no todo es deporte. Muchos vecinos de Guadarrama me visitan por dolores crónicos de espalda, tensión cervical por trabajo, migrañas o simplemente para regalarse un masaje de relajación. Mi formación en osteopatía estructural, visceral y craneal me permite abordar una amplia variedad de dolencias.\n\nEl trayecto desde Guadarrama es sencillo: por la M-601 dirección Alpedrete, 12 minutos de conducción tranquila por la Sierra. Muchos pacientes me cuentan que el propio viaje ya les relaja, pasando entre pinos y montañas.",
    whyUs: [
      "A 12 minutos de Guadarrama por la M-601",
      "Especialista en recuperación deportiva para deportistas de montaña",
      "Osteopatía integral: estructural, visceral y craneal",
      "Entorno tranquilo que potencia la relajación del tratamiento",
      "Experiencia con lesiones de trail running, ciclismo y senderismo",
      "Consulta en plena Sierra: el viaje ya forma parte de la experiencia",
    ],
    faq: [
      { question: "¿Cómo llego desde Guadarrama?", answer: "Toma la M-601 dirección Alpedrete. Son unos 12 minutos de un trayecto agradable por la Sierra. La consulta está en Calle Río Guadarrama 2, con parking gratuito." },
      { question: "¿Tratas lesiones de montaña y trail?", answer: "Sí, es una de mis especialidades. Trato habitualmente fascitis plantar, sobrecargas de gemelos y cuádriceps, dolor de rodilla, lumbalgia por impacto y tendinitis. Combino osteopatía con masaje deportivo para una recuperación completa." },
      { question: "¿Puedo venir después de una carrera de montaña?", answer: "Es recomendable esperar 24-48 horas después de una competición intensa para el masaje de recuperación. Si tienes una carrera próxima, te recomiendo una sesión de preparación unos días antes." },
    ],
  },
  {
    slug: "osteopata-torrelodones",
    name: "Torrelodones",
    distance: "15 km",
    driveTime: "~15 min",
    metaTitle: "Osteópata cerca de Torrelodones | Katy Caballero - Alpedrete",
    metaDescription: "Osteópata y masajista a 15 minutos de Torrelodones. Trato personalizado en Alpedrete, Sierra de Madrid. Osteopatía, masaje deportivo y relajante. Cita: 643 961 065.",
    keywords: "osteopata torrelodones, masajista torrelodones, osteopatia torrelodones, masaje torrelodones, fisioterapia torrelodones",
    intro: "Aunque Torrelodones está más cerca de Madrid, muchos de sus vecinos prefieren subir unos minutos hasta mi consulta en Alpedrete para disfrutar de un tratamiento personalizado en un entorno tranquilo, lejos de las prisas de las clínicas grandes.\n\nTorrelodones, con sus más de 24.000 habitantes, tiene acceso a numerosos centros de salud y bienestar. Sin embargo, el trato que ofrezco en mi consulta marca la diferencia: sesiones sin prisas, valoración personalizada, y un enfoque holístico que busca la raíz de tus problemas, no solo aliviar síntomas temporalmente.\n\nEl trayecto desde Torrelodones a Alpedrete es de unos 15 minutos por la A-6 y M-601. Es un viaje agradable, dejando atrás el ritmo de la zona sur de la Sierra para adentrarte en un entorno más tranquilo. Muchos pacientes de Torrelodones aprovechan la visita para desconectar completamente.\n\nSi trabajas desde casa o en oficina y acumulas tensión en cervicales y espalda, si eres deportista y necesitas recuperarte, o si simplemente buscas un profesional que te dedique tiempo y atención, estoy aquí para ayudarte.",
    whyUs: [
      "A 15 minutos de Torrelodones por la A-6 y M-601",
      "Trato personalizado frente a las clínicas masificadas",
      "Sesiones sin prisas: tu tiempo en consulta es solo tuyo",
      "Entorno tranquilo de Sierra para una experiencia completa de bienestar",
      "Combinación única de osteopatía y técnicas de masaje",
      "Más de 12 años de experiencia y formación continua",
    ],
    faq: [
      { question: "¿Cómo llego desde Torrelodones?", answer: "Toma la A-6 dirección Noroeste y sal hacia Collado Villalba/M-601. Sigue por la M-601 hasta Alpedrete. En 15 minutos llegas a la Calle Río Guadarrama 2." },
      { question: "¿Compensa el desplazamiento desde Torrelodones?", answer: "Mis pacientes de Torrelodones me dicen que sí. La consulta personalizada, la tranquilidad del entorno y los resultados del tratamiento compensan los 15 minutos de viaje. Además, el parking gratuito facilita la visita." },
      { question: "¿Puedo combinar la visita con un paseo por la Sierra?", answer: "Por supuesto. Alpedrete está en plena Sierra de Guadarrama, con paseos y senderos cerca. Muchos pacientes combinan la sesión con un café en el pueblo o un paseo corto." },
    ],
  },
  {
    slug: "osteopata-becerril-de-la-sierra",
    name: "Becerril de la Sierra",
    distance: "4 km",
    driveTime: "~5 min",
    metaTitle: "Osteópata cerca de Becerril de la Sierra | Katy Caballero - Alpedrete",
    metaDescription: "Osteópata y masajista a 5 minutos de Becerril de la Sierra. Consulta en Alpedrete con osteopatía, masaje deportivo y relajante. Parking gratuito. Cita: 643 961 065.",
    keywords: "osteopata becerril de la sierra, masajista becerril, osteopatia becerril sierra, masaje becerril de la sierra",
    intro: "Becerril de la Sierra y Alpedrete son pueblos prácticamente vecinos, separados por solo 4 kilómetros y 5 minutos en coche. Si vives en Becerril, tener una osteópata y masajista tan cerca es una gran ventaja para cuidar tu bienestar.\n\nBecerril de la Sierra es un pueblo de unos 6.000 habitantes con un encanto especial: tranquilo, rodeado de naturaleza y con una comunidad que valora la calidad de vida. Muchos de sus vecinos me visitan regularmente, ya sea para tratar dolencias concretas o como parte de su rutina de autocuidado.\n\nAl ser un pueblo pequeño, Becerril no cuenta con muchas opciones de osteopatía o masajes. Mi consulta en Alpedrete cubre esa necesidad con una amplia gama de tratamientos: desde osteopatía estructural, visceral y craneal hasta masajes deportivos, tailandeses y con pindas herbales. Todo en un espacio acogedor y con atención personalizada.\n\nLa proximidad entre nuestros pueblos también me permite ofrecer flexibilidad: si surge un dolor agudo, puedo atenderte rápidamente. Muchos pacientes de Becerril valoran esta cercanía y la confianza que se genera al tener a tu osteópata a solo 5 minutos.",
    whyUs: [
      "A solo 5 minutos de Becerril de la Sierra",
      "La opción de osteopatía más cercana para los vecinos de Becerril",
      "Atención rápida para dolores agudos: estás a 5 minutos",
      "Amplia variedad de tratamientos en un mismo centro",
      "Trato cercano y familiar entre pueblos vecinos",
      "Parking gratuito y fácil acceso",
    ],
    faq: [
      { question: "¿Cómo llego desde Becerril de la Sierra?", answer: "Toma la M-607 dirección Alpedrete. En 5 minutos llegas a la Calle Río Guadarrama 2. Es el trayecto más corto de toda la zona." },
      { question: "¿Atendéis niños o adolescentes de Becerril?", answer: "Sí, la osteopatía es apta para todas las edades. Trabajo con técnicas suaves adaptadas a cada paciente, incluyendo niños y adolescentes con problemas posturales o dolores de crecimiento." },
      { question: "¿Hay algún descuento para vecinos de pueblos cercanos?", answer: "Mis precios son iguales para todos y ya son muy competitivos: osteopatía 40€ (55 min), masaje deportivo 20€ (30 min). Ofrezco el mejor servicio al precio más justo." },
    ],
  },
  {
    slug: "osteopata-collado-mediano",
    name: "Collado Mediano",
    distance: "5 km",
    driveTime: "~6 min",
    metaTitle: "Osteópata cerca de Collado Mediano | Katy Caballero - Alpedrete",
    metaDescription: "Osteópata y masajista a 6 minutos de Collado Mediano. Osteopatía estructural, visceral y craneal en Alpedrete. Masaje deportivo y relajante. Cita: 643 961 065.",
    keywords: "osteopata collado mediano, masajista collado mediano, osteopatia collado mediano, masaje collado mediano, fisioterapia collado mediano",
    intro: "Collado Mediano está a solo 6 minutos de mi consulta en Alpedrete. Si buscas un osteópata o masajista desde este pueblo de la Sierra, soy tu opción más cercana y accesible.\n\nCollado Mediano, con unos 7.000 habitantes, es un pueblo residencial y tranquilo situado en el corazón de la Sierra de Guadarrama. Sus vecinos disfrutan de un estilo de vida activo: senderismo por la Dehesa Boyal, ciclismo, running... pero también sufren las consecuencias del sedentarismo laboral, el estrés y las tensiones posturales.\n\nMi consulta en la Calle Río Guadarrama 2 de Alpedrete es fácilmente accesible desde Collado Mediano por la M-601. El trayecto es corto, directo y sin complicaciones, con parking gratuito al llegar. Muchos vecinos de Collado Mediano ya forman parte de mis pacientes habituales.\n\nOfrezco un enfoque integral de la salud: la osteopatía me permite tratar desde dolores musculares y articulares hasta problemas digestivos y migrañas. Complemento con masaje deportivo para los más activos, masaje relajante para quienes necesitan desconectar, y técnicas especializadas como el masaje tailandés o con pindas herbales.",
    whyUs: [
      "A solo 6 minutos desde Collado Mediano por la M-601",
      "Opción de osteopatía más cercana y accesible",
      "Tratamiento integral: osteopatía + masajes terapéuticos",
      "Ideal para deportistas que disfrutan de la Sierra de Guadarrama",
      "Consulta acogedora con trato personalizado",
      "Precios competitivos y parking gratuito",
    ],
    faq: [
      { question: "¿Cómo llego desde Collado Mediano?", answer: "Toma la M-601 dirección Alpedrete. Son solo 6 minutos hasta la Calle Río Guadarrama 2. Al reservar te envío la ubicación por WhatsApp." },
      { question: "¿Puedo ir en transporte público desde Collado Mediano?", answer: "La conexión en transporte público no es la más directa. Te recomiendo venir en coche (6 minutos con parking gratuito) o en bici por la carretera comarcal." },
      { question: "¿Tratas dolor de espalda por teletrabajo?", answer: "Sí, es una de las consultas más frecuentes. El teletrabajo genera tensión cervical, dolor lumbar y rigidez de hombros. Con osteopatía y recomendaciones ergonómicas puedo ayudarte a mejorar significativamente." },
    ],
  },
  {
    slug: "osteopata-los-molinos",
    name: "Los Molinos",
    distance: "8 km",
    driveTime: "~10 min",
    metaTitle: "Osteópata cerca de Los Molinos | Katy Caballero - Alpedrete",
    metaDescription: "Osteópata y masajista a 10 minutos de Los Molinos. Consulta en Alpedrete especializada en osteopatía y masajes terapéuticos. Parking gratuito. Cita: 643 961 065.",
    keywords: "osteopata los molinos, masajista los molinos, osteopatia los molinos madrid, masaje los molinos sierra, fisioterapia los molinos",
    intro: "Los Molinos, uno de los pueblos con más encanto de la Sierra de Guadarrama, está a solo 10 minutos de mi consulta en Alpedrete. Si vives en Los Molinos y necesitas un osteópata o masajista, soy una de las opciones más cercanas de la zona.\n\nCon unos 4.500 habitantes, Los Molinos es un pueblo pequeño pero con mucha vida. Su entorno natural privilegiado, a los pies de la Sierra, atrae a personas que valoran la calidad de vida y el contacto con la naturaleza. Muchos de sus vecinos son deportistas, familias activas o profesionales que buscan la tranquilidad de la Sierra.\n\nAl ser un pueblo pequeño, Los Molinos tiene opciones limitadas de servicios de salud y bienestar. Mi consulta en Alpedrete cubre esa necesidad con un servicio completo de osteopatía y masajes. El trayecto por la M-601 es rápido y agradable, pasando por un paisaje de Sierra que ya predispone a la relajación.\n\nTanto si necesitas aliviar un dolor específico como si buscas un tratamiento de mantenimiento o relajación, en mi consulta encontrarás un enfoque profesional, cercano y personalizado. La osteopatía es especialmente eficaz para problemas crónicos que no mejoran con otros tratamientos convencionales.",
    whyUs: [
      "A 10 minutos de Los Molinos por la M-601",
      "Una de las opciones de osteopatía más cercanas a Los Molinos",
      "Servicio completo: osteopatía, masaje deportivo, tailandés y más",
      "Trayecto agradable por la Sierra de Guadarrama",
      "Parking gratuito y entorno tranquilo",
      "Enfoque profesional y cercano para pueblos pequeños de la Sierra",
    ],
    faq: [
      { question: "¿Cómo llego desde Los Molinos?", answer: "Toma la M-601 dirección Alpedrete/Collado Villalba. En unos 10 minutos llegas a la Calle Río Guadarrama 2 en Alpedrete. Es un trayecto sencillo y agradable." },
      { question: "¿Hay algún osteópata más cerca de Los Molinos?", answer: "En la zona inmediata de Los Molinos las opciones de osteopatía son muy limitadas. Mi consulta en Alpedrete es una de las más cercanas y accesibles, a solo 10 minutos." },
      { question: "¿Tratas a deportistas que hacen rutas por la Sierra?", answer: "Sí, muchos de mis pacientes son senderistas, ciclistas y runners que disfrutan de la Sierra de Guadarrama. El masaje deportivo y la osteopatía les ayudan a recuperarse y prevenir lesiones." },
    ],
  },
];

export function getLocalityBySlug(slug: string): LocalityData | undefined {
  return localities.find(l => l.slug === slug);
}
