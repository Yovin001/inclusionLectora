import React from 'react';
import PropTypes from 'prop-types';
import '../../../css/SaltoContenido_Style.css';
const LiveRegion = ({ politeness = 'polite', ...props }) => (
  <div 
    id="a11y-live-region"
    aria-live={politeness}
    className="sr-only"
    {...props}
  />
);

LiveRegion.propTypes = {
  politeness: PropTypes.oneOf(['polite', 'assertive', 'off'])
};

export default LiveRegion;