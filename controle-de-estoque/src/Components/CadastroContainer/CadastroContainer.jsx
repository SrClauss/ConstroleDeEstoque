import "./CadastroContainer.css";
export default function CadastroContainer({ children, title }) {
  return (
    <div className="root-cadastro-container">
      <div className="title">
        <div className="line"></div>
        <div>{title}</div>
        <div className="line"></div>
      </div>
      <div className="content">{children}</div>
      <div className="title">
        <div className="line"></div>
      </div>
    </div>
  );
}
