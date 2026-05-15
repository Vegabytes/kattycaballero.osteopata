export interface Review {
  name: string;
  rating: number;
  text: string;
  badge?: string;
}

export const reviews: Review[] = [
  {
    name: "Ana Pouso",
    rating: 5,
    text: "Si estás buscando unas manos firmes y profesionales por la zona, no dejes de ir a conocer a Katy, además no hay problema para aparcar. En un espacio bonito y tranquilo, ella repara el cuerpo y calma la mente. Yo salgo como nueva y mi cuello también!",
  },
  {
    name: "Natalia Fernández Grande",
    rating: 5,
    text: "Gran regalo de cumpleaños!! No se me ocurre uno mejor. Mi primera vez y ha sido una experiencia de 10. Un espacio muy acogedor, que invita a la relajación y el bienestar desde el primer momento. Gran profesional detallista, cuidadosa que maneja diferentes técnicas y te deja nueva, descargada y casi flotando. Me sentí muy cuidada.",
  },
  {
    name: "Alejandro Castillo",
    rating: 5,
    text: "Katy me ha ayudado con los problemas de espalda ya que trabajo muchas horas con el ordenador. También de una lesión en el gemelo que me impedía hacer deporte. Es una persona muy agradable y comunicativa, transmite tranquilidad y confianza.",
    badge: "Local Guide",
  },
  {
    name: "Iulia Sasu",
    rating: 5,
    text: "Hace tiempo que me duele el hombro derecho y probé con 2 fisioterapeutas distintos pero salía con el mismo dolor. Probé con Katy y noté mejoría. Cada sesión ha sido diferente según la necesidad y dolencia que tuve. ¡Katy sabe escucharte a ti y también a tu cuerpo! ¡Millones de gracias!",
    badge: "Local Guide",
  },
  {
    name: "Nicoletta Baffetti",
    rating: 5,
    text: "Gran profesional, atenta y preparada. La sala en la que trabaja, también, muy bonita y acogedora. Repetiré pronto.",
  },
  {
    name: "meriem lazar",
    rating: 5,
    text: "He tenido unas sesiones con ella, además de una muy buena profesional, te escucha y está atenta en todo el momento de la sesión.",
    badge: "Local Guide",
  },
  {
    name: "ELENA CIBRIAN",
    rating: 5,
    text: "Katy me ha ayudado a recuperarme de una lesión en la muñeca y hombro que me ha dado mucho la lata y hoy puedo decir que estoy curada. Es muy buena profesional, se nota mucho su experiencia y toda su formación. Además el nuevo espacio que ha preparado es súper acogedor! Te la recomiendo totalmente.",
  },
  {
    name: "ricardo r",
    rating: 5,
    text: "Todo perfecto. Muy profesional. Perfecto en el trato y el tratamiento. Muy recomendable.",
    badge: "Local Guide",
  },
  {
    name: "Kingsley Shaw",
    rating: 5,
    text: "Todo salió bien. Un servicio profesional.",
    badge: "Local Guide",
  },
  {
    name: "Laura G.U.",
    rating: 5,
    text: "Salí nueva, en paz con mi cuerpo y conmigo misma",
    badge: "Local Guide",
  },
  {
    name: "Elias Garcia Martinez",
    rating: 5,
    text: "Katy me ha ayudado en la recuperación de una lesión de rodilla y a desinflamar y tratar el dolor. Tiene un trato muy agradable y respetuoso, es una gran profesional. Sin duda la recomiendo.",
  },
  {
    name: "Amanda",
    rating: 5,
    text: "He acudido en varias ocasiones por problemas de espalda. El masaje en sí está genial, graduando presión aplicada y movimientos adecuados. Pero lo que más me gusta es que tiene una visión global de la persona, no sólo ve el problema muscular concreto sino los hábitos de vida, características personales individuales... Me hace mucho bien acudir a su sala.",
  },
];

export const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
export const reviewCount = reviews.length;
