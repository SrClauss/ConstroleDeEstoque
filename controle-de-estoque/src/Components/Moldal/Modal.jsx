import React, { useEffect } from 'react';
import './Modal.css'; // Certifique-se de criar um arquivo CSS para estilizar o modal

const Modal = ({ show, onClose, component}) => {
  if (!show) {
    return null;
  }



  return (
    <div>

    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" tabIndex={-1} onClick={onClose}>X</button>
        {React.cloneElement(component, { onSetComponentModal: onClose })}
      </div>
    </div>
    </div>
  );
};

export default Modal;