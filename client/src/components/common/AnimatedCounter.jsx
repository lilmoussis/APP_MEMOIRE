/**
 * Import des hooks React et de la fonction d'animation
 */
import { useEffect, useRef } from 'react'; // useRef pour référencer l'élément DOM, useEffect pour les effets de bord
import { animate } from 'framer-motion'; // Fonction d'animation de Framer Motion pour des transitions fluides

/**
 * Composant AnimatedCounter
 * Anime les transitions de valeurs numériques avec un effet de compteur
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {number} props.value - Valeur numérique finale à atteindre
 * @param {number} [props.duration=1.5] - Durée de l'animation en secondes
 * @param {string} [props.suffix=''] - Suffixe à afficher après la valeur (ex: "€", "%")
 * @param {string} [props.prefix=''] - Préfixe à afficher avant la valeur (ex: "$", "≈")
 * @param {number} [props.decimals=0] - Nombre de décimales à afficher
 * @param {string} [props.className=''] - Classes CSS additionnelles
 * 
 * @returns {JSX.Element} Élément span avec l'animation de valeur
 * 
 * @example
 * // Animation simple
 * <AnimatedCounter value={1000} />
 * 
 * // Animation avec suffixe et décimale
 * <AnimatedCounter value={99.5} suffix="%" decimals={1} />
 * 
 * // Animation rapide avec préfixe
 * <AnimatedCounter value={500} prefix="$" duration={0.5} />
 */
export default function AnimatedCounter({ 
  value,           // Valeur cible de l'animation
  duration = 1.5,  // Durée par défaut : 1.5 secondes
  suffix = '',     // Suffixe par défaut : aucune
  prefix = '',     // Préfixe par défaut : aucune
  decimals = 0,    // Nombre de décimales par défaut : 0 (entier)
  className = ''   // Classes CSS par défaut : aucune
}) {
  // Référence pour l'élément DOM où sera affichée la valeur
  const nodeRef = useRef(null);
  
  // Référence pour mémoriser la valeur précédente (pour animer depuis cette valeur)
  const prevValueRef = useRef(0);

  /**
   * useEffect qui gère l'animation à chaque changement de valeur
   * Se déclenche quand l'une des dépendances change
   */
  useEffect(() => {
    const node = nodeRef.current;
    // Sortie anticipée si l'élément DOM n'existe pas
    if (!node) return;

    // Valeur de départ (précédente) et valeur d'arrivée (cible)
    const from = prevValueRef.current;
    const to = value || 0; // Utilise 0 si value est undefined/null

    /**
     * Création de l'animation avec Framer Motion
     * animate(from, to, options) anime de `from` à `to`
     */
    const controls = animate(from, to, {
      duration,         // Durée de l'animation en secondes
      ease: 'easeOut',  // Courbe d'accélération : ralentit à la fin
      
      /**
       * Callback exécuté à chaque frame de l'animation
       * @param {number} currentValue - Valeur courante de l'animation
       */
      onUpdate(currentValue) {
        // Vérifie que l'élément DOM existe toujours
        if (node) {
          // Formate la valeur selon le nombre de décimales
          let formatted;
          if (decimals > 0) {
            // Pour les nombres à décimales : fixe le nombre de décimales
            formatted = currentValue.toFixed(decimals);
          } else {
            // Pour les entiers : arrondit et formate en français
            formatted = Math.round(currentValue).toLocaleString('fr-FR');
          }
          
          // Met à jour le contenu texte de l'élément avec préfixe et suffixe
          node.textContent = `${prefix}${formatted}${suffix}`;
        }
      }
    });

    // Met à jour la référence de valeur précédente pour la prochaine animation
    prevValueRef.current = to;

    /**
     * Fonction de nettoyage : arrête l'animation si le composant est démonté
     * ou si une nouvelle animation démarre avant la fin de la précédente
     */
    return () => controls.stop();
    
    // Tableau de dépendances : l'effet se relance si une de ces valeurs change
  }, [value, duration, suffix, prefix, decimals]);

  /**
   * Rendu initial
   * Affiche "0" ou la valeur avec préfixe/suffixe au montage initial
   * L'animation prendra le relais via useEffect
   */
  return (
    <span ref={nodeRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
}