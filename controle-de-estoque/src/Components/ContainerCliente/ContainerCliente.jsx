
import './ContainerCliente.css'
export default function ContainerCliente({ cliente, children }) {
  return (
    <div className="root-container-cliente">
      <div className="cliente">{cliente}</div>
      <div className='pedidos-content'>{children} </div>
        
    </div>
 
  );
}
