// Faixa de mensagem que aparece no topo das telas

export default function Alerta({ tipo = 'sucesso', children, aoFechar }) {
  if (!children) return null;

  return (
    <div className={`alerta alerta--${tipo}`}>
      <span>{children}</span>
      {aoFechar && (
        <button type="button" className="alerta__fechar" onClick={aoFechar}>
          &times;
        </button>
      )}
    </div>
  );
}
