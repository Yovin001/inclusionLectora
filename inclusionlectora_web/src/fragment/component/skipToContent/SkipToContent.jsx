import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import '../../../css/SaltoContenido_Style.css';

const SkipToContent = ({ targetId, label, focusableElement = 'main', ...props }) => {
  const skipLinkRef = useRef(null);
  const targetRef = useRef(null);

  const handleSkip = (e) => {
    e.preventDefault();
    
    // Obtener el elemento objetivo
    const targetElement = targetRef.current || document.getElementById(targetId);
    
    if (targetElement) {
      // Hacer que el elemento sea enfocable si no lo es
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }
      
      targetElement.focus();
      targetElement.scrollIntoView({ behavior: 'smooth' });
      
      // Para lectores de pantalla
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = `Has saltado al ${label.toLowerCase()}`;
        setTimeout(() => liveRegion.textContent = '', 3000);
      }
    }
  };

  return (
    <>
      <a
        href={`#${targetId}`}
        ref={skipLinkRef}
        onClick={handleSkip}
        onKeyDown={(e) => e.key === 'Enter' && handleSkip(e)}
        className="skip-to-content-link"
        {...props}
      >
        {label}
      </a>
      
      {/* Referencia para componentes internos */}
      {props.children && React.cloneElement(props.children, { ref: targetRef })}
    </>
  );
};

SkipToContent.propTypes = {
  targetId: PropTypes.string.isRequired,
  label: PropTypes.string,
  focusableElement: PropTypes.string,
  children: PropTypes.element
};

SkipToContent.defaultProps = {
  label: 'Pasar al contenido principal',
  focusableElement: 'main'
};

export default SkipToContent;