export interface ServiceData {
  slug: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  price: string;
  duration: string;
  image: string;
  imageAlt: string;
  intro: string;
  description: string;
  benefits: { title: string; text: string }[];
  forWhom: string[];
  whatToExpect: string[];
  faq: { question: string; answer: string }[];
}

export const services: ServiceData[] = [
  {
    slug: "osteopatia-alpedrete",
    title: "Osteopatía",
    h1: "Osteopatía en Alpedrete",
    metaTitle: "Osteopatía en Alpedrete | Estructural, Visceral y Craneal - Katy Caballero",
    metaDescription: "Tratamiento de osteopatía estructural, visceral y sacrocraneal en Alpedrete. Más de 12 años de experiencia. Sesión de 55 min por 40€. Dolor de espalda, cervicales, migrañas.",
    keywords: "osteopatia alpedrete, osteopata alpedrete, osteopatia estructural sierra madrid, osteopatia visceral, osteopatia craneal, dolor espalda alpedrete",
    price: "40€",
    duration: "55 min",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop&crop=center&q=80",
    imageAlt: "Sesión de osteopatía estructural y craneal en consulta de Alpedrete",
    intro: "La osteopatía es una terapia manual que aborda el cuerpo de forma global. No me limito a tratar la zona donde sientes dolor, sino que busco el origen real del problema para ofrecer una solución duradera.",
    description: "En mi consulta de Alpedrete trabajo con tres ramas de la osteopatía: **estructural** (músculos, articulaciones y huesos), **visceral** (órganos internos y su relación con el sistema músculo-esquelético) y **sacrocraneal** (sistema nervioso central, membranas craneales y sacro). Esta visión integral me permite tratar una gran variedad de dolencias desde su raíz.\n\nCada sesión comienza con una valoración completa: observo tu postura, evalúo tu movilidad y escucho tu historia clínica. A partir de ahí, diseño un tratamiento personalizado combinando las técnicas que mejor se adapten a tu caso. Las manipulaciones son suaves y respetuosas con tu cuerpo.",
    benefits: [
      { title: "Alivio del dolor", text: "Reduce dolores de espalda, cervicales, lumbalgias y ciática desde la primera sesión" },
      { title: "Mejora digestiva", text: "La osteopatía visceral ayuda con problemas digestivos, reflujo, hinchazón y estreñimiento" },
      { title: "Menos migrañas", text: "El trabajo craneal puede reducir significativamente la frecuencia e intensidad de las migrañas" },
      { title: "Mayor movilidad", text: "Recupera el rango de movimiento perdido por lesiones, contracturas o malas posturas" },
      { title: "Equilibrio global", text: "Trabaja sobre el origen del problema, no solo el síntoma, para resultados más duraderos" },
      { title: "Prevención", text: "Sesiones regulares previenen la aparición de nuevas dolencias y mantienen tu cuerpo en equilibrio" },
    ],
    forWhom: [
      "Personas con dolor de espalda crónico o agudo",
      "Trabajadores de oficina con tensión cervical y postural",
      "Deportistas con lesiones recurrentes",
      "Personas con migrañas y cefaleas tensionales",
      "Pacientes con problemas digestivos funcionales",
      "Mujeres en postparto que necesitan recuperar su equilibrio corporal",
      "Personas mayores con pérdida de movilidad",
    ],
    whatToExpect: [
      "Llegada y breve cuestionario sobre tu historial y motivo de consulta",
      "Valoración postural y de movilidad para identificar desequilibrios",
      "Tratamiento manual personalizado de 55 minutos",
      "Explicación de lo encontrado y recomendaciones para casa",
    ],
    faq: [
      { question: "¿La osteopatía duele?", answer: "Las técnicas que utilizo son suaves y respetuosas con tu cuerpo. Puedes sentir algo de presión en zonas con mucha tensión, pero nunca debe ser un dolor insoportable. Siempre trabajo dentro de tu umbral de confort." },
      { question: "¿Cuántas sesiones necesitaré?", answer: "Depende de cada caso. Para problemas agudos como contracturas o lumbalgias, muchos pacientes notan mejoría desde la primera sesión y se resuelven en 2-3 sesiones. Para problemas crónicos suelen necesitarse entre 4 y 6 sesiones." },
      { question: "¿Es compatible con otros tratamientos?", answer: "Sí, la osteopatía es complementaria a la fisioterapia, la medicina convencional y otras terapias. Si estás siguiendo otro tratamiento, indícamelo para coordinar el enfoque." },
      { question: "¿Necesito prescripción médica?", answer: "No, puedes venir directamente sin necesidad de prescripción. En la primera sesión realizaré una valoración completa para asegurarme de que la osteopatía es adecuada para tu caso." },
    ],
  },
  {
    slug: "masaje-deportivo-alpedrete",
    title: "Masaje Deportivo",
    h1: "Masaje Deportivo en Alpedrete",
    metaTitle: "Masaje Deportivo en Alpedrete | Recuperación Muscular - Katy Caballero",
    metaDescription: "Masaje deportivo en Alpedrete para recuperación muscular, prevención de lesiones y mejora del rendimiento. 30 min por 20€. Ideal para runners, ciclistas y deportistas de la Sierra.",
    keywords: "masaje deportivo alpedrete, masaje deportivo sierra madrid, recuperacion muscular alpedrete, masaje contracturas, masaje runners sierra madrid",
    price: "20€",
    duration: "30 min",
    image: "https://images.pexels.com/photos/8219058/pexels-photo-8219058.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    imageAlt: "Masaje deportivo para recuperación muscular en Alpedrete",
    intro: "El masaje deportivo es la herramienta perfecta para deportistas que quieren rendir más, recuperarse mejor y prevenir lesiones. Ya seas runner, ciclista, senderista o practiques cualquier deporte, este masaje está diseñado para ti.",
    description: "Vivir en la Sierra de Madrid significa tener acceso a increíbles rutas de montaña, senderos y carreteras para el ciclismo. Pero también significa exigir mucho a tu cuerpo. El masaje deportivo que ofrezco en mi consulta de Alpedrete está específicamente diseñado para las necesidades de los deportistas de la zona.\n\nUtilizo técnicas de presión profunda, fricción transversa y estiramientos asistidos para trabajar sobre los grupos musculares más solicitados según tu deporte. El objetivo es liberar contracturas, mejorar la circulación sanguínea, acelerar la eliminación de toxinas y preparar tus músculos para el siguiente entrenamiento.",
    benefits: [
      { title: "Recuperación rápida", text: "Acelera la recuperación muscular después de entrenamientos intensos o competiciones" },
      { title: "Prevención de lesiones", text: "Identifica y trabaja sobre puntos de tensión antes de que se conviertan en lesiones" },
      { title: "Alivio de contracturas", text: "Deshace nudos musculares y puntos gatillo que limitan tu rendimiento" },
      { title: "Mayor flexibilidad", text: "Mejora la elasticidad muscular y el rango de movimiento articular" },
      { title: "Mejor circulación", text: "Favorece el flujo sanguíneo y la eliminación de ácido láctico tras el ejercicio" },
      { title: "Rendimiento óptimo", text: "Un músculo bien cuidado rinde más y se lesiona menos" },
    ],
    forWhom: [
      "Runners y trail runners de la Sierra de Guadarrama",
      "Ciclistas de carretera y mountain bike",
      "Senderistas y montañeros habituales",
      "Personas que practican crossfit, pádel o tenis",
      "Deportistas amateur y profesionales",
      "Personas que entrenan regularmente en gimnasio",
    ],
    whatToExpect: [
      "Breve consulta sobre tu deporte, zonas de molestia y objetivos",
      "Masaje focalizado de 30 minutos en las zonas que más lo necesitan",
      "Técnicas de presión profunda, fricción y estiramientos asistidos",
      "Recomendaciones de estiramientos y autocuidado post-sesión",
    ],
    faq: [
      { question: "¿Es mejor antes o después de hacer deporte?", answer: "Depende del objetivo. Antes del deporte, un masaje corto activa la musculatura y prepara el cuerpo. Después del deporte, ayuda a la recuperación y previene la aparición de contracturas. Para mantenimiento, entre 24 y 48 horas después de un esfuerzo intenso es ideal." },
      { question: "¿El masaje deportivo es muy doloroso?", answer: "Puede ser intenso en zonas con mucha tensión o contracturas, pero siempre trabajo dentro de tus límites. La comunicación durante la sesión es importante para ajustar la presión a lo que necesitas." },
      { question: "¿Con qué frecuencia debería hacerme un masaje deportivo?", answer: "Para deportistas regulares, una sesión cada 2-3 semanas es ideal como mantenimiento. Si estás preparando una competición o tienes molestias específicas, puede ser necesario con más frecuencia." },
    ],
  },
  {
    slug: "masaje-tailandes-alpedrete",
    title: "Masaje Tailandés",
    h1: "Masaje Tailandés en Alpedrete",
    metaTitle: "Masaje Tradicional Tailandés en Alpedrete | Sierra de Madrid - Katy Caballero",
    metaDescription: "Masaje tradicional tailandés en Alpedrete. Estiramientos asistidos, presiones y trabajo energético. Desde 45€ la sesión de 60 min. Formación en Tailandia.",
    keywords: "masaje tailandes alpedrete, masaje thai sierra madrid, masaje tailandes madrid, estiramientos asistidos, masaje energetico alpedrete",
    price: "45€ / 60€",
    duration: "60 min / 90 min",
    image: "https://images.pexels.com/photos/6186763/pexels-photo-6186763.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    imageAlt: "Masaje tradicional tailandés con estiramientos en Alpedrete",
    intro: "El masaje tailandés es una técnica milenaria que combina presiones rítmicas, estiramientos asistidos y trabajo sobre las líneas de energía del cuerpo. Se realiza vestido, sobre un futón, y es una experiencia única que te deja con una sensación de ligereza y vitalidad.",
    description: "Me formé en masaje tailandés hace más de 12 años y es una de las técnicas que más disfruto practicando. A diferencia de otros masajes, el tailandés se realiza con ropa cómoda sobre un futón en el suelo, lo que me permite usar todo mi cuerpo (manos, codos, rodillas, pies) para aplicar las técnicas.\n\nDurante la sesión, combino presiones rítmicas a lo largo de las líneas Sen (meridianos energéticos) con estiramientos pasivos que recuerdan a posiciones de yoga. El resultado es una profunda relajación muscular, una mejora notable de la flexibilidad y una sensación de bienestar integral. No es necesario tener flexibilidad previa: adapto cada estiramiento a tu cuerpo.",
    benefits: [
      { title: "Flexibilidad", text: "Los estiramientos asistidos mejoran tu rango de movimiento sin esfuerzo por tu parte" },
      { title: "Relajación profunda", text: "Las presiones rítmicas inducen un estado de calma que reduce el estrés y la ansiedad" },
      { title: "Energía renovada", text: "El trabajo sobre los meridianos energéticos te deja con vitalidad y ligereza" },
      { title: "Alivio de tensiones", text: "Libera contracturas y tensiones musculares acumuladas, especialmente en espalda y piernas" },
      { title: "Mejor circulación", text: "Las compresiones y estiramientos favorecen el flujo sanguíneo y linfático" },
      { title: "Sin aceites", text: "Se realiza vestido con ropa cómoda, ideal si prefieres un masaje sin aceites" },
    ],
    forWhom: [
      "Personas con rigidez muscular o pérdida de flexibilidad",
      "Quienes buscan una experiencia de relajación diferente",
      "Practicantes de yoga o pilates que quieren profundizar en sus estiramientos",
      "Personas con estrés acumulado y tensión muscular",
      "Deportistas que necesitan mejorar su rango de movimiento",
      "Cualquier persona que quiera experimentar esta técnica milenaria",
    ],
    whatToExpect: [
      "Ven con ropa cómoda y elástica (camiseta, pantalón largo de deporte)",
      "La sesión se realiza en un futón sobre el suelo",
      "Trabajo de presiones rítmicas y estiramientos asistidos durante 60 o 90 minutos",
      "No se utilizan aceites ni cremas",
    ],
    faq: [
      { question: "¿Necesito ser flexible para recibir un masaje tailandés?", answer: "No, en absoluto. Adapto cada estiramiento a tu nivel de flexibilidad actual. El masaje precisamente te ayuda a ganar flexibilidad de forma progresiva y segura." },
      { question: "¿Qué ropa debo llevar?", answer: "Ropa cómoda y elástica: camiseta de algodón y pantalón largo de chándal o deporte. Evita tejidos rígidos como vaqueros. Yo te proporciono el futón y todo lo necesario." },
      { question: "¿Es mejor la sesión de 60 o 90 minutos?", answer: "Si es tu primera vez, te recomiendo 60 minutos para conocer la técnica. La sesión de 90 minutos permite un trabajo más completo y profundo, ideal si ya conoces el masaje tailandés o buscas una experiencia más intensa." },
    ],
  },
  {
    slug: "masaje-corporal-alpedrete",
    title: "Masaje Corporal con Aceite",
    h1: "Masaje Corporal con Aceite en Alpedrete",
    metaTitle: "Masaje Corporal con Aceite en Alpedrete | Relajación Profunda - Katy Caballero",
    metaDescription: "Masaje corporal relajante con aceites esenciales en Alpedrete. Alivio de tensiones, nutrición de la piel y desconexión total. Desde 40€ la sesión de 60 min.",
    keywords: "masaje corporal alpedrete, masaje relajante sierra madrid, masaje con aceite alpedrete, masaje descontracturante, masaje relajante madrid",
    price: "40€ / 55€",
    duration: "60 min / 90 min",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&crop=center&q=80",
    imageAlt: "Masaje corporal relajante con aceites esenciales en Alpedrete",
    intro: "El masaje corporal con aceite es la opción ideal cuando tu cuerpo y tu mente necesitan desconectar. Movimientos envolventes, aceites naturales y un ambiente de calma absoluta para que salgas renovado.",
    description: "Este masaje combina técnicas de deslizamiento profundo, amasamiento y presiones suaves con aceites esenciales de alta calidad. Trabajo todo el cuerpo de forma fluida y envolvente: espalda, piernas, brazos, cuello y hombros, adaptando la intensidad a tus preferencias.\n\nLos aceites que utilizo no solo facilitan las maniobras del masaje, sino que también nutren e hidratan tu piel. Mi consulta en Alpedrete está preparada con camilla profesional, música relajante, iluminación tenue y temperatura agradable para que la experiencia sea completa desde que entras hasta que sales.",
    benefits: [
      { title: "Relajación total", text: "Reduce el estrés, la ansiedad y la tensión acumulada en todo el cuerpo" },
      { title: "Alivio muscular", text: "Deshace contracturas y alivia la rigidez muscular de forma suave pero efectiva" },
      { title: "Piel nutrida", text: "Los aceites esenciales hidratan y nutren la piel en profundidad" },
      { title: "Mejor sueño", text: "La relajación profunda que produce ayuda a mejorar la calidad del descanso" },
      { title: "Circulación mejorada", text: "Las técnicas de deslizamiento favorecen el retorno venoso y linfático" },
      { title: "Bienestar emocional", text: "El contacto terapéutico libera endorfinas y mejora el estado de ánimo" },
    ],
    forWhom: [
      "Personas con alto nivel de estrés o ansiedad",
      "Quienes buscan un momento de desconexión y autocuidado",
      "Personas con tensión muscular generalizada",
      "Trabajadores con jornadas largas frente al ordenador",
      "Como regalo especial para alguien querido",
      "Cualquier persona que quiera cuidarse y sentirse bien",
    ],
    whatToExpect: [
      "Breve conversación sobre las zonas donde sientes más tensión",
      "Te acomodo en camilla profesional con sábanas limpias",
      "Masaje corporal completo de 60 o 90 minutos con aceites esenciales",
      "Ambiente relajante con música suave e iluminación tenue",
    ],
    faq: [
      { question: "¿Qué aceites utilizas?", answer: "Utilizo aceites vegetales de alta calidad como base (almendras dulces, jojoba) y puedo añadir aceites esenciales según tus preferencias o necesidades: lavanda para relajación, romero para dolor muscular, o eucalipto para descongestión." },
      { question: "¿Cuál es la diferencia entre 60 y 90 minutos?", answer: "Con 60 minutos trabajo las zonas principales (espalda, piernas, cuello). Con 90 minutos puedo hacer un trabajo más completo incluyendo brazos, manos, pies y dedicar más tiempo a las zonas con más tensión. Si buscas una experiencia de relajación plena, te recomiendo 90 minutos." },
      { question: "¿Puedo elegir la intensidad del masaje?", answer: "Por supuesto. Antes de empezar te pregunto si prefieres un masaje suave y relajante o algo más intenso para trabajar contracturas. Y durante la sesión siempre puedes pedirme que ajuste la presión." },
    ],
  },
  {
    slug: "masaje-pindas-herbales-alpedrete",
    title: "Masaje con Pindas Herbales",
    h1: "Masaje con Pindas Herbales en Alpedrete",
    metaTitle: "Masaje con Pindas Herbales Calientes en Alpedrete - Katy Caballero",
    metaDescription: "Masaje con pindas herbales calientes en Alpedrete. Saquitos de hierbas medicinales que relajan, descontracturan y tienen propiedades antiinflamatorias. 90 min por 70€.",
    keywords: "masaje pindas herbales alpedrete, pindas herbales madrid, masaje herbas calientes sierra madrid, masaje antiinflamatorio alpedrete",
    price: "70€",
    duration: "90 min",
    image: "https://images.pexels.com/photos/6187421/pexels-photo-6187421.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    imageAlt: "Masaje con pindas herbales calientes para relajación profunda en Alpedrete",
    intro: "Las pindas herbales son saquitos de tela rellenos de hierbas medicinales que se calientan al vapor y se aplican sobre el cuerpo. El calor penetrante combinado con las propiedades de las plantas ofrece una experiencia de relajación profunda y terapéutica.",
    description: "El masaje con pindas herbales es una de las técnicas más especiales que ofrezco. Las pindas están rellenas de una mezcla cuidadosa de hierbas medicinales como jengibre, limoncillo, cúrcuma, alcanfor y menta, cada una con propiedades específicas: antiinflamatorias, analgésicas, circulatorias y relajantes.\n\nDurante la sesión, alterno el uso de las pindas calientes con técnicas de masaje manual. El calor húmedo penetra en los tejidos profundos, relajando la musculatura de forma que mis manos solas no podrían conseguir. Es una experiencia sensorial completa: el calor reconfortante, el aroma de las hierbas y las técnicas de masaje se combinan para un resultado excepcional.",
    benefits: [
      { title: "Calor terapéutico", text: "El calor húmedo de las pindas penetra en los tejidos profundos y relaja la musculatura intensa" },
      { title: "Propiedades antiinflamatorias", text: "Las hierbas medicinales como cúrcuma y jengibre reducen la inflamación de forma natural" },
      { title: "Descontractura profunda", text: "La combinación de calor y masaje deshace contracturas que resisten al masaje convencional" },
      { title: "Experiencia aromática", text: "Las hierbas liberan aromas naturales que potencian la relajación y el bienestar" },
      { title: "Mejora circulatoria", text: "El calor dilata los vasos sanguíneos, mejorando la circulación y la oxigenación de los tejidos" },
      { title: "Alivio articular", text: "Especialmente beneficioso para aliviar la rigidez y el dolor articular" },
    ],
    forWhom: [
      "Personas con contracturas crónicas o muy profundas",
      "Quienes sufren dolor articular o rigidez",
      "Personas que disfrutan de los tratamientos con calor",
      "Quienes buscan una experiencia de spa en un entorno íntimo",
      "Personas con estrés crónico que necesitan una relajación profunda",
      "Como experiencia especial o regalo",
    ],
    whatToExpect: [
      "Preparación de las pindas herbales calientes al vapor",
      "Inicio con masaje manual para preparar la musculatura",
      "Aplicación de las pindas calientes combinada con técnicas de masaje",
      "Sesión completa de 90 minutos de pura relajación terapéutica",
    ],
    faq: [
      { question: "¿Puede quemarme las pindas?", answer: "No, las pindas se preparan a una temperatura controlada y siempre compruebo que sea agradable antes de aplicarlas. Si en algún momento sientes demasiado calor, me lo dices y ajusto la temperatura inmediatamente." },
      { question: "¿Qué hierbas llevan las pindas?", answer: "Uso una mezcla de hierbas medicinales como jengibre (antiinflamatorio), limoncillo (relajante), cúrcuma (antiinflamatorio), alcanfor (analgésico) y menta (refrescante). Si tienes alguna alergia, indícamelo antes de la sesión." },
      { question: "¿Por qué es más caro que otros masajes?", answer: "El masaje con pindas requiere una preparación especial de los saquitos herbales y dura 90 minutos. Además, las hierbas medicinales que utilizo son de alta calidad. Es una experiencia premium con beneficios terapéuticos que van más allá de un masaje convencional." },
    ],
  },
  {
    slug: "masaje-embarazadas-alpedrete",
    title: "Masaje para Embarazadas",
    h1: "Masaje para Embarazadas en Alpedrete",
    metaTitle: "Masaje para Embarazadas en Alpedrete | Masaje Prenatal - Katy Caballero",
    metaDescription: "Masaje prenatal para embarazadas en Alpedrete. Técnicas suaves adaptadas a cada trimestre desde el 4º mes. Alivio de dolor lumbar, piernas cansadas y estrés. 60 min por 40€.",
    keywords: "masaje embarazadas alpedrete, masaje prenatal sierra madrid, masaje embarazo alpedrete, dolor lumbar embarazo, piernas cansadas embarazo",
    price: "40€",
    duration: "60 min",
    image: "https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=600&h=400&fit=crop&crop=center&q=80",
    imageAlt: "Masaje prenatal para embarazadas en consulta de Alpedrete",
    intro: "El embarazo es una etapa maravillosa pero también exigente para tu cuerpo. El masaje prenatal te ayuda a aliviar las molestias típicas de cada trimestre y a conectar con tu bienestar en este momento tan especial.",
    description: "El masaje para embarazadas que ofrezco en mi consulta de Alpedrete está especialmente adaptado a las necesidades de cada etapa del embarazo, **a partir del cuarto mes**. Utilizo posiciones seguras y cómodas (de lado con cojines de apoyo) para que te sientas completamente a gusto durante toda la sesión.\n\nLas técnicas son suaves pero efectivas: trabajo sobre la zona lumbar (que carga con el peso extra del bebé), las piernas (retención de líquidos y pesadez) y la espalda y hombros (tensión postural). Cada maniobra está pensada para aliviar las molestias más comunes del embarazo sin ningún riesgo para ti ni para tu bebé.",
    benefits: [
      { title: "Alivio lumbar", text: "Reduce el dolor de espalda baja causado por el cambio de centro de gravedad y el peso del bebé" },
      { title: "Piernas ligeras", text: "Mejora la circulación y reduce la retención de líquidos y la sensación de piernas pesadas" },
      { title: "Menos estrés", text: "La relajación profunda reduce la ansiedad y mejora el estado emocional durante el embarazo" },
      { title: "Mejor descanso", text: "Alivia las tensiones que dificultan el sueño en los últimos meses de embarazo" },
      { title: "Conexión", text: "Un momento de calma para conectar contigo misma y con tu bebé" },
      { title: "Seguridad", text: "Técnicas adaptadas a cada trimestre con posiciones cómodas y seguras" },
    ],
    forWhom: [
      "Embarazadas a partir del 4º mes de gestación",
      "Mujeres con dolor lumbar o ciática durante el embarazo",
      "Embarazadas con piernas pesadas o retención de líquidos",
      "Futuras mamás con tensión cervical y dolor de hombros",
      "Mujeres que buscan un momento de relajación prenatal",
      "Embarazadas con dificultades para dormir por las molestias físicas",
    ],
    whatToExpect: [
      "Consulta sobre tu semana de gestación y molestias actuales",
      "Posición cómoda de lado con cojines de apoyo adaptados",
      "Masaje suave y adaptado de 60 minutos en espalda, piernas y zonas de tensión",
      "Recomendaciones de autocuidado y estiramientos suaves para casa",
    ],
    faq: [
      { question: "¿Desde qué mes puedo hacerme el masaje?", answer: "Puedes venir a partir del cuarto mes de embarazo (semana 13-14). El primer trimestre se evita por precaución, ya que es el período más delicado del embarazo." },
      { question: "¿Es seguro para mi bebé?", answer: "Completamente. Las técnicas que utilizo están específicamente adaptadas para el embarazo: presiones suaves, posiciones seguras de lado y se evitan zonas y puntos de presión contraindicados. Tu seguridad y la de tu bebé son mi prioridad." },
      { question: "¿Puedo venir en el tercer trimestre?", answer: "Sí, de hecho es cuando muchas embarazadas más lo necesitan por las molestias lumbares y la pesadez de piernas. Adapto las posiciones con cojines para que estés cómoda incluso con una barriga grande." },
      { question: "¿Necesito traer algo especial?", answer: "No, solo ven con ropa cómoda. Yo tengo todo lo necesario: camilla, cojines de apoyo, sábanas limpias y aceites seguros para el embarazo." },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return services.find(s => s.slug === slug);
}
