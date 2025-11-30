import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

/**
 * Composant pour animer les valeurs numeriques
 */
export default function AnimatedCounter({ 
  value, 
  duration = 1.5, 
  suffix = '', 
  prefix = '',
  decimals = 0,
  className = ''
}) {
  const nodeRef = useRef(null);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const from = prevValueRef.current;
    const to = value || 0;

    const controls = animate(from, to, {
      duration,
      ease: 'easeOut',
      onUpdate(value) {
        if (node) {
          const formatted = decimals > 0 
            ? value.toFixed(decimals)
            : Math.round(value).toLocaleString('fr-FR');
          node.textContent = `${prefix}${formatted}${suffix}`;
        }
      }
    });

    prevValueRef.current = to;

    return () => controls.stop();
  }, [value, duration, suffix, prefix, decimals]);

  return <span ref={nodeRef} className={className}>{prefix}0{suffix}</span>;
}
